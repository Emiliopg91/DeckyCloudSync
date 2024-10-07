import {
  EventBus,
  EventData,
  EventType,
  GameLifeEventData,
  Logger,
  NetworkEventData,
  Translator
} from 'decky-plugin-framework';

import { BackendUtils } from './backend';
import { Toast } from './toast';
import { WhiteBoardUtil } from './whiteboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const appStore: any;

export class SteamListeners {
  private static unsubscribeGameEvents: (() => void) | undefined = undefined;
  private static unsubscribeNetworkEvents: (() => void) | undefined = undefined;

  public static bind(): void {
    SteamListeners.unsubscribeGameEvents = EventBus.subscribe(
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

    SteamListeners.unsubscribeNetworkEvents = EventBus.subscribe(
      EventType.NETWORK,
      (e: EventData) => {
        const newVal = (e as NetworkEventData).isConnectedToInet();
        if (WhiteBoardUtil.getIsConnected() != newVal) {
          Logger.info('New connection state: ' + (newVal ? '' : 'dis') + 'connected');
          WhiteBoardUtil.setIsConnected(newVal);
        }
      }
    ).unsubscribe;
  }

  public static unbind(): void {
    if (SteamListeners.unsubscribeGameEvents) {
      SteamListeners.unsubscribeGameEvents();
    }
    if (SteamListeners.unsubscribeNetworkEvents) {
      SteamListeners.unsubscribeNetworkEvents();
    }
  }
}
