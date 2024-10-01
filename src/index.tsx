/* eslint-disable @typescript-eslint/ban-types */
import { definePlugin, routerHook } from '@decky/api';
import { staticClasses } from '@decky/ui';
import { Framework } from 'decky-plugin-framework';

import translations from '../assets/translations.i18n.json';
import { PluginIcon } from './components/icons/PluginIcon';
import { GlobalProvider } from './contexts/globalContext';
import { MainMenu } from './pages/MainMenu';
import { Constants } from './utils/constants';
import { SteamListeners } from './utils/steamListeners';

export default definePlugin(() => {
  (async (): Promise<void> => {
    await Framework.initialize(Constants.PLUGIN_NAME, Constants.PLUGIN_VERSION, translations);
    SteamListeners.bind();

    //routerHook.addRoute(Constants.PATH_CONFIGURE_PROVIDER,?);
    //routerHook.addRoute(Constants.PATH_VIEW_LOG,?);
  })();

  return {
    name: Constants.PLUGIN_NAME,
    title: <div className={staticClasses.Title}>{Constants.PLUGIN_NAME}</div>,
    content: (
      <GlobalProvider>
        <MainMenu />
      </GlobalProvider>
    ),
    icon: <PluginIcon width={20} height={20} />,
    async onDismount(): Promise<void> {
      SteamListeners.unbind();

      routerHook.removeRoute(Constants.PATH_CONFIGURE_PROVIDER);
      routerHook.removeRoute(Constants.PATH_VIEW_LOG);

      await Framework.shutdown();
    }
  };
});
