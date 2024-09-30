import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import plugin_config
import logger_utils
import signal
from utils.rclone import RCloneManager
from utils.processes import Processes
from utils.fs_sync import FsSync

class Plugin:
    
# Configuration
    async def get_config(self):
        decky.logger.debug("Executing: get_config()")
        return plugin_config.get_config()

    async def set_config(self, key: str, value):
        decky.logger.debug("Executing: set_config(%s, %s)", key, str(value))
        plugin_config.set_config(key, value)

# Logger

    async def log(self, level: str, msg: str) -> int:
        decky.logger.debug("Executing: log()")
        return logger_utils.log(level, msg)

    async def get_plugin_log(self) -> str:
        decky.logger.debug("Executing: get_plugin_log()")
        return logger_utils.get_plugin_log()
    
# Lifecycle

    async def _main(self):
        logger_utils.configure_logger()
        decky.logger.info("Running "+decky.DECKY_PLUGIN_NAME)

    async def _unload(self):
        decky.logger.info("Unloading "+decky.DECKY_PLUGIN_NAME)

    async def _migration(self):
        decky.logger.info("Migrating plugin configuration")
        plugin_config.migrate()

# Setup

    async def configure(self):
        decky.logger.info("Executing: configure()")
        return await RCloneManager.configure()

    async def get_backend_type(self):
        decky.logger.debug(
            "Executing: RcloneSetupManager.get_backend_type()")
        return RCloneManager.get_backend_type()

# Sync

    async def rclone_sync(self, winner: str, resync: bool) :
        decky.logger.debug(f"Executing: rclone_sync({winner}, {resync})")
        return RCloneManager.sync(winner,resync)
    
    async def fs_sync(self, local_to_remote:bool):
        decky.logger.debug(f"Executing: fs_sync({local_to_remote})")
        if(local_to_remote):
            FsSync.copyToRemote()
        else:
            FsSync.copyFromRemote()
        
    
# Processes

    async def send_signal(self, pid: int, s: str):
        decky.logger.debug(f"Executing: send_signal({pid}, {s})")
        if s == "SIGSTOP":
            return Processes.send_signal(pid, signal.SIGSTOP)
        elif s == "SIGCONT":
            return Processes.send_signal(pid, signal.SIGCONT)
