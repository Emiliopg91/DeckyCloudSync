/* eslint-disable @typescript-eslint/ban-types */
import { definePlugin, routerHook } from '@decky/api';
import { staticClasses } from '@decky/ui';
import { Framework } from 'decky-plugin-framework';

import translations from '../assets/translations.i18n.json';
import { PluginIcon } from './components/icons/PluginIcon';
import { GlobalProvider } from './contexts/globalContext';
import { ConfigureBackendPage } from './pages/ConfigureBackendPage';
import { QuickAccessMenuPage } from './pages/QuickAccessMenuPage';
import { ViewLogsPage } from './pages/ViewLogsPage';
import { Constants } from './utils/constants';
import { PluginSettings } from './utils/pluginSettings';
import { SteamListeners } from './utils/steamListeners';
import { WhiteBoardUtil } from './utils/whiteboard';

export default definePlugin(() => {
  (async (): Promise<void> => {
    await Framework.initialize(Constants.PLUGIN_NAME, Constants.PLUGIN_VERSION, translations);
    PluginSettings.initialize();
    WhiteBoardUtil.setProvider(PluginSettings.settings.settings.remote.provider);
    SteamListeners.bind();

    routerHook.addRoute(Constants.PATH_PLUGIN_LOG, () => <ViewLogsPage forSync={false} />);
    routerHook.addRoute(Constants.PATH_SYNC_LOG, () => <ViewLogsPage forSync={true} />);
    routerHook.addRoute(Constants.PATH_CONFIGURE_PROVIDER, () => <ConfigureBackendPage />, {
      exact: true
    });
    //TODO: declare routes
    //routerHook.addRoute(Constants.PATH_CONFIGURE_PATHS,?);
  })();

  return {
    name: Constants.PLUGIN_NAME,
    title: <div className={staticClasses.Title}>{Constants.PLUGIN_NAME}</div>,
    content: (
      <GlobalProvider>
        <QuickAccessMenuPage />
      </GlobalProvider>
    ),
    icon: <PluginIcon width={20} height={20} />,
    async onDismount(): Promise<void> {
      SteamListeners.unbind();

      routerHook.removeRoute(Constants.PATH_PLUGIN_LOG);
      routerHook.removeRoute(Constants.PATH_SYNC_LOG);
      routerHook.removeRoute(Constants.PATH_CONFIGURE_PROVIDER);
      routerHook.removeRoute(Constants.PATH_CONFIGURE_PATHS);

      await Framework.shutdown();
    }
  };
});
