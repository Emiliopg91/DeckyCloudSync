import { Settings } from 'decky-plugin-framework';

import { Configuration } from '../models/configuration';

export class PluginSettings {
  public static settings: Configuration;

  public static initialize(): void {
    PluginSettings.settings = Settings.getProxiedSettings(Settings.getConfigurationStructured());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static createParents(obj: Record<string, any>, path: string): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
  }

  public static getBackendType(): string | undefined {
    return PluginSettings.settings.settings?.remote?.type || undefined;
  }

  public static setProfilePerGame(value: string): void {
    if (!PluginSettings.settings.settings?.remote) {
      PluginSettings.createParents(PluginSettings.settings, 'settings.remote');
    }
    PluginSettings.settings.settings!.remote.type = value;
  }
}
