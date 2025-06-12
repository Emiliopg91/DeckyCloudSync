import asyncio
import websockets
import json
import traceback
from typing import Set
from plugin_logger import PluginLogger

class PluginWebsocket:

    wsIp="0.0.0.0"
    wsPort=8765
    
    connected_clients: Set[websockets.WebSocketServerProtocol] = set()
    server: websockets.WebSocketServer = None
    plugin = None

    @staticmethod
    async def _handler(websocket, path):
        PluginWebsocket.connected_clients.add(websocket)
        PluginLogger.log("DEBUG", f"New client connected: {websocket.remote_address}")

        response = {}

        async for message in websocket:
            PluginLogger.log("DEBUG", f"Message received from {websocket.remote_address}: {message}")
            data = json.loads(message)
            
            try:
                response = await PluginWebsocket._process_message(data)
            except websockets.exceptions.ConnectionClosedError:
                PluginLogger.log("DEBUG", f"Connection closed unexpectedly: {websocket.remote_address}")
                PluginWebsocket.connected_clients.remove(websocket)
                PluginLogger.log("DEBUG", f"Client disconnected: {websocket.remote_address}")
            except Exception as e:
                PluginLogger.log("DEBUG", f"An error occurred: {e}")
                response["error"] = traceback.format_exc()

            response["type"] = "REPLY"
            response["id"] = data["id"]

            responseJson = json.dumps(response)
            PluginLogger.log("DEBUG", f"Response message: {responseJson}")

            await websocket.send(responseJson)

    @staticmethod
    async def _process_message(data: dict):
        method = data.get("method")
        params = data.get("params", [])

        if method:
            func = getattr(PluginWebsocket.plugin, method, None)
            if callable(func):
                result = await func(*params)
                return {"result": result}
            else:
                return {"error": f"'{method}' not callable or doesn't exist."}

        return {"error": "Bad request, missing method name"}

    @staticmethod
    async def publish_event(name, *args):
        if PluginWebsocket.connected_clients:
            data = { 
                "type": "EVENT",
                "name": name,
                "params": args
            }
            message = json.dumps(data)
            PluginLogger.log("DEBUG", f"Sending message '{message}' to {len(PluginWebsocket.connected_clients)} clients")
            await asyncio.gather(*[asyncio.create_task(client.send(message)) for client in PluginWebsocket.connected_clients])
        else:
            PluginLogger.log("DEBUG", "No clients connected.")

    @staticmethod
    async def initialize(plugin):
        PluginWebsocket.server = await websockets.serve(PluginWebsocket._handler, PluginWebsocket.wsIp, PluginWebsocket.wsPort)
        PluginWebsocket.plugin = plugin
        PluginLogger.log("INFO", f"WebSocket listening on ws://{PluginWebsocket.wsIp}:{PluginWebsocket.wsPort}")
        await PluginWebsocket.server.wait_closed()

    @staticmethod
    async def stop():
        if PluginWebsocket.server is not None:
            PluginLogger.log("INFO", "Stopping WebSocket server...")
            PluginWebsocket.server.close()
            await PluginWebsocket.server.wait_closed()
            PluginLogger.log("INFO", "WebSocket server stopped.")
        else:
            PluginLogger.log("DEBUG", "The WebSocket server is not running.")
