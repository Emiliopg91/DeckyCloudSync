import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
from plugin_config import PluginConfig
from plugin_update import PluginUpdate
from plugin_logger import PluginLogger
from utils.rclone import RCloneManager
from utils.processes import Processes
from utils.fs_sync import FsSync
from utils.logs import LogManager
from utils.constants import Constants
from plugin_websocket import PluginWebsocket
from utils.sync_mngr import SyncManager

class Plugin:

    
# Lifecycle 
    async def _main(self):
        PluginLogger.configure_logger()
        decky.logger.info("Running "+decky.DECKY_PLUGIN_NAME)
        await PluginWebsocket.initialize(self)

    async def _unload(self):
        decky.logger.info("Unloading "+decky.DECKY_PLUGIN_NAME)
        await PluginWebsocket.stop()

    async def _migration(self):
        decky.logger.info("Migrating plugin configuration")
        PluginConfig.migrate()

# Configuration

    async def get_config(self):
        return PluginConfig.get_config()

    async def set_config(self, key: str, value):
        PluginConfig.set_config(key, value)

    async def delete_config(self, key: str):
        PluginConfig.delete_config(key)

# Logger

    async def log(self, level: str, msg: str) -> int:
        return PluginLogger.log(level, msg)

# RClone

    async def configure(self, backend_type:str):
        return await RCloneManager.configure(backend_type)
    
# FileSystem sync

    async def copy_to_local(self, dir:str) -> int:
        return FsSync.copyFolderToLocal(dir)
    
# SyncManager
    async def sync(self, winner:str, mode:int):
        await SyncManager.synchronize(winner, mode)
        
# Processes

    async def send_signal(self, pid: int, s: str):
        return Processes.send_signal(pid, s)

# Logs

    async def get_last_sync_log(self) -> str:
        return LogManager.get_last_sync_log()

    async def get_plugin_log(self) -> str:
        return LogManager.get_plugin_log()
    
    async def get_config_url(self) -> str:
        return LogManager.get_config_url()
    
# Misc
    async def get_home_dir(self) -> str:
        return decky.HOME
    
    async def get_remote_dir(self) -> str:
        return Constants.remote_dir
    
#Plugin update
    async def ota_update(self, _sudoPwd=None):
        try:
            return PluginUpdate.ota_update(_sudoPwd)
        except Exception as e:
            decky.logger.error(e)
            return False