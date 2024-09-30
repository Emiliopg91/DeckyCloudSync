import { Backend } from 'decky-plugin-framework';

import { Signal } from '../models/signals';
import { Winners as Winner } from '../models/winners';

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class BackendUtils {
  public static async configure(): Promise<string> {
    return Backend.backend_call<[], string>('configure');
  }

  public static async getBackendType(): Promise<string> {
    return Backend.backend_call<[], string>('get_backend_type');
  }

  public static async rcloneSync(winner: Winner, resync: boolean): Promise<number> {
    return Backend.backend_call<[winner: string, resync: boolean], number>(
      'rclone_sync',
      Winner[winner],
      resync
    );
  }

  public static async fsSync(localToRemote: boolean): Promise<void> {
    return Backend.backend_call<[localToRemote: boolean], void>('fs_sync', localToRemote);
  }

  public static async sendSignal(pid: number, signal: Signal): Promise<void> {
    return Backend.backend_call<[pid: number, signal: number], void>('send_signal', pid, signal);
  }
}
