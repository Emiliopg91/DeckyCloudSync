import {
  EventBus,
  EventData,
  EventType,
  GameLifeEventData,
  Logger,
  Translator
} from 'decky-plugin-framework';

import { BackendUtils } from './backend';
import { Toast } from './toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const appStore: any;

export class SteamListeners {
  private static unsubscribeGameEvents: (() => void) | undefined = undefined;
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

        if (SteamListeners.shouldSync(gameInfo)) {
          SteamListeners.syncGame(e);
        }
      }
    ).unsubscribe;
  }

  private static syncGame(e: GameLifeEventData): void {
    if (e.isRunning()) {
      Toast.toast(Translator.translate('synchronizing.savedata'));
    }
    BackendUtils.doSynchronizationForGame(e.isRunning(), e.getPID());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static shouldSync(gameInfo: any): boolean {
    if (gameInfo?.store_category.includes(23)) {
      // 23 - Cloud Save
      Logger.info('Steam game with Steam Cloud, skipping');
      return false;
    } else {
      Logger.info('Non Steam game, or game without Steam Cloud, proceeding');
      return true;
    }
  }

  public static unbind(): void {
    if (SteamListeners.unsubscribeGameEvents) {
      SteamListeners.unsubscribeGameEvents();
    }
  }
}
