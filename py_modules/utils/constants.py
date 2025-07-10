# pylint: disable=missing-module-docstring

import decky  # pylint: disable=import-error


class Constants:  # pylint: disable=too-few-public-methods
    """Constants class"""

    rclone_bin = decky.DECKY_PLUGIN_DIR + "/bin/rclone"
    plugin_settings = decky.DECKY_PLUGIN_SETTINGS_DIR + "/plugin.json"
    rclone_settings = decky.DECKY_PLUGIN_SETTINGS_DIR + "/rclone.cfg"

    # Common remote directory
    remote_dir = decky.DECKY_PLUGIN_RUNTIME_DIR + "/remote"
