
from asyncio.subprocess import create_subprocess_exec, Process
from glob import glob
from plugin_config import PluginConfig
from plugin_logger import PluginLogger
from utils.constants import Constants
from utils.fs_sync import FsSync
from utils.rclone import RCloneManager

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
        FsSync.copyToRemote()

        code = await RCloneManager.sync(winner, mode)
        if(code == 0):
            FsSync.copyFromRemote()

        PluginLogger.log("INFO", '=== FINISHING SYNC ===')
        await decky.emit("syncEnded", code)
