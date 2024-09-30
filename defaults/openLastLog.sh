#!/usr/bin/env bash

clear && tail -f ~/homebrew/logs/DeckyCloudSync/"$(ls -Art ~/homebrew/logs/DeckyCloudSync | tail -n 1)"
