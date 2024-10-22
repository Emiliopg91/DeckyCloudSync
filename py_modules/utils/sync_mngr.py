
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
import os
import subprocess

class SyncManager:

    @staticmethod
    async def synchronize(winner:str, mode: str):
        asyncio.create_task(SyncManager._async_sync(winner, mode))

    
    @staticmethod
    async def _async_sync(winner: str, mode:str):
        PluginLogger.log("INFO", "=== STARTING SYNC ===")
        await decky.emit("syncStarted")
        await PluginWebsocket.publish_event("syncStarted")
        FsSync.copyToRemote()

        code = await RCloneManager.sync(winner, mode)
        if(code == 0):
            FsSync.copyFromRemote()

        await decky.emit("syncEnded", code)
        await PluginWebsocket.publish_event("syncEnded", code)
        PluginLogger.log("INFO", '=== FINISHING SYNC ===')
