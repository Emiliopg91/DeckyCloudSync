import { ConfirmModal, showModal } from '@decky/ui';
import { Mutex } from 'async-mutex';
import { Backend, Logger, Toast, Translator } from 'decky-plugin-framework';

import { Signal } from '../models/signals';
import { SyncMode } from '../models/syncModes';
import { Winner } from '../models/winners';
import { NavigationUtil } from './navigation';
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

  public static async sync(winner: Winner, mode: SyncMode): Promise<number> {
    return Backend.backend_call<[winner: string, mode: number], number>('sync', winner, mode);
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

  public static async doSynchronization(winner: Winner, mode: SyncMode): Promise<boolean> {
    if (BackendUtils.SYNC_MUTEX.isLocked()) {
      Toast.toast(Translator.translate('waiting.previous.sync'));
    }
    return new Promise<boolean>((resolve) => {
      BackendUtils.SYNC_MUTEX.acquire().then(async (release) => {
        if (WhiteBoardUtil.getIsConnected()) {
          WhiteBoardUtil.setSyncInProgress(true);
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
          const t0 = Date.now();
          try {
            WhiteBoardUtil.setSyncExitCode(-1);
            const uns = WhiteBoardUtil.subscribeSyncExitCode(async (returnCode: number) => {
              if (returnCode > -1) {
                uns();
                let result = false;
                if (returnCode != 0) {
                  Toast.toast(Translator.translate('sync.failed'), 5000, () => {
                    NavigationUtil.openLogPage(true);
                  });
                } else {
                  result = true;
                  Toast.toast(
                    Translator.translate('sync.succesful', { time: (Date.now() - t0) / 1000 }),
                    2000,
                    () => {
                      NavigationUtil.openLogPage(true);
                    }
                  );
                }
                WhiteBoardUtil.setSyncInProgress(false);
                release();
                resolve(result);
              }
            });

            await BackendUtils.sync(winner, mode);
          } catch (e) {
            Logger.error('Sync exception', e);
            Toast.toast(Translator.translate('sync.failed'), 5000, () => {
              NavigationUtil.openLogPage(true);
            });
          }
        } else {
          Logger.info('No network connection. Stopping sync');
          Toast.toast(Translator.translate('sync.failed'), 5000, () => {
            NavigationUtil.openLogPage(true);
          });
        }
      });
    });
  }

  public static async doSynchronizationForGame(onStart: boolean, pid: number): Promise<void> {
    if (onStart) {
      await BackendUtils.sendSignal(pid, Signal.SIGSTOP);

      if (WhiteBoardUtil.getIsConnected()) {
        await BackendUtils.doSynchronization(
          onStart ? Winner.REMOTE : Winner.LOCAL,
          SyncMode.NORMAL
        );

        await BackendUtils.sendSignal(pid, Signal.SIGCONT);
      } else {
        showModal(
          <ConfirmModal
            strTitle={Translator.translate('no.connection')}
            strDescription={Translator.translate('no.connection.desc')}
            strOKButtonText={Translator.translate('stop.app')}
            strCancelButtonText={Translator.translate('run.anyway')}
            onOK={async () => {
              await BackendUtils.sendSignal(pid, Signal.SIGKILL);
            }}
            onCancel={async () => {
              await BackendUtils.sendSignal(pid, Signal.SIGCONT);
            }}
          />
        );
      }
    } else {
      await BackendUtils.doSynchronization(onStart ? Winner.REMOTE : Winner.LOCAL, SyncMode.NORMAL);
    }
  }

  public static async copyToLocal(key: string): Promise<void> {
    if (BackendUtils.SYNC_MUTEX.isLocked()) {
      Toast.toast(Translator.translate('waiting.previous.sync'));
    }
    return new Promise<void>((resolve) => {
      BackendUtils.SYNC_MUTEX.acquire().then(async (release) => {
        Backend.backend_call<[key: string], number>('copy_to_local', key)
          .then((count) => {
            Toast.toast(Translator.translate('copied.files', { count }));
            release();
            resolve();
          })
          .catch(() => {
            Toast.toast(Translator.translate('error.copying.files'));
            release();
            resolve();
          });
      });
    });
  }

  public static async otaUpdate(_sudoPwd: string | null = null): Promise<void> {
    Logger.info(
      'Download and installation of version ' +
        WhiteBoardUtil.getPluginLatestVersion() +
        ' in progress'
    );
    Backend.backend_masked_call<[_sudoPwd: string | null], boolean>(
      'ota_update',
      [0],
      _sudoPwd
    ).then(() => {
      SteamClient.System.RestartPC();
    });
  }
}
