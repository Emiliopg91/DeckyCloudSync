import {
  ButtonItem,
  ConfirmModal,
  Navigation,
  PanelSection,
  PanelSectionRow,
  TextField,
  showModal
} from '@decky/ui';
import { Logger, Translator } from 'decky-plugin-framework';
import { debounce } from 'lodash';
import { FC, useCallback, useState } from 'react';
import { FaEdit, FaPen, FaTrash } from 'react-icons/fa';

import { ButtonWithIcon } from '../components/ui/buttonWithIcon';
import { Constants } from '../utils/constants';
import { PluginSettings } from '../utils/pluginSettings';
import { WhiteBoardUtil } from '../utils/whiteboard';

const saveDirectory = debounce((newVal: string): void => {
  PluginSettings.setRemoteDirectory(newVal);
}, 1000);

export const ConfigurePathsPage: FC = () => {
  const [remoteDir, setRemoteDir] = useState(PluginSettings.getRemoteDirectory());
  const [entries, setEntries] = useState(PluginSettings.getEntries());
  const onDirChange = useCallback((newVal: string): void => {
    setRemoteDir(() => newVal);
    saveDirectory(newVal);
  }, []);
  const onDeleteEntry = useCallback((key: string): void => {
    setEntries(PluginSettings.removeEntry(key));
  }, []);

  return (
    <div style={{ marginTop: '50px' }}>
      <PanelSection title={Translator.translate('cloud.save.path')}>
        <TextField
          disabled={false}
          value={remoteDir}
          onChange={(e) => onDirChange(e.target.value)}
          onBlur={(e) => onDirChange(e.target.value)}
        />
      </PanelSection>
      <PanelSection title={Translator.translate('sync.entries')}>
        <div style={{ paddingLeft: '10px' }}>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                WhiteBoardUtil.setPathToEdit(undefined);
                Navigation.Navigate(Constants.PATH_CONFIGURE_SPECIFIC_PATH);
              }}
            >
              {Translator.translate('add.entry')}
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <table>
              {Object.keys(entries)
                .sort()
                .map((key, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{key}</td>
                      <td>
                        <ButtonWithIcon
                          icon={<FaPen />}
                          onClick={() => {
                            WhiteBoardUtil.setPathToEdit({ name: key, path: entries[key] });
                            Navigation.Navigate(Constants.PATH_CONFIGURE_SPECIFIC_PATH);
                          }}
                        >
                          {Translator.translate('edit.entry')}
                        </ButtonWithIcon>
                      </td>
                      <td>
                        <ButtonWithIcon
                          icon={<FaTrash />}
                          onClick={() => {
                            showModal(
                              <ConfirmModal
                                strTitle={Translator.translate('confirm.remove.entry')}
                                strDescription={Translator.translate('description.remove.entry')}
                                strOKButtonText={Translator.translate('remove.entry')}
                                strCancelButtonText={Translator.translate('cancel')}
                                onOK={() => {
                                  onDeleteEntry(key);
                                }}
                              />
                            );
                          }}
                        >
                          {Translator.translate('remove.entry')}
                        </ButtonWithIcon>
                      </td>
                    </tr>
                  );
                })}
            </table>
          </PanelSectionRow>
        </div>
      </PanelSection>
    </div>
  );
};
