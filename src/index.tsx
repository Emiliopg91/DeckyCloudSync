/* eslint-disable @typescript-eslint/ban-types */
import { definePlugin, routerHook } from '@decky/api';
import { sleep, staticClasses } from '@decky/ui';
import { Framework, Logger, Toast, Translator } from 'decky-plugin-framework';

import translations from '../assets/translations.i18n.json';
import pckJson from '../package.json';
import { PluginIcon } from './components/icons/PluginIcon';
import { GlobalProvider } from './contexts/globalContext';
import { ConfigureBackendPage } from './pages/ConfigureBackendPage';
import { ConfigurePathPage } from './pages/ConfigurePathPage';
import { ConfigurePathsPage } from './pages/ConfigurePathsPage';
import { QuickAccessMenuPage } from './pages/QuickAccessMenuPage';
import { ViewLogsPage } from './pages/ViewLogsPage';
import { Constants } from './utils/constants';
import { PluginSettings } from './utils/pluginSettings';
import { SteamListeners } from './utils/steamListeners';
import { WhiteBoardUtil } from './utils/whiteboard';

let pluginUpdateCheckTimer: NodeJS.Timeout | undefined;

const checkPluginLatestVersion = async (): Promise<void> => {
  try {
    Logger.info('Checking for plugin update');

    const result = await fetch(
      'https://raw.githubusercontent.com/' +
        pckJson.author +
        '/' +
        Constants.PLUGIN_NAME +
        '/main/package.json',
      { method: 'GET' }
    );

    if (!result.ok) {
      throw new Error(result.statusText);
    }

    const vers = (await result.json())['version'];
    Logger.info('Latest plugin version: ' + vers);
    if (vers != WhiteBoardUtil.getPluginLatestVersion() && Constants.PLUGIN_VERSION != vers) {
      Logger.info('New plugin update available!');
      Toast.toast(
        Translator.translate('update.available'),
        5000 /*, () => {
        BackendUtils.otaUpdate();
      }*/
      );
      clearInterval(pluginUpdateCheckTimer);
      pluginUpdateCheckTimer = undefined;
    }
    WhiteBoardUtil.setPluginLatestVersion(vers);
  } catch (e) {
    Logger.error('Error fetching latest plugin version', e);
    WhiteBoardUtil.setPluginLatestVersion('');
  }
};

export default definePlugin(() => {
  (async (): Promise<void> => {
    await Framework.initialize(Constants.PLUGIN_NAME, Constants.PLUGIN_VERSION, {
      translator: {
        translations
      },
      game: {
        lifeCycle: true
      },
      system: {
        network: true
      },
      toast: {
        logo: window.SP_REACT.createElement(PluginIcon, {
          fontSize: '30',
          style: { marginLeft: 5, marginTop: 5 }
        })
      }
    });

    PluginSettings.initialize();
    WhiteBoardUtil.setProvider(PluginSettings.settings.settings.remote.provider);
    SteamListeners.bind();

    routerHook.addRoute(Constants.PATH_PLUGIN_LOG, () => <ViewLogsPage forSync={false} />, {
      exact: true
    });
    routerHook.addRoute(Constants.PATH_SYNC_LOG, () => <ViewLogsPage forSync={true} />, {
      exact: true
    });
    routerHook.addRoute(Constants.PATH_CONFIGURE_PATHS, () => <ConfigurePathsPage />, {
      exact: true
    });
    routerHook.addRoute(Constants.PATH_CONFIGURE_SPECIFIC_PATH, () => <ConfigurePathPage />, {
      exact: false
    });
    routerHook.addRoute(Constants.PATH_CONFIGURE_PROVIDER, () => <ConfigureBackendPage />, {
      exact: true
    });

    if (!Constants.PLUGIN_VERSION.endsWith('-dev')) {
      sleep(5000).then(() => {
        pluginUpdateCheckTimer = setInterval(checkPluginLatestVersion, 60 * 60 * 1000);
        checkPluginLatestVersion();
      });
    }
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
