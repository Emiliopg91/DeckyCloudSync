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

class Plugin:

    
# Lifecycle 
    async def _main(self):
        PluginLogger.configure_logger()
        decky.logger.info("Running "+decky.DECKY_PLUGIN_NAME)

    async def _unload(self):
        decky.logger.info("Unloading "+decky.DECKY_PLUGIN_NAME)

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

    async def rclone_sync(self, winner: str, mode: int) :
        return await RCloneManager.sync(winner,mode)
    
    async def check_status(self) -> int:
        return RCloneManager.check_status()
    
# FileSystem sync

    async def fs_sync(self, local_to_remote:bool):
        if(local_to_remote):
            FsSync.copyToRemote()
        else:
            FsSync.copyFromRemote()

    async def copy_to_local(self, dir:str) -> int:
        return FsSync.copyFolderToLocal(dir)
        
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
    async def ota_update(self):
        try:
            return PluginUpdate.ota_update()
        except Exception as e:
            decky.logger.error(e)
            return False