import { PanelSection, PanelSectionRow } from '@decky/ui';
import { System, Translator } from 'decky-plugin-framework';
import { FC } from 'react';

import logo from '../../assets/logo.png';

export const MainMenu: FC = () => {
  return (
    <PanelSection title={Translator.translate('panel.section')}>
      <PanelSectionRow>
        <h2>
          {System.getCurrentUser()}, {Translator.translate('hello.world')}
        </h2>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};
