import { createContext, useEffect, useState } from 'react';

import { WhiteBoardUtil } from '../utils/whiteboard';

interface GlobalContextType {
  syncInProgress: boolean;
  provider: string | undefined;
  connected: boolean;
}

const defaultValue: GlobalContextType = {
  syncInProgress: false,
  provider: undefined,
  connected: false
};

export const GlobalContext = createContext(defaultValue);

export function GlobalProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [syncInProgress, setSyncInProgress] = useState(WhiteBoardUtil.getSyncInProgress());
  const [provider, setProvider] = useState(WhiteBoardUtil.getProvider());
  const [connected, setConnected] = useState(WhiteBoardUtil.getIsConnected());

  useEffect(() => {
    const unsSync = WhiteBoardUtil.subscribeSyncInProgress((value: boolean) => {
      setSyncInProgress(value);
    });
    const unsProv = WhiteBoardUtil.subscribeProvider((value: string) => {
      setProvider(value);
    });
    const unsNet = WhiteBoardUtil.subscribeConnection((value: boolean) => {
      setConnected(value);
    });

    return (): void => {
      unsSync();
      unsProv();
      unsNet();
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ syncInProgress, provider, connected }}>
      {children}
    </GlobalContext.Provider>
  );
}
