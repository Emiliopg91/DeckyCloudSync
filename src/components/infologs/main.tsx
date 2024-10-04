import { Navigation, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC, useContext } from 'react';
import { FaCloudUploadAlt, FaPlug } from 'react-icons/fa';

import { GlobalContext } from '../../contexts/globalContext';
import { BackendUtils } from '../../utils/backend';
import { Constants } from '../../utils/constants';
import { NavigationUtil } from '../../utils/navigation';
import { WhiteBoardUtil } from '../../utils/whiteboard';
import { ButtonWithIcon } from '../ui/buttonWithIcon';

export const LogsBlock: FC = () => {
  const { provider, syncInProgress } = useContext(GlobalContext);

  return (
    <>
      <>
        <PanelSection title={Translator.translate('logs')}>
          <PanelSectionRow>
            <ButtonWithIcon
              layout="below"
              onClick={() => {
                NavigationUtil.openLogPage(false);
              }}
              icon={<FaPlug />}
            >
              {Translator.translate('app.logs')}
            </ButtonWithIcon>
          </PanelSectionRow>
          {provider && (
            <PanelSectionRow>
              <ButtonWithIcon
                layout="below"
                disabled={syncInProgress}
                onClick={() => {
                  NavigationUtil.openLogPage(true);
                }}
                icon={<FaCloudUploadAlt />}
              >
                {Translator.translate('sync.logs')}
              </ButtonWithIcon>
            </PanelSectionRow>
          )}
        </PanelSection>
      </>
    </>
  );
};
