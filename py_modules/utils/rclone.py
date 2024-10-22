import subprocess
import asyncio
from asyncio.subprocess import create_subprocess_exec, Process
import decky
from plugin_config import PluginConfig
import os
import os.path
from glob import glob
from utils.constants import Constants


class RCloneManager:
    @staticmethod
    async def configure(backend_type:str):
        params=["--config", Constants.rclone_settings, "--log-file",
                    decky.DECKY_PLUGIN_LOG, "--log-format", "none", "-v", "config", "create", "backend", backend_type]
        decky.logger.info(f"Running command: {subprocess.list2cmdline([Constants.rclone_bin,*params])}")

        current_spawn = await create_subprocess_exec(Constants.rclone_bin, *params, stderr=asyncio.subprocess.PIPE)
        await current_spawn.wait()
        decky.logger.info(f"Result code: {current_spawn.returncode}")
        return current_spawn.returncode

    @staticmethod
    async def sync(winner: str, mode: int):
        decky.logger.info("Deleting lock files.")
        for hgx in glob(decky.HOME + "/.cache/rclone/bisync/*.lck"):
            os.remove(hgx)
            
        destination_path = PluginConfig.get_config_item("settings.remote.directory", "decky-cloud-sync")
        args = ["bisync", Constants.remote_dir, f"backend:{destination_path}", "--copy-links"]

        if mode == 0: 
            """Normal mode"""
            decky.logger.info("Performing standard sync")
            args.extend(["--conflict-resolve", winner])
        elif mode == 1:
            """For resync mode"""
            args.extend(["--resync-mode", winner, "--resync"])
            decky.logger.info("Performing resync")
        elif mode == 2:
            """For force mode"""
            args.extend(["--conflict-resolve", winner])
            args.extend(["--force"])
            decky.logger.info("Performing forced sync")

        threads = str(os.cpu_count())
        args.extend(["--transfers", threads, "--checkers", threads, "--config", Constants.rclone_settings, "--log-file",
                    decky.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])

        cmd = [Constants.rclone_bin, *args]
        decky.logger.info(f"Running command: {subprocess.list2cmdline(cmd)}")
        process = await create_subprocess_exec(*cmd)
        await process.wait()
        code = process.returncode
        decky.logger.info(f"Result code: {code}")

        return code


    