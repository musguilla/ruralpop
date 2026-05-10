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

  // Inject global resolution strategy to fix dependency conflict with newer Stripe versions
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents += `\nallprojects {
    configurations.all {
        resolutionStrategy {
            force 'com.google.android.gms:play-services-wallet:19.4.0'
        }
    }
}\n`;
    }
    return config;
  });

  return config;
};
