import { Navigation } from '@decky/ui';
import { Mutex } from 'async-mutex';
import { Backend, Logger, Translator } from 'decky-plugin-framework';

import { Signal } from '../models/signals';
import { SyncMode } from '../models/syncModes';
import { Winner } from '../models/winners';
import { Constants } from './constants';
import { NavigationUtil } from './navigation';
import { Toast } from './toast';
import { WhiteBoardUtil } from './whiteboard';

/**
 * The Backend class provides access to plugin Python backend methods
 */
export class BackendUtils {
  private static SYNC_MUTEX: Mutex = new Mutex();

  public static getConfigUrl(): Promise<string> {
    return Backend.backend_call<[], string>('get_config_url');
  }
  public static async getPluginLog(): Promise<string> {
    return Backend.backend_call<[], string>('get_plugin_log');
  }

  public static async getSyncLog(): Promise<string> {
    return Backend.backend_call<[], string>('get_last_sync_log');
  }

  public static async configure(backend_type: string): Promise<number> {
    return Backend.backend_call<[backend_type: string], number>('configure', backend_type);
  }

  public static async rcloneSync(winner: Winner, mode: SyncMode): Promise<number> {
    return Backend.backend_call<[winner: string, mode: number], number>(
      'rclone_sync',
      winner,
      mode
    );
  }

  public static async fsSync(localToRemote: boolean): Promise<void> {
    return Backend.backend_call<[localToRemote: boolean], void>('fs_sync', localToRemote);
  }

  public static async sendSignal(pid: number, signal: Signal): Promise<void> {
    return Backend.backend_call<[pid: number, signal: number], void>('send_signal', pid, signal);
  }

  public static async getHomeDir(): Promise<string> {
    return Backend.backend_call<[], string>('get_home_dir');
  }

  public static async getRemoteDir(): Promise<string> {
    return Backend.backend_call<[], string>('get_remote_dir');
  }

  public static async doSynchronization(winner: Winner, mode: SyncMode): Promise<void> {
    return new Promise<void>((resolve) => {
      if (BackendUtils.SYNC_MUTEX.isLocked()) {
        Toast.toast(Translator.translate('waiting.previous.sync'));
      }
      BackendUtils.SYNC_MUTEX.acquire().then(async (release) => {
        switch (mode) {
          case SyncMode.NORMAL:
            Toast.toast(Translator.translate('synchronizing.savedata'));
            break;
          case SyncMode.RESYNC:
            Toast.toast(Translator.translate('resynchronizing.savedata'));
            break;
          case SyncMode.FORCE:
            Toast.toast(Translator.translate('forcing.sync'));
            break;
        }
        Logger.info('=== STARTING SYNC ===');
        const t0 = Date.now();
        WhiteBoardUtil.setSyncInProgress(true);
        try {
          await BackendUtils.fsSync(true);
          const returnCode = await BackendUtils.rcloneSync(winner, mode);

          if (returnCode != 0) {
            Toast.toast(Translator.translate('sync.failed'), 5000, () => {
              NavigationUtil.openLogPage(true);
            });
            WhiteBoardUtil.setSyncInProgress(false);
            Logger.info('=== FINISHING SYNC ===');
            release();
            resolve();
            return;
          }

          await BackendUtils.fsSync(false);
          Toast.toast(Translator.translate('sync.succesful', { time: (Date.now() - t0) / 1000 }));
          // eslint-disable-next-line no-empty
        } catch (e) {
          Toast.toast(Translator.translate('sync.failed'));
          Logger.error('Sync exception', e);
        }
        Logger.info('=== FINISHING SYNC ===');
        WhiteBoardUtil.setSyncInProgress(false);
        release();
        resolve();
      });
    });
  }

  public static async doSynchronizationForGame(onStart: boolean, pid: number): Promise<void> {
    if (onStart) {
      await BackendUtils.sendSignal(pid, Signal.SIGSTOP);
    }

    await BackendUtils.doSynchronization(onStart ? Winner.REMOTE : Winner.LOCAL, SyncMode.NORMAL);

    if (onStart) {
      await BackendUtils.sendSignal(pid, Signal.SIGCONT);
    }
  }
}
