import { FileSelectionType, openFilePicker } from '@decky/api';
import {
  ButtonItem,
  ConfirmModal,
  Navigation,
  PanelSection,
  PanelSectionRow,
  showModal,
  sleep
} from '@decky/ui';
import { Logger, Translator } from 'decky-plugin-framework';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { BackendUtils } from '../utils/backend';
import { Constants } from '../utils/constants';
import { PluginSettings } from '../utils/pluginSettings';
import { WhiteBoardUtil } from '../utils/whiteboard';

export const ConfigurePathPage: FC = () => {
  const [entry, setEntry] = useState(WhiteBoardUtil.getPathToEdit());
  const [mode, setMode] = useState(0); //0 - All, 1 - only specified, 2 - all with exclusions
  const [homeDir, setHomeDir] = useState('');
  const [remoteDir, setRemoteDir] = useState('');
  const edit = useMemo<boolean>(() => entry != undefined, []);
  const selectRemoteDir = useCallback(() => {
    openFilePicker(FileSelectionType.FOLDER, remoteDir, false, true).then((res) => {
      if (!res.path.startsWith(remoteDir)) {
        showModal(
          <ConfirmModal
            strTitle={Translator.translate('configuration.error')}
            strDescription={Translator.translate('remote.misplaced', { remoteDir })}
            strOKButtonText={Translator.translate('try.again')}
            onOK={() => {
              selectRemoteDir();
            }}
          />
        );
      } else if (res.path == remoteDir) {
        showModal(
          <ConfirmModal
            strTitle={Translator.translate('configuration.error')}
            strDescription={Translator.translate('remote.select.subfolder', { remoteDir })}
            strOKButtonText={Translator.translate('try.again')}
            onOK={() => {
              selectRemoteDir();
            }}
          />
        );
      } else {
        const name = res.path.substring(remoteDir.length + 1);
        if (PluginSettings.settings.entries[name]) {
          showModal(
            <ConfirmModal
              strTitle={Translator.translate('configuration.error')}
              strDescription={Translator.translate('folder.already.in.use')}
              strOKButtonText={Translator.translate('try.again')}
              onOK={() => {
                selectRemoteDir();
              }}
            />
          );
        } else {
          setEntry({ ...entry!, name });
        }
      }
    });
  }, [remoteDir, entry]);
  const selectLocalDir = useCallback(() => {
    openFilePicker(FileSelectionType.FOLDER, homeDir, false, true).then((res) => {
      if (remoteDir.includes(res.path)) {
        showModal(
          <ConfirmModal
            strTitle={Translator.translate('configuration.error')}
            strDescription={Translator.translate('local.include.remote', {
              remoteDir
            })}
            strOKButtonText={Translator.translate('try.again')}
            onOK={() => {
              selectLocalDir();
            }}
          />
        );
      } else if ('/' == res.path) {
        showModal(
          <ConfirmModal
            strTitle={Translator.translate('configuration.error')}
            strDescription={Translator.translate('cannot.select.root')}
            strOKButtonText={Translator.translate('try.again')}
            onOK={() => {
              selectLocalDir();
            }}
          />
        );
      } else {
        setEntry({
          ...entry!,
          path: { folder: res.path, inclusions: ['*'], exclusions: [] }
        });
      }
    });
  }, [homeDir, entry]);
  const selectFileFolderIncExc = useCallback(
    (isFile: boolean, isInc: boolean) => {
      openFilePicker(
        isFile ? FileSelectionType.FILE : FileSelectionType.FOLDER,
        entry!.path.folder,
        isFile,
        true
      ).then((res) => {
        let path = res.path;
        if (!path.startsWith(entry!.path.folder) || path == entry?.path.folder) {
          showModal(
            <ConfirmModal
              strTitle={Translator.translate('configuration.error')}
              strDescription={Translator.translate('must.be.in.local', { path })}
              strOKButtonText={Translator.translate('try.again')}
              onOK={() => {
                selectFileFolderIncExc(isFile, isInc);
              }}
            />
          );
        } else {
          const newEntry: typeof entry = JSON.parse(JSON.stringify(entry));
          path = path.substring(newEntry!.path.folder.length + 1);
          if (isInc) {
            removePath('*', newEntry!.path.inclusions);
            newEntry!.path.inclusions.push(path);
          } else {
            newEntry!.path.exclusions.push(path);
          }
          setEntry(newEntry);
        }
      });
    },
    [entry]
  );
  const onRemoveEntry = useCallback(
    (value: string, isInc: boolean) => {
      const newEntry: typeof entry = JSON.parse(JSON.stringify(entry));
      if (isInc) {
        removePath(value, newEntry!.path.inclusions);
        if (newEntry?.path.inclusions.length == 0) {
          newEntry.path.inclusions.push('*');
        }
      } else {
        removePath(value, newEntry!.path.exclusions);
      }
      setEntry(newEntry);
    },
    [entry]
  );

  const removePath = useCallback((value: string, array: Array<string>) => {
    const index = array.indexOf(value);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }, []);

  useEffect((): (() => void) => {
    if (edit) {
      Logger.info('Starting edition of "' + entry!.name + '": ' + JSON.stringify(entry!.path));
      if (entry!.path.exclusions!.length > 0) {
        setMode(2);
      } else {
        if (entry!.path.inclusions!.length > 1 || entry?.path.inclusions![0] != '*') {
          setMode(1);
        }
      }
    } else {
      Logger.info('Starting creation of new entry');
      setEntry({ name: '', path: { folder: '', inclusions: ['*'], exclusions: [] } });
    }

    BackendUtils.getHomeDir().then((val) => setHomeDir(val));
    BackendUtils.getRemoteDir().then((val) => setRemoteDir(val));

    return () => {
      WhiteBoardUtil.setPathToEdit(undefined);
    };
  }, []);

  return (
    <>
      {entry && (
        <div style={{ marginTop: '50px', overflowY: 'scroll' }}>
          <PanelSection title={Translator.translate('manage.entry')}>
            <table>
              <tr>
                <td>{Translator.translate('entry.remote.folder')}</td>
                <td>
                  <ButtonItem
                    disabled={edit}
                    layout="below"
                    onClick={() => {
                      selectRemoteDir();
                    }}
                  >
                    {Translator.translate('explore')}
                  </ButtonItem>
                </td>
                {entry!.name && entry!.name.trim() != '' && <td>{entry!.name}</td>}
              </tr>
              <tr>
                <td>{Translator.translate('entry.local.folder')}</td>
                <td>
                  <ButtonItem
                    layout="below"
                    onClick={() => {
                      selectLocalDir();
                    }}
                  >
                    {Translator.translate('explore')}
                  </ButtonItem>
                </td>
                {entry!.path.folder && entry!.path.folder.trim() != '' && (
                  <td>{entry!.path.folder}</td>
                )}
              </tr>
            </table>
            {entry.path.folder.trim().length > 0 && (
              <>
                <hr />
                <table>
                  <tr>
                    <td
                      rowSpan={Math.max(2, entry.path.inclusions.length + 1)}
                      style={{ verticalAlign: 'top' }}
                    >
                      {Translator.translate('include')}
                    </td>
                    <td>
                      <table>
                        {entry.path.inclusions.map((value, idx) => {
                          return (
                            <tr key={idx}>
                              <td>
                                {value != '*' && value}
                                {value == '*' && Translator.translate('all.files')}
                              </td>
                              <td>
                                {value != '*' && (
                                  <ButtonItem
                                    onClick={() => {
                                      onRemoveEntry(value, true);
                                    }}
                                  >
                                    {Translator.translate('remove')}
                                  </ButtonItem>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table>
                        <tr>
                          <td>
                            <ButtonItem
                              layout="inline"
                              onClick={() => selectFileFolderIncExc(true, true)}
                            >
                              {Translator.translate('add.file')}
                            </ButtonItem>
                          </td>
                          <td>
                            <ButtonItem
                              layout="inline"
                              onClick={() => selectFileFolderIncExc(false, true)}
                            >
                              {Translator.translate('add.folder')}
                            </ButtonItem>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <hr />
                <table>
                  <tr>
                    <td
                      rowSpan={Math.max(2, entry.path.exclusions.length + 1)}
                      style={{ verticalAlign: 'top' }}
                    >
                      {Translator.translate('exclude')}
                    </td>
                    <td>
                      <table>
                        {entry.path.exclusions.map((value, idx) => {
                          return (
                            <tr key={idx}>
                              <td>{value}</td>
                              <td>
                                <ButtonItem
                                  onClick={() => {
                                    onRemoveEntry(value, false);
                                  }}
                                >
                                  {Translator.translate('remove')}
                                </ButtonItem>
                              </td>
                            </tr>
                          );
                        })}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <td>
                        <table>
                          <tr>
                            <td>
                              <ButtonItem
                                layout="inline"
                                onClick={() => selectFileFolderIncExc(true, false)}
                              >
                                {Translator.translate('add.file')}
                              </ButtonItem>
                            </td>
                            <td>
                              <ButtonItem
                                layout="inline"
                                onClick={() => selectFileFolderIncExc(false, false)}
                              >
                                {Translator.translate('add.folder')}
                              </ButtonItem>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </td>
                  </tr>
                </table>
              </>
            )}
            {entry.name &&
              entry.name.trim().length > 0 &&
              entry.path.folder &&
              entry.path.folder.trim().length > 0 &&
              entry.path.inclusions.length > 0 && (
                <div style={{ marginBottom: '50px' }}>
                  <PanelSectionRow>
                    <ButtonItem
                      layout="below"
                      onClick={() => {
                        PluginSettings.saveEntry(entry.name, entry.path);
                        sleep(250).then(() => {
                          Navigation.Navigate(Constants.PATH_CONFIGURE_PATHS);
                        });
                      }}
                    >
                      {Translator.translate('save')}
                    </ButtonItem>
                  </PanelSectionRow>
                </div>
              )}
          </PanelSection>
        </div>
      )}
    </>
  );
};
