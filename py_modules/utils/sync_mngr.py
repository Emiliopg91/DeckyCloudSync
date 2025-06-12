
from asyncio.subprocess import create_subprocess_exec, Process
from glob import glob
from plugin_config import PluginConfig
from plugin_logger import PluginLogger
from utils.constants import Constants
from utils.fs_sync import FsSync
from utils.rclone import RCloneManager
from plugin_websocket import PluginWebsocket

import asyncio
import decky
import time

class SyncManager:

    @staticmethod
    async def synchronize(winner:str, mode: str):
        asyncio.create_task(SyncManager._async_sync(winner, mode))

    
    @staticmethod
    async def _async_sync(winner: str, mode:str):
        PluginLogger.log("INFO", "=== STARTING SYNC ===")

        start_time = time.time()
        await decky.emit("syncStarted", mode)
        await PluginWebsocket.publish_event("syncStarted", mode)
        FsSync.copyToRemote()

        code = await RCloneManager.sync(winner, mode)
        if(code == 0):
            FsSync.copyFromRemote()

        elapsed = (time.time() - start_time) * 1000

        await decky.emit("syncEnded", code, elapsed)
        await PluginWebsocket.publish_event("syncEnded", code, elapsed)

        PluginLogger.log("INFO", '=== FINISHING SYNC ===')
