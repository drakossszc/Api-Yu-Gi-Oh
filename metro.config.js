// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Soluciona problemas con .cjs y Firebase
config.resolver.sourceExts.push('cjs');
module.exports = config;