import {
  EventBus,
  EventData,
  EventType,
  WhiteBoard,
  WhiteBoardEventData
} from 'decky-plugin-framework';

import { Path } from '../models/configuration';
import { MenuEntry } from '../models/menuEntries';

export class WhiteBoardUtil {
  public static getSyncInProgress(): boolean {
    return WhiteBoard.get('syncInProgress') || false;
  }
  public static setSyncInProgress(value: boolean): void {
    WhiteBoard.set('syncInProgress', value);
  }

  public static subscribeSyncInProgress(callback: (value: boolean) => void): () => void {
    return WhiteBoardUtil.subscribe('syncInProgress', callback);
  }

  public static getProvider(): string | undefined {
    return WhiteBoard.get('provider') || undefined;
  }
  public static setProvider(value: string): void {
    WhiteBoard.set('provider', value);
  }

  public static subscribeProvider(callback: (value: string) => void): () => void {
    return WhiteBoardUtil.subscribe('provider', callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static subscribe(id: string, callback: (value: any) => void): () => void {
    return EventBus.subscribe(EventType.WHITEBOARD, (e: EventData) => {
      const event = e as WhiteBoardEventData;
      if (event.getId() == id) {
        callback(event.getValue());
      }
    }).unsubscribe;
  }

  public static getLog(): string {
    return WhiteBoard.get<string>('log')?.replace(/\n{2,}/g, '\n') || '';
  }

  public static setLog(value: string): void {
    WhiteBoard.set('log', value);
  }

  public static getPathToEdit(): { name: string; path: Path } | undefined {
    return WhiteBoard.get('pathToEdit') || undefined;
  }

  public static setPathToEdit(value: { name: string; path: Path } | undefined): void {
    WhiteBoard.set('pathToEdit', value);
  }

  public static setIsConnected(value: boolean): void {
    WhiteBoard.set('isConnected', value);
  }

  public static getIsConnected(): boolean {
    const value = WhiteBoard.get<boolean>('isConnected');
    return value != null ? value : true;
  }

  public static subscribeConnection(callback: (value: boolean) => void): () => void {
    return WhiteBoardUtil.subscribe('isConnected', callback);
  }

  public static getMenuEntry(): MenuEntry {
    return WhiteBoard.get('menuEntry') || MenuEntry.SYNC;
  }

  public static setMenuEntry(value: MenuEntry): void {
    WhiteBoard.set('menuEntry', value);
  }

  public static getPluginLatestVersion(): string {
    return WhiteBoard.get('pluginLatestVersion') || '';
  }

  public static setPluginLatestVersion(value: string): void {
    WhiteBoard.set('pluginLatestVersion', value);
  }

  public static setSyncExitCode(value: number): void {
    WhiteBoard.set('syncExitCode', value);
  }

  public static getSyncExitCode(): number {
    return WhiteBoard.get<number>('syncExitCode') || -1;
  }

  public static subscribeSyncExitCode(callback: (value: number) => void): () => void {
    return WhiteBoardUtil.subscribe('syncExitCode', callback);
  }
}
