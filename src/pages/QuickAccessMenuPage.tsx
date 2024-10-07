import { FC } from 'react';

import { ConfigurationBlock } from '../components/configuration/main';
import { LogsBlock } from '../components/infologs/main';
import { ContributeBlock } from '../components/others/contributeBlock';
import { MenuBlock } from '../components/others/menuBlock';
import { WarningBlock } from '../components/others/warningBlock';
import { SyncBlock } from '../components/sync/main';
import { MenuEntry } from '../models/menuEntries';
import { WhiteBoardUtil } from '../utils/whiteboard';

export const QuickAccessMenuPage: FC = () => {
  return (
    <>
      <WarningBlock />
      <MenuBlock />
      {WhiteBoardUtil.getMenuEntry() == MenuEntry.SYNC && (
        <>
          <SyncBlock />
          <ConfigurationBlock />
        </>
      )}
      {WhiteBoardUtil.getMenuEntry() == MenuEntry.LOGS && <LogsBlock />}
      <ContributeBlock />
    </>
  );
};
