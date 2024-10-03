export interface Configuration {
  settings: Settings;
  entries: Record<string, Path>;
}

export interface Settings {
  remote: Remote;
}

export interface Remote {
  provider: string;
  directory: string;
}

export interface Path {
  folder: string;
  inclusions: Array<string>;
  exclusions: Array<string>;
}
