const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFmtFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(file)) {
        let contents = fs.readFileSync(file, 'utf8');
        
        const patch = `
  # FIX FOR XCODE 16 CONST EVAL ERROR IN FMT
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
`;
        
        if (!contents.includes("target.name == 'fmt'")) {
          // Expo 50+ Podfiles usually have a post_install block.
          // We will inject our fix right before the final 'end' of the post_install block.
          // To be safe, we just append a new post_install block? CocoaPods allows multiple post_install blocks!
          // Actually, CocoaPods does NOT execute multiple post_install blocks. The last one overrides the previous.
          // So we must inject into the existing post_install.
          // We can replace the string "__apply_Xcode_12_5_M1_post_install_workaround(installer)" with itself + our patch.
          contents = contents.replace(
            /__apply_Xcode_12_5_M1_post_install_workaround\(installer\)/,
            "__apply_Xcode_12_5_M1_post_install_workaround(installer)" + patch
          );
          
          // If the workaround isn't there (newer Expo), just append it before the end of the file, assuming we can find the post_install block end
          if (!contents.includes("FIX FOR XCODE 16")) {
              contents = contents.replace(
                  /react_native_post_install[\s\S]*?\)/,
                  (match) => match + patch
              );
          }

          fs.writeFileSync(file, contents);
        }
      }
      return config;
    },
  ]);
};

module.exports = withFmtFix;
