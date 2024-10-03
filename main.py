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
from utils.logs import LogManager
from utils.constants import Constants

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
        return logger_utils.log(level, msg)
    
# Lifecycle

    async def _main(self):
        logger_utils.configure_logger()
        decky.logger.info("Running "+decky.DECKY_PLUGIN_NAME)

    async def _unload(self):
        decky.logger.info("Unloading "+decky.DECKY_PLUGIN_NAME)

    async def _migration(self):
        decky.logger.info("Migrating plugin configuration")
        plugin_config.migrate()

# RClone

    async def configure(self, backend_type:str):
        decky.logger.info(f"Executing: configure({backend_type})")
        return await RCloneManager.configure(backend_type)

    async def rclone_sync(self, winner: str, resync: bool) :
        decky.logger.debug(f"Executing: rclone_sync({winner}, {resync})")
        return RCloneManager.sync(winner,resync)
    
# FileSystem sync

    async def fs_sync(self, local_to_remote:bool):
        decky.logger.debug(f"Executing: fs_sync({local_to_remote})")
        if(local_to_remote):
            FsSync.copyToRemote()
        else:
            FsSync.copyFromRemote()
        
# Processes

    async def send_signal(self, pid: int, s: str):
        decky.logger.debug(f"Executing: send_signal({pid}, {s})")
        return Processes.send_signal(pid, s)

# Logs

    async def get_last_sync_log(self) -> str:
        decky.logger.debug("Executing: get_last_sync_log()")
        return LogManager.get_last_sync_log()

    async def get_plugin_log(self) -> str:
        decky.logger.debug("Executing: get_plugin_log()")
        return LogManager.get_plugin_log()
    
    async def get_config_url(self) -> str:
        decky.logger.debug("Executing: get_config_url()")
        return LogManager.get_config_url()
    
# Misc
    async def get_home_dir(self) -> str:
        decky.logger.debug("Executing: get_home_dir()")
        return decky.HOME
    
    async def get_remote_dir(self) -> str:
        decky.logger.debug("Executing: get_remote_dir()")
        return Constants.remote_dir
