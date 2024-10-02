export interface Configuration {
  settings: Settings;
}

export interface Settings {
  remote: Remote;
}

export interface Remote {
  provider: string;
  directory: string;
}
