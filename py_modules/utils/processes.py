import os
import signal
import subprocess
import logger_utils

class Processes:
    @staticmethod
    def _get_process_tree(pid):
        """
        Retrieves the process tree of a given process ID.

        Parameters:
        pid (int): The process ID whose process tree is to be retrieved.

        Returns:
        list: A list of child process IDs.
        """
        children = []
        with subprocess.Popen(["ps", "--ppid", str(pid), "-o", "pid="], stdout=subprocess.PIPE) as p:
            lines = p.stdout.readlines()
        for chldPid in lines:
            chldPid = chldPid.strip()
            if not chldPid:
                continue
            children.extend([int(chldPid.decode())])

        return children;

    @staticmethod
    def send_signal(pid: int, signal: signal.Signals, parent: bool = True):
        """
        Sends a signal to a process and its child processes recursively.

        Parameters:
        pid (int): The process ID of the target process.
        signal (signal.Signals): The signal to send.

        Raises:
        Exception: If an error occurs while sending the signal.
        """
        try:
            if(parent):
                logger_utils.log("INFO", f"Sending signal {signal} to process PID {pid} and children.", pid, signal)

            os.kill(pid, signal)

            child_pids = Processes._get_process_tree(pid)

            for child_pid in child_pids:
                Processes.send_signal(child_pid, signal)
                
        except Exception as e:
            logger_utils.log("ERROR", "Error sending signal to process: %s", e)