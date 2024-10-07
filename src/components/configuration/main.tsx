import { Navigation, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';

import { Constants } from '../../utils/constants';
import { ButtonWithIcon } from '../ui/buttonWithIcon';

export const ConfigurationBlock: FC = () => {
  return (
    <PanelSection>
      <PanelSectionRow>
        <ButtonWithIcon
          layout="below"
          onClick={() => {
            Navigation.CloseSideMenus();
            Navigation.Navigate(Constants.PATH_CONFIGURE_PATHS);
          }}
          icon={<FiEdit3 />}
        >
          {Translator.translate('configure.paths')}
        </ButtonWithIcon>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonWithIcon
          layout="below"
          onClick={() => {
            Navigation.CloseSideMenus();
            Navigation.Navigate(Constants.PATH_CONFIGURE_PROVIDER);
          }}
          icon={<AiOutlineCloudUpload />}
        >
          {Translator.translate('cloud.provider')}
        </ButtonWithIcon>
      </PanelSectionRow>
    </PanelSection>
  );
};
