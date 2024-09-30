import decky

class Constants:    
    rclone_bin = decky.DECKY_PLUGIN_DIR + "/bin/rclone"
    plugin_settings = decky.DECKY_PLUGIN_SETTINGS_DIR + "/plugin.json"
    rclone_settings = decky.DECKY_PLUGIN_SETTINGS_DIR + "/rclone.cfg"

    # Common remote directory
    remote_dir = decky.DECKY_PLUGIN_RUNTIME_DIR + "/remote"