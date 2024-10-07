import subprocess
import asyncio
from asyncio.subprocess import create_subprocess_exec, Process
import decky
import logger_utils
from plugin_config import PluginConfig
import os
import os.path
from glob import glob
from utils.constants import Constants


class RCloneManager:
    running_instance: Process | None =   None

    @staticmethod
    async def configure(backend_type:str):
        params=["--config", Constants.rclone_settings, "--log-file",
                    decky.DECKY_PLUGIN_LOG, "--log-format", "none", "-v", "config", "create", "backend", backend_type]
        logger_utils.log("INFO", f"Running command: {subprocess.list2cmdline([Constants.rclone_bin,*params])}")

        current_spawn = await create_subprocess_exec(Constants.rclone_bin, *params, stderr=asyncio.subprocess.PIPE)
        await current_spawn.wait()
        logger_utils.log("INFO", f"Result code: {current_spawn.returncode}")
        return current_spawn.returncode

    @staticmethod
    async def sync(winner: str, mode: int):
        logger_utils.log("INFO", "Deleting lock files.")
        for hgx in glob(decky.HOME + "/.cache/rclone/bisync/*.lck"):
            os.remove(hgx)
            
        destination_path = PluginConfig.get_config_item("settings.remote.directory", "decky-cloud-sync")
        args = ["bisync", Constants.remote_dir, f"backend:{destination_path}", "--copy-links"]

        if mode == 0: 
            """Normal mode"""
            logger_utils.log("INFO","Performing standard sync")
            args.extend(["--conflict-resolve", winner])
        elif mode == 1:
            """For resync mode"""
            args.extend(["--resync-mode", winner, "--resync"])
            logger_utils.log("INFO","Performing resync")
        elif mode == 2:
            """For force mode"""
            args.extend(["--conflict-resolve", winner])
            args.extend(["--force"])
            logger_utils.log("INFO","Performing forced sync")

        threads = str(os.cpu_count())
        args.extend(["--transfers", threads, "--checkers", threads, "--config", Constants.rclone_settings, "--log-file",
                    decky.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])

        cmd = [Constants.rclone_bin, *args]

        logger_utils.log("INFO", f"Running command: {subprocess.list2cmdline(cmd)}")
        RCloneManager.running_instance = await create_subprocess_exec(*cmd)
        return True
    
    def check_status() -> int:
        if RCloneManager.running_instance is None or RCloneManager.running_instance.returncode is None:
            return -1
        
        code = RCloneManager.running_instance.returncode
        RCloneManager.running_instance = None
        logger_utils.log("INFO", f"Result code: {code}")
        return code
            