const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

// The ads package sets `googleAdsJson` when app.json has no root key.
// Gradle then crashes reading `googleMobileAdsJson`. Rename that assignment
// before the Android build evaluates the module.
function withGoogleMobileAdsJson(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const file = path.join(
        config.modRequest.projectRoot,
        "node_modules/react-native-google-mobile-ads/android/app-json.gradle",
      );
      if (!fs.existsSync(file)) return config;
      const source = fs.readFileSync(file, "utf8");
      const fixed = source.replace(
        "rootProject.ext.googleAdsJson = false",
        "rootProject.ext.googleMobileAdsJson = false",
      );
      if (fixed !== source) fs.writeFileSync(file, fixed);
      return config;
    },
  ]);
}

module.exports = withGoogleMobileAdsJson;
