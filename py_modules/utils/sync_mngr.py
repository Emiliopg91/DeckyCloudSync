# pylint: disable=missing-module-docstring, line-too-long, broad-exception-caught, too-few-public-methods

import asyncio
import time

import decky  # pylint: disable=import-error

from plugin_logger import PluginLogger
from utils.fs_sync import FsSync
from utils.rclone import RCloneManager


class SyncManager:
    """Manager for syncronization"""

    @staticmethod
    async def synchronize(winner: str, mode: str):
        """Perform synchronization"""
        asyncio.create_task(SyncManager._async_sync(winner, mode))

    @staticmethod
    async def _async_sync(winner: str, mode: str):
        PluginLogger.log("INFO", "=== STARTING SYNC ===")

        start_time = time.time()
        await decky.emit("syncStarted", mode)
        FsSync.copyToRemote()

        code = await RCloneManager.sync(winner, mode)
        if code == 0:
            FsSync.copyFromRemote()

        elapsed = (time.time() - start_time) * 1000

        await decky.emit("syncEnded", code, elapsed)

        PluginLogger.log("INFO", "=== FINISHING SYNC ===")
