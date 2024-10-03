import { Settings } from 'decky-plugin-framework';

import { Configuration, Path } from '../models/configuration';

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

  public static getProvider(): string | undefined {
    return PluginSettings.settings.settings?.remote?.provider || undefined;
  }

  public static setProvider(value: string): void {
    if (!PluginSettings.settings.settings?.remote) {
      PluginSettings.createParents(PluginSettings.settings, 'settings.remote');
    }
    PluginSettings.settings.settings!.remote.provider = value;
  }

  public static getRemoteDirectory(): string | undefined {
    return PluginSettings.settings.settings?.remote?.directory || 'decky-cloud-sync';
  }

  public static setRemoteDirectory(value: string): void {
    if (!PluginSettings.settings.settings?.remote) {
      PluginSettings.createParents(PluginSettings.settings, 'settings.remote');
    }
    PluginSettings.settings.settings!.remote.directory = value;
  }

  public static getEntries(): Record<string, Path> {
    const obj = PluginSettings.settings.entries || {};
    return JSON.parse(JSON.stringify(obj));
  }

  static saveEntry(key: string, path: Path): void {
    PluginSettings.settings.entries[key] = path;
  }

  static removeEntry(key: string): Record<string, Path> {
    delete PluginSettings.settings.entries[key];
    return PluginSettings.getEntries();
  }
}
