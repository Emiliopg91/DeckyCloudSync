import subprocess
import asyncio
from asyncio.subprocess import create_subprocess_exec
import decky
import logger_utils
import plugin_config
import os
import os.path
from glob import glob
from utils.constants import Constants


class RCloneManager:

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
    def sync(winner: str, resync: bool) -> int:
        logger_utils.log("INFO", "Deleting lock files.")
        for hgx in glob(decky.HOME + "/.cache/rclone/bisync/*.lck"):
            os.remove(hgx)
            
        destination_path = plugin_config.get_config_item("settings.remote.directory", "decky-cloud-sync")
        args = ["bisync", Constants.remote_dir, f"backend:{destination_path}", "--copy-links"]

        if resync:
            args.extend(["--resync-mode", winner, "--resync"])
        else:
            args.extend(["--conflict-resolve", winner])

        args.extend(["--transfers", "8", "--checkers", "16", "--config", Constants.rclone_settings, "--log-file",
                    decky.DECKY_PLUGIN_LOG, "--log-format", "none", "-v"])

        cmd = [Constants.rclone_bin, *args]

        logger_utils.log("INFO", f"Running command: {subprocess.list2cmdline(cmd)}")
        result = subprocess.run(cmd)
        logger_utils.log("INFO", f"Result code: {result.returncode}")

        return result.returncode
    