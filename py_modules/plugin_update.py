import os
import stat
import urllib.request
import json
import ssl
import decky
import subprocess
import shutil
from plugin_config import PluginConfig

class PluginUpdate:
  @staticmethod 
  def recursive_chmod(path, perms, sudoPwd):
    if sudoPwd is not None and sudoPwd!="":
      subprocess.run(['sudo', '-S', 'chmod', "-R", "777", path],
                      input=sudoPwd.encode(), check=True)
    else: 
      for dirpath, dirnames, filenames in os.walk(path):
        current_perms = os.stat(dirpath).st_mode
        os.chmod(dirpath, current_perms | perms)
        for filename in filenames:
          os.chmod(os.path.join(dirpath, filename), current_perms | perms)

  @staticmethod
  def download_latest_build():
    url = PluginConfig.get_git_data()["releasesUrl"]
    decky.logger.info("Downloading plugin update")
    gcontext = ssl.SSLContext()

    response = urllib.request.urlopen(url, context=gcontext)
    json_data = json.load(response)

    download_url = json_data.get("assets")[0].get("browser_download_url")

    file_path = f'/tmp/{decky.DECKY_PLUGIN_NAME}.tar.gz'

    with urllib.request.urlopen(download_url, context=gcontext) as response, open(file_path, 'wb') as output_file:
      output_file.write(response.read())
      output_file.close()
    decky.logger.info("Downloaded!")

    return file_path

  @staticmethod
  def ota_update(sudoPwd):
    downloaded_filepath = PluginUpdate.download_latest_build()

    if os.path.exists(downloaded_filepath):
      PluginUpdate.recursive_chmod(f'{decky.DECKY_USER_HOME}/homebrew/plugins', stat.S_IWUSR, sudoPwd)
      shutil.rmtree(decky.DECKY_PLUGIN_DIR)
      shutil.unpack_archive(downloaded_filepath, f'{decky.DECKY_USER_HOME}/homebrew/plugins')
      os.remove(downloaded_filepath)

      return True