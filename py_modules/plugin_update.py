# pylint: disable=missing-module-docstring, line-too-long, broad-exception-caught, too-few-public-methods , consider-using-with

import os
import stat
import urllib.request
import json
import ssl
import subprocess
import shutil
from plugin_config import PluginConfig

import decky  # pylint: disable=import-error


class PluginUpdate:
    """Manage plugin updates"""

    @staticmethod
    def recursive_chmod(path, perms, sudo_pwd):
        """Peform recursive chmod"""
        if sudo_pwd is not None and sudo_pwd != "":
            subprocess.run(
                ["sudo", "-S", "chmod", "-R", "777", path],
                input=sudo_pwd.encode(),
                check=True,
            )
        else:
            for dirpath, _, filenames in os.walk(path):
                current_perms = os.stat(dirpath).st_mode
                os.chmod(dirpath, current_perms | perms)
                for filename in filenames:
                    os.chmod(os.path.join(dirpath, filename), current_perms | perms)

    @staticmethod
    def download_latest_build():
        """Download latest version"""
        url = PluginConfig.get_git_data()["releasesUrl"]
        decky.logger.info("Downloading plugin update")
        gcontext = ssl.SSLContext()

        response = urllib.request.urlopen(url, context=gcontext)
        json_data = json.load(response)

        download_url = json_data.get("assets")[0].get("browser_download_url")

        file_path = f"/tmp/{decky.DECKY_PLUGIN_NAME}.tar.gz"

        with urllib.request.urlopen(download_url, context=gcontext) as response, open(
            file_path, "wb"
        ) as output_file:
            output_file.write(response.read())
            output_file.close()
        decky.logger.info("Downloaded!")

        return file_path

    @staticmethod
    def ota_update(sudo_pwd):
        """Perform OTA update"""
        downloaded_filepath = PluginUpdate.download_latest_build()

        if os.path.exists(downloaded_filepath):
            PluginUpdate.recursive_chmod(
                f"{decky.DECKY_USER_HOME}/homebrew/plugins", stat.S_IWUSR, sudo_pwd
            )
            shutil.rmtree(decky.DECKY_PLUGIN_DIR)
            shutil.unpack_archive(
                downloaded_filepath, f"{decky.DECKY_USER_HOME}/homebrew/plugins"
            )
            os.remove(downloaded_filepath)

            return True

        return False
