// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */



module.exports = (() => {


    config = getDefaultConfig(__dirname);

    // Importing nativewind metro config
    config = withNativeWind(config, { input: './global.css' });

    return config;
})();


