import { Backend } from 'decky-plugin-framework';

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class BackendUtils {
  public static async configure(): Promise<string> {
    return Backend.backend_call<[], string>('configure');
  }

  public static async get_backend_type(): Promise<string> {
    return Backend.backend_call<[], string>('get_backend_type');
  }

  public static async rclone_sync(winner: string, resync: boolean): Promise<number> {
    return Backend.backend_call<[winner: string, resync: boolean], number>(
      'rclone_sync',
      winner,
      resync
    );
  }

  public static async fs_sync(local_to_remote: boolean): Promise<void> {
    return Backend.backend_call<[local_to_remote: boolean], void>('fs_sync', local_to_remote);
  }

  public static async send_signal(pid: number, signal: string): Promise<void> {
    return Backend.backend_call<[pid: number, signal: string], void>('send_signal', pid, signal);
  }
}
