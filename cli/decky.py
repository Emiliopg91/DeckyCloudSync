#!/usr/bin/env python3

from jobs.builder import Builder
from jobs.deployer import Deployer
import sys
import os
import shutil
from jobs.utils import Utils
from jobs.setup import Setup

class JobManager:
    def __init__(self):
        self.log_dir = os.path.join(Utils.plugin_dir, "logs")

    def run(self, options):
        if not options:
            print("Please select at least an option: build deploy setup.")
            return
        
        os.chmod(Utils.plugin_dir, 0o777)
        if os.path.exists(self.log_dir):
            shutil.rmtree(self.log_dir)

        if "deploy" in options or "setup" in options:
            Setup().check_settings()

        if "build" in options:
            Builder().build()
        
        if "deploy" in options:
            Deployer().deploy()

if __name__ == "__main__":
    options = sys.argv[1:]
    manager = JobManager()
    manager.run(options)