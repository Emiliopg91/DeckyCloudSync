import { DialogButton, Navigation, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC } from 'react';
import { FaBug } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';

export const ContributeBlock: FC = () => {
  return (
    <>
      <PanelSection title={Translator.translate('contribute.info')}>
        <PanelSectionRow>
          <DialogButton
            onClick={() => {
              Navigation.NavigateToExternalWeb(
                'https://github.com//Emiliopg91/DeckyCloudSync/issues'
              );
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5em'
            }}
          >
            <FaBug size="1em" color="orange" /> {Translator.translate('report.a.bug')}
          </DialogButton>
        </PanelSectionRow>
        <br />
        <PanelSectionRow>
          <DialogButton
            onClick={() => {
              Navigation.NavigateToExternalWeb('https://ko-fi.com/emiliopg91');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5em'
            }}
          >
            <SiKofi size="1em" color="cyan" /> {Translator.translate('make.a.donation')}
          </DialogButton>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
