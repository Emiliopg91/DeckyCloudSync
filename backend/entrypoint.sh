#!/bin/sh
set -e

echo "Generating backend"
mkdir -p /backend/out/bin
cd /backend
unzip rclone.zip
cp rclone-*/rclone /backend/out/bin/rclone
rm -r rclone-*
echo "Generated backend"