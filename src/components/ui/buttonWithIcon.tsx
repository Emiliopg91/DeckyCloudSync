import { ButtonItem, ButtonItemProps } from '@decky/ui';
import React, { FC, PropsWithChildren } from 'react';

export interface PaddedButtonItemProps extends ButtonItemProps {
  icon: React.ReactElement;
}

export const ButtonWithIcon: FC<PaddedButtonItemProps> = ({
  children,
  icon,
  ...buttonProps
}: PropsWithChildren<PaddedButtonItemProps>) => {
  return (
    <ButtonItem {...buttonProps}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {icon}
        <div>{children}</div>
      </div>
    </ButtonItem>
  );
};
