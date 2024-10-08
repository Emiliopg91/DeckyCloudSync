import { ButtonItem, Navigation, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC, useMemo, useState } from 'react';

import { SyncMode } from '../models/syncModes';
import { Winner } from '../models/winners';
import { BackendUtils } from '../utils/backend';
import { WhiteBoardUtil } from '../utils/whiteboard';

export interface ViewLogsPageProps {
  forSync: boolean;
}

export const ViewLogsPage: FC<ViewLogsPageProps> = ({ forSync }) => {
  Navigation.CloseSideMenus();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [logs, _] = useState<string>(WhiteBoardUtil.getLog());

  const resyncNeeded = useMemo(() => logs.indexOf('Must run --resync') > 0, [logs]);

  const forceNeeded = useMemo(() => logs.indexOf('Run with --force') > 0, [logs]);

  return (
    <PanelSection title={Translator.translate('sync.logs')}>
      <PanelSectionRow style={{ maxHeight: '300px' }}>
        <pre
          style={{
            overflowY: 'scroll',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 'smaller',
            maxHeight: '300px'
          }}
        >
          {logs}
        </pre>
      </PanelSectionRow>
      {forSync && (
        <>
          <PanelSectionRow>
            {resyncNeeded && (
              <ButtonItem
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  Navigation.CloseSideMenus();
                  Navigation.NavigateBack();
                  let winner = Winner.LOCAL;
                  if (logs.indexOf('--conflict-resolve path2') !== -1) {
                    winner = Winner.REMOTE;
                  }
                  BackendUtils.doSynchronization(winner, SyncMode.RESYNC);
                }}
              >
                {Translator.translate('resync.now')}
              </ButtonItem>
            )}
          </PanelSectionRow>
          <PanelSectionRow>
            {forceNeeded && (
              <ButtonItem
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  Navigation.CloseSideMenus();
                  Navigation.NavigateBack();
                  let winner = Winner.LOCAL;
                  if (logs.indexOf('--conflict-resolve path2') !== -1) {
                    winner = Winner.REMOTE;
                  }
                  BackendUtils.doSynchronization(winner, SyncMode.FORCE);
                }}
              >
                {Translator.translate('force.now')}
              </ButtonItem>
            )}
          </PanelSectionRow>
        </>
      )}
    </PanelSection>
  );
};
