import { PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC, useContext } from 'react';

import { GlobalContext } from '../../contexts/globalContext';
import { SyncMode } from '../../models/syncModes';
import { Winner } from '../../models/winners';
import { BackendUtils } from '../../utils/backend';
import { PluginIcon } from '../icons/PluginIcon';
import { ButtonWithIcon } from '../ui/buttonWithIcon';

export const SyncBlock: FC = () => {
  const { syncInProgress, provider, connected } = useContext(GlobalContext);

  return (
    <>
      <style>
        {`
          .dcs-rotate {
            animation: dcsrotate 1s infinite cubic-bezier(0.46, 0.03, 0.52, 0.96);
          }

          @keyframes dcsrotate {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(359deg);
            }
          }
        `}
      </style>
      <PanelSection>
        <PanelSectionRow>
          <ButtonWithIcon
            layout="below"
            disabled={syncInProgress || !provider || !connected}
            onClick={() => {
              BackendUtils.doSynchronization(Winner.REMOTE, SyncMode.NORMAL);
            }}
            icon={<PluginIcon className={syncInProgress ? 'dcs-rotate' : ''} />}
          >
            {Translator.translate('sync.now')}
          </ButtonWithIcon>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
