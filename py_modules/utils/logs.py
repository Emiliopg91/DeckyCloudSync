import decky
import re

class LogManager:

    @staticmethod
    def get_last_sync_log() -> str:
        """
        Retrieves the last synchronization log.

        Returns:
        str: The last synchronization log.
        """

        record: bool = False

        log: str = ""
        
        with open(decky.DECKY_PLUGIN_LOG) as f:
            for line in reversed(list(f)):
                if(record == False):
                    if "=== FINISHING SYNC ===" in line:
                        record = True
                else:
                    if "=== STARTING SYNC ===" in line:
                        break
                    else:
                        log = line + '\n' + log  
        return log

    @staticmethod
    def get_plugin_log() -> str:
        """
        Retrieves the entire plugin log.

        Returns:
        str: The plugin log.
        """
        log: str = ""
        with open(decky.DECKY_PLUGIN_LOG) as f:
            for line in reversed(list(f)):
                log = line + '\n' + log  
                if "Logger initialized at level" in line.strip():
                    break
        return log
    
    @staticmethod
    def get_config_url() -> str:
        with open(decky.DECKY_PLUGIN_LOG) as f:
            for line in reversed(list(f)):
                if "http://127.0.0.1:53682/auth?" in line.strip():
                    return re.search(r"http[s]?://[^\s]+", line.strip()).group()
        return ""  