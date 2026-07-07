import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon';
import { cssInterop } from 'react-native-css-interop';

import icoMoonConfig from '../assets/icomoon/selection.json';

const IcomoonIcon = createIconSetFromIcoMoon(
  icoMoonConfig,
  'Icomoon',
  'icomoon.ttf',
);

cssInterop(IcomoonIcon, { className: 'style' });

export default IcomoonIcon;
