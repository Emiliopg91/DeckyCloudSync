import { DropdownItem, PanelSection, PanelSectionRow } from '@decky/ui';
import { Translator } from 'decky-plugin-framework';
import { FC } from 'react';

import { MenuEntry } from '../../models/menuEntries';
import { WhiteBoardUtil } from '../../utils/whiteboard';

export const MenuBlock: FC = () => {
  return (
    <PanelSection>
      <PanelSectionRow>
        <DropdownItem
          selectedOption={WhiteBoardUtil.getMenuEntry()}
          rgOptions={[
            {
              data: MenuEntry.SYNC,
              label: Translator.translate('menu.sync')
            },
            {
              data: MenuEntry.LOGS,
              label: Translator.translate('menu.logs')
            } /*,
          {
            data: MenuEntry.PLUGIN,
            label: Translator.translate('menu.plugin')
          }*/
          ]}
          onChange={(newVal) => {
            WhiteBoardUtil.setMenuEntry(newVal.data);
          }}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};
