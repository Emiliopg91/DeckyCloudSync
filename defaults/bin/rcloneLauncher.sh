#!/usr/bin/env bash

BINARIES_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CONFIG_DIR="$BINARIES_DIR/../../../settings/DeckyCloudSync"

exec "$BINARIES_DIR/rclone" "--config" "$CONFIG_DIR/rclone.conf" "$@"