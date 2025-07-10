# pylint: disable=missing-module-docstring, line-too-long, broad-exception-caught

import os
import signal
import subprocess

import decky  # pylint: disable=import-error


class Processes:
    """Class for manage processes"""

    @staticmethod
    def _get_process_tree(pid):
        """Retrieves the process tree of a given process ID."""
        children = []
        with subprocess.Popen(
            ["ps", "--ppid", str(pid), "-o", "pid="], stdout=subprocess.PIPE
        ) as p:
            lines = p.stdout.readlines()
        for child_pid in lines:
            child_pid = child_pid.strip()
            if not child_pid:
                continue
            children.extend([int(child_pid.decode())])

        return children

    @staticmethod
    def send_signal(
        pid: int, signal_to_send: signal.Signals, parent: bool = True
    ) -> int:
        """Sends a signal to a process and its child processes recursively"""
        try:
            if parent:
                decky.logger.info(
                    f"Sending signal {signal_to_send} to process PID {pid} and children."
                )

            os.kill(pid, signal_to_send)
            count = 1

            child_pids = Processes._get_process_tree(pid)
            for child_pid in child_pids:
                count = count + Processes.send_signal(child_pid, signal_to_send, False)

            if parent:
                decky.logger.info(f"Signaled {count} processes")
            return count
        except Exception as e:
            decky.logger.error(f"Error sending signal to process: {e}")
        return 0
