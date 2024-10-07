import { Focusable, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC, useContext } from 'react';

import { GlobalContext } from '../../contexts/globalContext';

export const WarningBlock: FC = () => {
  const { provider, connected } = useContext(GlobalContext);

  return (
    <>
      {(!provider || !connected) && (
        <>
          <style>
            {`
              #statusSyncBar {
                background-color: #FF000088;
                width: 100%;
                padding: 5px;
                text-align: center;
                animation: statusSyncFade 2s infinite cubic-bezier(0.46, 0.03, 0.52, 0.96);
              }

              @keyframes statusSyncFade {
                0% {
                  background-color: #FF000088;
                }

                50% {
                  background-color: #FF000000;
                }

                100% {
                  background-color: #FF000088;
                }
              }
            `}
          </style>
          <PanelSection>
            <PanelSectionRow>
              <Focusable id="statusSyncBar">
                {!connected && (
                  <>
                    <span>{Translator.translate('no.connection')}</span>
                    {!provider && <br />}
                  </>
                )}
                {!provider && (
                  <>
                    <span>{Translator.translate('no.provider')}</span>
                  </>
                )}
              </Focusable>
            </PanelSectionRow>
          </PanelSection>
        </>
      )}
    </>
  );
};
