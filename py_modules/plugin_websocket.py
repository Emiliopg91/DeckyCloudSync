import asyncio
import websockets
import json
from typing import Set

class PluginWebsocket:
    connected_clients: Set[websockets.WebSocketServerProtocol] = set()
    server: websockets.WebSocketServer = None  # Variable de clase para almacenar el servidor WebSocket

    @staticmethod
    async def _handler(websocket, path):
        PluginWebsocket.connected_clients.add(websocket)
        print(f"Nuevo cliente conectado: {websocket.remote_address}")

        try:
            async for message in websocket:
                print(f"Mensaje recibido de {websocket.remote_address}: {message}")
                data = json.loads(message)

                response = await PluginWebsocket._process_message(data)
                response["type"] = "REPLY"
                response["id"] = data["id"]

                responseJson = json.dumps(response)
                print(f"Mensaje de respuesta: {responseJson}")

                await websocket.send(responseJson)
        except websockets.exceptions.ConnectionClosedError:
            print(f"Conexión cerrada inesperadamente: {websocket.remote_address}")
        finally:
            PluginWebsocket.connected_clients.remove(websocket)
            print(f"Cliente desconectado: {websocket.remote_address}")

    @staticmethod
    async def _send_message_to_clients(message: str):
        if PluginWebsocket.connected_clients:
            print(f"Enviando mensaje a {len(PluginWebsocket.connected_clients)} cliente(s)")
            await asyncio.gather(*[asyncio.create_task(client.send(message)) for client in PluginWebsocket.connected_clients])
        else:
            print("No hay clientes conectados.")

    @staticmethod
    async def initialize():
        # Iniciar el servidor WebSocket y almacenar la referencia en `PluginWebsocket.server`
        PluginWebsocket.server = await websockets.serve(PluginWebsocket._handler, "localhost", 8765)
        print("WebSocket listening on ws://localhost:8765")
        await PluginWebsocket.server.wait_closed()  # Esperar a que el servidor se cierre

    @staticmethod
    async def stop():
        if PluginWebsocket.server is not None:
            print("Deteniendo servidor WebSocket...")
            PluginWebsocket.server.close()  # Cerrar el servidor WebSocket
            await PluginWebsocket.server.wait_closed()  # Esperar a que se complete el cierre
            print("Servidor WebSocket detenido.")
        else:
            print("El servidor WebSocket no está en ejecución.")