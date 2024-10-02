import { FC } from 'react';

import { ConfigurationBlock } from '../components/configuration/main';
import { LogsBlock } from '../components/infologs/main';
import { SyncBlock } from '../components/sync/main';

export const QuickAccessMenuPage: FC = () => {
  return (
    <>
      <SyncBlock />
      <ConfigurationBlock />
      <LogsBlock />
    </>
  );
};
