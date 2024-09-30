/* eslint-disable @typescript-eslint/ban-types */
import { definePlugin } from '@decky/api';
import { staticClasses } from '@decky/ui';
import { Framework } from 'decky-plugin-framework';

import translations from '../assets/translations.i18n.json';
import { PluginIcon } from './components/icons/PluginIcon';
import { MainMenu } from './pages/MainMenu';
import { Constants } from './utils/constants';

export default definePlugin(() => {
  (async (): Promise<void> => {
    await Framework.initialize(Constants.PLUGIN_NAME, Constants.PLUGIN_VERSION, translations);
  })();

  return {
    name: Constants.PLUGIN_NAME,
    title: <div className={staticClasses.Title}>{Constants.PLUGIN_NAME}</div>,
    content: <MainMenu />,
    icon: <PluginIcon width={20} height={20} />,
    onDismount(): void {
      Framework.shutdown();
    }
  };
});
