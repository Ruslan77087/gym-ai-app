// Расширяем стандартный конфиг Expo: для веб-сборки expo-sqlite нужен .wasm как ассет.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite (web) грузит wa-sqlite.wasm — Metro должен отдавать его как бинарный ассет.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

module.exports = config;
