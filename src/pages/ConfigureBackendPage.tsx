import {
  ButtonItem,
  ConfirmModal,
  Navigation,
  PanelSection,
  PanelSectionRow,
  showModal
} from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC, useContext } from 'react';
import { BsGearFill, BsPatchQuestionFill } from 'react-icons/bs';
import { ImDropbox, ImGoogleDrive, ImHome, ImOnedrive } from 'react-icons/im';

import { GlobalContext } from '../contexts/globalContext';
import { BackendUtils } from '../utils/backend';
import { PluginSettings } from '../utils/pluginSettings';
import { Toast } from '../utils/toast';
import { WhiteBoardUtil } from '../utils/whiteboard';

export const ConfigureBackendPage: FC = () => {
  const { provider } = useContext(GlobalContext);

  const openConfig = async (prov: string): Promise<void> => {
    const urlInterval = setInterval(async () => {
      const url = await BackendUtils.getConfigUrl();
      if (url) {
        clearInterval(urlInterval);
        Navigation.CloseSideMenus();
        Navigation.NavigateToExternalWeb(url);
      }
    }, 150);
    const resCode = await BackendUtils.configure(prov);

    if (resCode == 0) {
      Toast.toast(Translator.translate('provider.configured'));
      PluginSettings.setProvider(prov);
      WhiteBoardUtil.setProvider(prov);
      Navigation.NavigateToLibraryTab();
    } else {
      Toast.toast(Translator.translate('error.configuring.provider'));
    }
  };

  return (
    <>
      <PanelSection>
        <strong>
          {Translator.translate('currently.using')}: {provider}
        </strong>
      </PanelSection>
      <PanelSection>
        <small>{Translator.translate('click.providers')}</small>
        <PanelSectionRow>
          <ButtonItem onClick={() => openConfig('onedrive')} icon={<ImOnedrive />} label="OneDrive">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            onClick={() => openConfig('drive')}
            icon={<ImGoogleDrive />}
            label="Google Drive (may not work if Google does not trust the Steam Browser)"
          >
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => openConfig('dropbox')} icon={<ImDropbox />} label="Dropbox">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            onClick={() =>
              showModal(
                <ConfirmModal
                  strTitle={Translator.translate('other.providers')}
                  strDescription={
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                      {Translator.translate('manually.desktop')}
                    </span>
                  }
                />
              )
            }
            icon={<ImHome />}
            label={Translator.translate('other.advanced')}
          >
            <BsPatchQuestionFill />
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
