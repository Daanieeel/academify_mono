// used to create icons from the icomoon icon set; icons used are phospor icons

import createIconSetFromIcoMoon from "@expo/vector-icons/createIconSetFromIcoMoon";

import icoMoonConfig from "../assets/icomoon/selection.json";

const IcomoonIcon = createIconSetFromIcoMoon(
  icoMoonConfig,
  "Icomoon",
  "icomoon.ttf",
);

export default IcomoonIcon;
