import subprocess
import asyncio
from asyncio.subprocess import Process, create_subprocess_exec
import decky
import logger_utils
import plugin_config
import fs_sync
import re
import os
import os.path
from glob import glob
from utils.constants import Constants


class RCloneManager:
    
    @staticmethod
    async def _get_url_from_rclone_process(process: asyncio.subprocess.Process):
        while True:
            line = (await process.stderr.readline()).decode()
            url_re_match = re.search(
                "(http:\/\/127\.0\.0\.1:53682\/auth\?state=.*)\\n$", line)
            if url_re_match:
                return url_re_match.group(1)

    @staticmethod
    async def configure():
        logger_utils.log("INFO", "Updating rclone.conf")

        current_spawn = await create_subprocess_exec(Constants.rclone_bin, *(["--config", Constants.rclone_settings, "config", "create", "backend", backend_type]), stderr=asyncio.subprocess.PIPE)

        url = await RCloneManager._get_url_from_rclone_process(current_spawn)
        logger_utils.log("INFO", "Login URL: %s", url)

        return url
    
    @staticmethod
    def get_backend_type():
        return plugin_config.get_config_item("settings.remote.type")

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

        fs_sync.copyToRemote()

        logger_utils.log("INFO", f"Running command: {subprocess.list2cmdline(cmd)}")
        result = subprocess.run(cmd)
        logger_utils.log("INFO", f"Result code: {result.returncode}")
        return result.returncode
    