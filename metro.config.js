// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ADD THIS LINE TO BYPASS THE EXPORT CONSTRAINT
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
