import packageJson from '../../package.json';
import plugin from '../../plugin.json';

export class Constants {
  public static PLUGIN_NAME = plugin.name;
  public static PLUGIN_VERSION = packageJson.version;

  private static PATH_BASE = '/decky-cloud-sync-';

  public static PATH_CONFIGURE_PATHS = Constants.PATH_BASE + 'configure-paths';
  public static PATH_CONFIGURE_SPECIFIC_PATH = Constants.PATH_BASE + 'configure-specfic-path';
  public static PATH_CONFIGURE_PROVIDER = Constants.PATH_BASE + 'configure-provider';

  public static PATH_SYNC_LOG = Constants.PATH_BASE + 'sync-log';
  public static PATH_PLUGIN_LOG = Constants.PATH_BASE + 'plugin-log';

  public static PATH_SUDO_PASSWORD = Constants.PATH_BASE + 'sudo-password';
}
