# pylint: disable=missing-module-docstring, line-too-long

import json
import os
import shutil
import fnmatch
import time

import decky  # pylint: disable=import-error
from utils.constants import Constants


class FsSync:

    @staticmethod
    def find_files(base_path, pattern):
        """Function to find files matching a pattern"""
        matches = []
        for root, _, filenames in os.walk(base_path):
            for filename in filenames:
                filepath = os.path.join(root, filename)
                if fnmatch.fnmatch(filepath, pattern):
                    matches.append(filepath)
        return matches

    @staticmethod
    def read_json(file_path):
        """Function to read the JSON configuration file"""
        with open(file_path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_modification_time(file_path):
        """Function to get the modification time of a file"""
        return os.path.getmtime(file_path)

    @staticmethod
    def get_file_size(file_path):
        """Function to get the size of a file"""
        return os.path.getsize(file_path)

    @staticmethod
    def get_relative_path(file_path, base_path):
        """Function to get the relative path from a base path"""
        return os.path.relpath(file_path, base_path)

    @staticmethod
    def copy_with_timestamps(src_file, dest_file):
        """Function to copy a file and preserve its timestamps"""
        shutil.copy2(src_file, dest_file)

    @staticmethod
    def should_delete_file(relative_path, inclusions, exclusions):
        """Check if a file should be deleted based on inclusions and exclusions."""
        included = any(
            fnmatch.fnmatch(relative_path, pattern) for pattern in inclusions
        )
        excluded = any(
            fnmatch.fnmatch(relative_path, pattern) for pattern in exclusions
        )
        return included and not excluded

    @staticmethod
    def process_entry(entry_name, inclusions, exclusions, dest_folder, src_folder):
        """Process entry"""
        # Initialize counters and log
        created_files = 0
        modified_files = 0
        deleted_files = 0
        total_size = 0  # Variable to accumulate the total size of copied files
        log_entries = []

        decky.logger.info(f"  Processing {entry_name}")

        # Process inclusions
        files_to_copy = set()
        for inclusion_pattern in inclusions:
            matched_files = FsSync.find_files(src_folder, inclusion_pattern)
            files_to_copy.update(matched_files)

        # Filter files to copy, excluding the necessary ones
        files_to_copy = {
            file
            for file in files_to_copy
            if file.replace(src_folder + "/", "") not in exclusions
        }

        # Create the destination directory if it does not exist
        os.makedirs(dest_folder, exist_ok=True)

        # Remove files that are no longer in the source
        for root, dirs, files in os.walk(dest_folder, topdown=False):
            for name in files:
                dest_file = os.path.join(root, name)
                relative_path = FsSync.get_relative_path(dest_file, dest_folder)
                src_file = os.path.join(src_folder, relative_path)

                if not os.path.exists(src_file) and FsSync.should_delete_file(
                    relative_path, inclusions, exclusions
                ):
                    os.remove(dest_file)
                    deleted_files += 1
                    log_entries.append((relative_path, "(-)"))

            for name in dirs:
                dest_dir = os.path.join(root, name)
                relative_path = FsSync.get_relative_path(dest_dir, dest_folder)
                src_dir = os.path.join(src_folder, relative_path)

                if not os.path.isdir(src_dir):
                    for inclusion_pattern in inclusions:
                        if any(
                            fnmatch.fnmatch(file, inclusion_pattern)
                            for file in os.listdir(dest_dir)
                        ):
                            shutil.rmtree(dest_dir)
                            break

        # Copy files to the destination
        for file in files_to_copy:
            relative_path = FsSync.get_relative_path(file, src_folder)
            dest_file = os.path.join(dest_folder, relative_path)

            if os.path.exists(dest_file):
                if FsSync.get_modification_time(file) > FsSync.get_modification_time(
                    dest_file
                ):
                    FsSync.copy_with_timestamps(file, dest_file)
                    modified_files += 1
                    total_size += FsSync.get_file_size(
                        file
                    )  # Count size only if the file is modified
                    log_entries.append((relative_path, "(m)"))
            else:
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                FsSync.copy_with_timestamps(file, dest_file)
                created_files += 1
                total_size += FsSync.get_file_size(
                    file
                )  # Count size only if the file is created
                log_entries.append((relative_path, "(+)"))

        # Sort log entries alphabetically by relative path, ignoring case
        log_entries.sort(key=lambda x: x[0].casefold())

        # decky.logger.info log entries for the current entry
        for relative_path, action in log_entries:
            decky.logger.info(f"    {action} '{relative_path}'")

        return created_files, modified_files, deleted_files, total_size

    @staticmethod
    def format_size(size_bytes):
        """Format the size into the most appropriate unit: B, KB, MB, GB."""
        if size_bytes >= 1024**3:
            return f"{size_bytes / (1024**3):.2f} GB"
        if size_bytes >= 1024**2:
            return f"{size_bytes / (1024**2):.2f} MB"
        if size_bytes >= 1024:
            return f"{size_bytes / 1024:.2f} KB"
        return f"{size_bytes:.2f} B"

    @staticmethod
    def format_speed(speed_bytes_per_sec):
        """Format the speed into the most appropriate unit: B/s, KB/s, MB/s, GB/s."""
        if speed_bytes_per_sec >= 1024**3:
            return f"{speed_bytes_per_sec / (1024**3):.2f} GB/s"
        if speed_bytes_per_sec >= 1024**2:
            return f"{speed_bytes_per_sec / (1024**2):.2f} MB/s"
        if speed_bytes_per_sec >= 1024:
            return f"{speed_bytes_per_sec / 1024:.2f} KB/s"
        return f"{speed_bytes_per_sec:.2f} B/s"

    @staticmethod
    def copyToRemote():
        """Copy entries to remote"""
        decky.logger.info("")
        decky.logger.info("Copying to remote")

        created_files = 0
        modified_files = 0
        deleted_files = 0
        total_size = 0  # Variable to accumulate the total size of copied files

        start_time = time.time()  # Record start time

        # Read the JSON configuration file
        data = FsSync.read_json(Constants.plugin_settings)["entries"]

        # Process each entry in the JSON
        for entry_name, details in sorted(data.items()):
            folder_path = details["folder"]
            inclusions = details.get("inclusions", ["*"])
            exclusions = set(details.get("exclusions", []))
            c, m, d, size = FsSync.process_entry(
                entry_name,
                inclusions,
                exclusions,
                Constants.remote_dir + "/" + entry_name,
                folder_path,
            )
            created_files += c
            modified_files += m
            deleted_files += d
            total_size += size

        end_time = time.time()  # Record end time
        elapsed_time = end_time - start_time  # Calculate elapsed time
        display_time = round(elapsed_time * 1000) / 1000

        # Calculate speed
        speed = total_size / elapsed_time if elapsed_time > 0 else 0

        # decky.logger.info summary in a single line
        decky.logger.info("")
        decky.logger.info(
            f"Created: {created_files}, Modified: {modified_files}, Deleted: {deleted_files}"
        )
        decky.logger.info(
            f"Copied: {FsSync.format_size(total_size)} in {display_time} seconds ({FsSync.format_speed(speed)})"
        )
        decky.logger.info("")

    @staticmethod
    def copyFromRemote():
        """Copy entries from remote"""
        decky.logger.info("")
        decky.logger.info("Copying to local")

        created_files = 0
        modified_files = 0
        deleted_files = 0
        total_size = 0  # Variable to accumulate the total size of copied files

        start_time = time.time()  # Record start time

        # Read the JSON configuration file
        data = FsSync.read_json(Constants.plugin_settings)["entries"]

        # Process each entry in the JSON
        for entry_name, details in sorted(data.items()):
            folder_path = details["folder"]
            inclusions = details.get("inclusions", ["*"])
            exclusions = set(details.get("exclusions", []))
            c, m, d, size = FsSync.process_entry(
                entry_name,
                inclusions,
                exclusions,
                folder_path,
                Constants.remote_dir + "/" + entry_name,
            )
            created_files += c
            modified_files += m
            deleted_files += d
            total_size += size

        end_time = time.time()  # Record end time
        elapsed_time = end_time - start_time  # Calculate elapsed time
        display_time = round(elapsed_time * 1000) / 1000

        # Calculate speed
        speed = total_size / elapsed_time if elapsed_time > 0 else 0

        # decky.logger.info summary in a single line
        decky.logger.info("")
        decky.logger.info(
            f"Created: {created_files}, Modified: {modified_files}, Deleted: {deleted_files}"
        )
        decky.logger.info(
            f"Copied: {FsSync.format_size(total_size)} in {display_time} seconds ({FsSync.format_speed(speed)})"
        )
        decky.logger.info("")

    @staticmethod
    def simulate_for_entry(entry: dict):
        """Perform dry run"""
        # Process inclusions
        files_to_copy = set()
        for inclusion_pattern in entry["inclusions"]:
            matched_files = FsSync.find_files(entry["folder"], inclusion_pattern)
            files_to_copy.update(matched_files)

        # Filter files to copy, excluding the necessary ones
        files_to_copy = {
            file
            for file in files_to_copy
            if os.path.basename(file) not in entry["exclusions"]
        }

        return files_to_copy

    @staticmethod
    def copyFolderToLocal(directory: str) -> int:
        """Copy folder to local"""
        decky.logger.info("")
        decky.logger.info(f"Copying {directory} to local")

        copied_files = 0
        total_size = 0  # Variable to accumulate the total size of copied files

        start_time = time.time()  # Record start time

        # Read the JSON configuration file
        data = FsSync.read_json(Constants.plugin_settings)["entries"]

        # Process each entry in the JSON
        for entry_name, details in sorted(data.items()):
            if entry_name == directory:
                src_path = Constants.remote_dir + "/" + entry_name
                dst_path = details["folder"]
                decky.logger.info(f"  Destination folder: {dst_path}")

                for root, dirs, files in os.walk(src_path):
                    dirs.sort()
                    files = sorted(files)
                    relative_path = os.path.relpath(root, src_path)
                    dest_dir = os.path.join(dst_path, relative_path)

                    if not os.path.exists(dest_dir):
                        os.makedirs(dest_dir)

                    for file in files:
                        src_file = os.path.join(root, file)
                        dest_file = os.path.join(dest_dir, file).replace("/./", "/")
                        FsSync.copy_with_timestamps(src_file, dest_file)
                        copied_files += 1
                        total_size += os.path.getsize(dest_file)
                        decky.logger.info(
                            f"    Copied ./{os.path.relpath(src_file, src_path)}"
                        )

        end_time = time.time()  # Record end time
        elapsed_time = end_time - start_time  # Calculate elapsed time
        display_time = round(elapsed_time * 1000) / 1000

        # Calculate speed
        speed = total_size / elapsed_time if elapsed_time > 0 else 0

        decky.logger.info("")
        decky.logger.info(
            f"Copied {copied_files} files, {FsSync.format_size(total_size)} in {display_time} seconds ({FsSync.format_speed(speed)})"
        )
        decky.logger.info("")

        return copied_files
