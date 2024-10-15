import { addEventListener, removeEventListener } from '@decky/api';
import {
  EventBus,
  EventData,
  EventType,
  GameLifeEventData,
  Logger,
  NetworkEventData
} from 'decky-plugin-framework';

import { BackendUtils } from './backend';
import { WhiteBoardUtil } from './whiteboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const appStore: any;

export class Listeners {
  private static unsubscribeGameEvents: (() => void) | undefined = undefined;
  private static unsubscribeNetworkEvents: (() => void) | undefined = undefined;

  private static rcloneSyncCallback: (resultCode: number) => void = (resultCode: number) => {
    Logger.debug('Received event for RClone Sync ending: ' + resultCode);
    WhiteBoardUtil.setSyncExitCode(resultCode);
  };

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

    addEventListener('rcloneSyncEnded', Listeners.rcloneSyncCallback);
  }

  public static unbind(): void {
    removeEventListener('rcloneSyncEnded', Listeners.rcloneSyncCallback);

    if (Listeners.unsubscribeGameEvents) {
      Listeners.unsubscribeGameEvents();
    }
    if (Listeners.unsubscribeNetworkEvents) {
      Listeners.unsubscribeNetworkEvents();
    }
  }
}