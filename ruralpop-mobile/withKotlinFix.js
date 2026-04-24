const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withKotlinFix(config) {
    return withProjectBuildGradle(config, async (config) => {
        if (config.modResults.language === 'groovy') {
            const buildGradle = config.modResults.contents;
            if (!buildGradle.includes('resolutionStrategy')) {
                config.modResults.contents = buildGradle.replace(
                    /allprojects\s*\{/,
                    `allprojects {\n    configurations.all {\n        resolutionStrategy.eachDependency { details ->\n            if (details.requested.group == 'org.jetbrains.kotlin') {\n                details.useVersion "1.9.24"\n            }\n        }\n    }`
                );
            }
        }
        return config;
    });
};
