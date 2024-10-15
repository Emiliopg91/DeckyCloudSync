import { ButtonItem, Field, Navigation, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC } from 'react';

import { Constants } from '../../utils/constants';
import { WhiteBoardUtil } from '../../utils/whiteboard';

export const PluginBlock: FC = () => {
  return (
    <PanelSection>
      <PanelSectionRow>
        <Field label={Translator.translate('installed.version')} bottomSeparator="none">
          {Constants.PLUGIN_VERSION}
        </Field>
      </PanelSectionRow>
      {WhiteBoardUtil.getPluginLatestVersion() && (
        <PanelSectionRow>
          <Field label={Translator.translate('latest.version')} bottomSeparator="none">
            {WhiteBoardUtil.getPluginLatestVersion()}
          </Field>
        </PanelSectionRow>
      )}
      {WhiteBoardUtil.getPluginLatestVersion() && (
        <>
          <PanelSectionRow>
            <ButtonItem
              onClick={() => {
                Navigation.Navigate(Constants.PATH_SUDO_PASSWORD);
              }}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {Constants.PLUGIN_VERSION === WhiteBoardUtil.getPluginLatestVersion() &&
              Boolean(WhiteBoardUtil.getPluginLatestVersion())
                ? Translator.translate('reinstall.plugin')
                : Translator.translate('update.to', {
                    version: WhiteBoardUtil.getPluginLatestVersion()
                  })}
            </ButtonItem>
          </PanelSectionRow>
        </>
      )}
    </PanelSection>
  );
};
