# pylint: disable=missing-module-docstring, line-too-long

import re

import decky  # pylint: disable=import-error


class LogManager:
    """Manage log file"""

    @staticmethod
    def get_last_sync_log() -> str:
        """
        Retrieves the last synchronization log.

        Returns:
        str: The last synchronization log.
        """

        record: bool = False

        log: str = ""

        with open(decky.DECKY_PLUGIN_LOG, encoding="utf-8") as f:
            for line in reversed(list(f)):
                if not record:
                    if "=== FINISHING SYNC ===" in line:
                        record = True
                else:
                    if "=== STARTING SYNC ===" in line:
                        break
                    log = line + "\n" + log
        return log

    @staticmethod
    def get_plugin_log() -> str:
        """Retrieves the entire plugin log."""
        log: str = ""
        with open(decky.DECKY_PLUGIN_LOG, encoding="utf-8") as f:
            for line in reversed(list(f)):
                log = line + "\n" + log
                if "Logger initialized at level" in line.strip():
                    break
        return log

    @staticmethod
    def get_config_url() -> str:
        """Get config url from log"""
        with open(decky.DECKY_PLUGIN_LOG, encoding="utf-8") as f:
            for line in reversed(list(f)):
                if "http://127.0.0.1:53682/auth?" in line.strip():
                    return re.search(r"http[s]?://[^\s]+", line.strip()).group()
        return ""
