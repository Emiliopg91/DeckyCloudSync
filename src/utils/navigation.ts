import { Navigation } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';

import { BackendUtils } from './backend';
import { Constants } from './constants';
import { WhiteBoardUtil } from './whiteboard';

export class NavigationUtil {
  public static async openLogPage(syncLog: boolean): Promise<void> {
    let logs = await (syncLog ? BackendUtils.getSyncLog() : BackendUtils.getPluginLog());
    if (!logs || logs == '') {
      logs = Translator.translate('no.available.logs');
    }
    WhiteBoardUtil.setLog(logs);
    Navigation.Navigate(Constants.PATH_SYNC_LOG);
    Navigation.CloseSideMenus();
  }
}
