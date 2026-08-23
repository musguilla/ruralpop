import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_EQUIPOP = process.env.APP_VARIANT === 'equipop';
const VERSION = '1.0.58';
const BUILD_NUMBER = 107;

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: IS_EQUIPOP ? "Equipop" : "Ruralpop",
    slug: IS_EQUIPOP ? "equipop" : "ruralpop-mobile",
    scheme: IS_EQUIPOP ? "equipop" : "ruralpop",
    version: VERSION,
    orientation: "portrait",
    icon: IS_EQUIPOP ? "./assets/equipop/icon.png" : "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: IS_EQUIPOP ? "./assets/equipop/splash-icon.png" : "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: IS_EQUIPOP ? "#1E3A8A" : "#1D2422" // Blue for Equipop, Dark for Ruralpop
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_EQUIPOP ? "com.equipop.app" : "com.ruralpop.ruralpopapp",
      buildNumber: BUILD_NUMBER.toString(),
      associatedDomains: IS_EQUIPOP 
        ? ["applinks:equipop.app", "applinks:www.equipop.app"] 
        : ["applinks:ruralpop.com", "applinks:www.ruralpop.com"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleDevelopmentRegion: "es",
        CFBundleAllowMixedLocalizations: true
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: IS_EQUIPOP ? "./assets/equipop/icon.png" : "./assets/icon.png",
        backgroundColor: IS_EQUIPOP ? "#1E3A8A" : "#059669"
      },
      package: IS_EQUIPOP ? "com.equipop.app" : "com.ruralpop.app",
      versionCode: BUILD_NUMBER,
      permissions: [
        "com.google.android.gms.permission.AD_ID",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            { scheme: "https", host: IS_EQUIPOP ? "equipop.app" : "ruralpop.com" },
            { scheme: "https", host: IS_EQUIPOP ? "www.equipop.app" : "www.ruralpop.com" }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: IS_EQUIPOP ? "./assets/equipop/icon.png" : "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: `${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} necesita acceso a tus fotos para que puedas añadir imágenes a tus anuncios.`,
          cameraPermission: `${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} necesita acceso a la cámara para que puedas tomar fotos para tus anuncios.`
        }
      ],
      "expo-notifications",
      [
        "expo-build-properties",
        {}
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: "ca-app-pub-2042067618462129~3393473801",
          iosAppId: "ca-app-pub-2042067618462129~3393473801",
          userTrackingUsageDescription: `${IS_EQUIPOP ? 'Equipop' : 'Ruralpop'} utiliza tu identificador para ofrecerte publicidad y contenido adaptado a tus intereses.`
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: IS_EQUIPOP ? "merchant.com.equipop.app" : "merchant.com.ruralpop.ruralpopapp",
          enableGooglePay: false
        }
      ],
      "expo-tracking-transparency",
      "./plugins/withFmtFix.js"
    ],
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: IS_EQUIPOP ? "5dcbb92f-75a1-4e54-aa8b-8757e29f5d9b" : "0db84bcc-5fb6-4cf2-9e28-525900e9a799"
      }
    },
    owner: "ruralpop",
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: IS_EQUIPOP ? "https://u.expo.dev/5dcbb92f-75a1-4e54-aa8b-8757e29f5d9b" : "https://u.expo.dev/0db84bcc-5fb6-4cf2-9e28-525900e9a799"
    }
  };
};
