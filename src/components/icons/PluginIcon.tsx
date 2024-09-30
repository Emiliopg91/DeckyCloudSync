import { FC, ImgHTMLAttributes } from 'react';

import icon from '../../../assets/logo.png';

export const PluginIcon: FC<ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img src={icon} alt="logo" {...props} />
);
