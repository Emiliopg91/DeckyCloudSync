import { createContext, useEffect, useState } from 'react';

import { WhiteBoardUtil } from '../utils/whiteboard';

interface GlobalContextType {
  syncInProgress: boolean;
  provider: string | undefined;
}

const defaultValue: GlobalContextType = {
  syncInProgress: false,
  provider: undefined
};

export const GlobalContext = createContext(defaultValue);

export function GlobalProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [syncInProgress, setSyncInProgress] = useState(WhiteBoardUtil.getSyncInProgress());
  const [provider, setProvider] = useState(WhiteBoardUtil.getProvider());

  useEffect(() => {
    const unsSync = WhiteBoardUtil.subscribeSyncInProgress((value: boolean) => {
      setSyncInProgress(value);
    });
    const unsProv = WhiteBoardUtil.subscribeProvider((value: string) => {
      setProvider(value);
    });

    return (): void => {
      unsSync();
      unsProv();
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ syncInProgress, provider }}>{children}</GlobalContext.Provider>
  );
}
