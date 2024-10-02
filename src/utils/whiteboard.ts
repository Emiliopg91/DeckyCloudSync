import {
  EventBus,
  EventData,
  EventType,
  WhiteBoard,
  WhiteBoardEventData
} from 'decky-plugin-framework';

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
}
