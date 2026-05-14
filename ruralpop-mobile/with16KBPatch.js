const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function with16KBPatch(config) {
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'reanimated.buildFromSource',
      value: 'true',
    });
    return config;
  });
  return config;
};
