const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function with16KBPatch(config) {
  // Force Reanimated to build from source so it uses NDK 27 (16KB aligned)
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'reanimated.buildFromSource',
      value: 'true',
    });
    return config;
  });

  // Force Stripe Android SDK to a version that supports 16KB pages
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        /ext \{/,
        'ext {\n        stripeVersion = "20.40.0"'
      );
    }
    return config;
  });

  return config;
};
