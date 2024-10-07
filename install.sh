#!/usr/bin/bash
# does the following:
# - DeckyCloudSync Decky Plugin
if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi


echo "Removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/DeckyCloudSync

echo "Installing DeckyCloudSync for savedata cloud sync"
# download + install simple decky tdp
curl -L $(curl -s https://api.github.com/repos/Emiliopg91/DeckyCloudSync/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/DeckyCloudSync.tar.gz
sudo tar -xzf DeckyCloudSync.tar.gz -C $HOME/homebrew/plugins

# Install complete, remove build dir
rm  $HOME/DeckyCloudSync.tar.gz
sudo systemctl restart plugin_loader.service

echo "Installation complete"
