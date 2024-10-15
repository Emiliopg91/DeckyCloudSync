import { ButtonItem, Navigation, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { Toast, Translator } from 'decky-plugin-framework';
import { FC, useState } from 'react';

import { BackendUtils } from '../utils/backend';
import { Constants } from '../utils/constants';
import { WhiteBoardUtil } from '../utils/whiteboard';

export const EnterSudoPasswordPage: FC = () => {
  const [password, setPassword] = useState('');

  return (
    <div style={{ marginTop: '50px' }}>
      <PanelSection title={Translator.translate('sudo.password.required')}>
        <PanelSectionRow>{Translator.translate('sudo.password.required.desc')}</PanelSectionRow>
        <PanelSectionRow>
          <TextField
            type="password"
            onChange={(e) => {
              setPassword(e.currentTarget.value);
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            onClick={() => {
              Toast.toast(
                Constants.PLUGIN_VERSION === WhiteBoardUtil.getPluginLatestVersion() &&
                  Boolean(WhiteBoardUtil.getPluginLatestVersion())
                  ? Translator.translate('reinstalling.plugin')
                  : Translator.translate('updating.plugin')
              );
              BackendUtils.otaUpdate(password);
              Navigation.NavigateBack();
            }}
          >
            {Translator.translate('enter')}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
