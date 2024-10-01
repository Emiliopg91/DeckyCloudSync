import { Backend, Translator } from 'decky-plugin-framework';

import { Signal } from '../models/signals';
import { Winner } from '../models/winners';
import { Toast } from './toast';

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class BackendUtils {
  public static async getPluginLog(): Promise<string> {
    return '';
  }

  public static async getSyncLog(): Promise<string> {
    return '';
  }

  public static async configure(backend_type: string): Promise<string> {
    return Backend.backend_call<[backend_type: string], string>('configure', backend_type);
  }

  public static async rcloneSync(winner: Winner, resync: boolean): Promise<number> {
    return Backend.backend_call<[winner: string, resync: boolean], number>(
      'rclone_sync',
      winner,
      resync
    );
  }

  public static async fsSync(localToRemote: boolean): Promise<void> {
    return Backend.backend_call<[localToRemote: boolean], void>('fs_sync', localToRemote);
  }

  public static async sendSignal(pid: number, signal: Signal): Promise<void> {
    return Backend.backend_call<[pid: number, signal: number], void>('send_signal', pid, signal);
  }

  public static async doSynchronization(winner: Winner, resync: boolean): Promise<void> {
    await BackendUtils.fsSync(true);
    const returnCode = await BackendUtils.rcloneSync(winner, resync);

    if (returnCode != 0) {
      //TODO: action for opening log
      Toast.toast(Translator.translate('sync.failed'));
      return;
    }

    await BackendUtils.fsSync(false);
    Toast.toast(Translator.translate('sync.succesful'));
  }

  public static async doSynchronizationForGame(onStart: boolean, pid: number): Promise<void> {
    if (onStart) {
      await BackendUtils.sendSignal(pid, Signal.SIGSTOP);
    }

    BackendUtils.doSynchronization(onStart ? Winner.REMOTE : Winner.LOCAL, false);

    if (onStart) {
      await BackendUtils.sendSignal(pid, Signal.SIGCONT);
    }
  }
}
