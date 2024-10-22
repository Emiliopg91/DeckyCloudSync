import {
  Backend,
  EventBus,
  EventData,
  EventType,
  GameLifeEventData,
  Logger,
  NetworkEventData,
  Toast,
  Translator
} from 'decky-plugin-framework';

import { SyncMode } from '../models/syncModes';
import { BackendUtils } from './backend';
import { NavigationUtil } from './navigation';
import { WhiteBoardUtil } from './whiteboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const appStore: any;

export class Listeners {
  private static unsubscribeGameEvents: (() => void) | undefined = undefined;
  private static unsubscribeNetworkEvents: (() => void) | undefined = undefined;
  private static unsubscribeSyncEnd: (() => void) | undefined = undefined;
  private static unsubscribeSyncStarted: (() => void) | undefined = undefined;

  public static bind(): void {
    Listeners.unsubscribeGameEvents = EventBus.subscribe(
      EventType.GAME_LIFE,
      (event: EventData) => {
        const e = event as GameLifeEventData;
        const gameInfo = appStore.GetAppOverviewByGameID(e.getGameId());
        Logger.info(
          (e.isRunning() ? 'Starting' : 'Stopping') +
            " game '" +
            gameInfo.display_name +
            "' (" +
            e.getGameId() +
            ')'
        );

        let shouldSync = true;
        if (gameInfo?.store_category.includes(23)) {
          // 23 - Cloud Save
          Logger.info('Steam game with Steam Cloud, skipping');
          shouldSync = false;
        } else {
          Logger.info('Non Steam game, or game without Steam Cloud, proceeding');
          shouldSync = true;
        }
        if (shouldSync) {
          BackendUtils.doSynchronizationForGame(e.isRunning(), e.getPID());
        }
      }
    ).unsubscribe;

    Listeners.unsubscribeNetworkEvents = EventBus.subscribe(EventType.NETWORK, (e: EventData) => {
      const newVal = (e as NetworkEventData).isConnectedToInet();
      if (WhiteBoardUtil.getIsConnected() != newVal) {
        Logger.info('New connection state: ' + (newVal ? '' : 'dis') + 'connected');
        WhiteBoardUtil.setIsConnected(newVal);
      }
    }).unsubscribe;

    Listeners.unsubscribeSyncStarted = Backend.backend_handle('syncStarted', (mode: SyncMode) => {
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
      WhiteBoardUtil.setSyncInProgress(true);
    });

    Listeners.unsubscribeSyncEnd = Backend.backend_handle(
      'syncEnded',
      (returnCode: number, elapsed: number) => {
        WhiteBoardUtil.setSyncInProgress(false);

        if (returnCode > -1) {
          let result = false;
          if (returnCode != 0) {
            Toast.toast(Translator.translate('sync.failed'), 5000, () => {
              NavigationUtil.openLogPage(true);
            });
          } else {
            result = true;
            Toast.toast(
              Translator.translate('sync.succesful', { time: Math.round(elapsed) / 1000 }),
              2000,
              () => {
                NavigationUtil.openLogPage(true);
              }
            );
          }
          WhiteBoardUtil.setSyncInProgress(false);
          if (WhiteBoardUtil.getSyncRelease()) {
            WhiteBoardUtil.getSyncRelease()!(result);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            WhiteBoardUtil.setSyncRelease(() => {});
          }
        }
      }
    );
  }

  public static unbind(): void {
    if (Listeners.unsubscribeSyncStarted) {
      Listeners.unsubscribeSyncStarted();
    }
    if (Listeners.unsubscribeSyncEnd) {
      Listeners.unsubscribeSyncEnd();
    }
    if (Listeners.unsubscribeGameEvents) {
      Listeners.unsubscribeGameEvents();
    }
    if (Listeners.unsubscribeNetworkEvents) {
      Listeners.unsubscribeNetworkEvents();
    }
  }
}
