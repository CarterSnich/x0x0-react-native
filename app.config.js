export default ({ config }) => {
  let appName = "x0x0";
  let slug = "x0x0";
  let scheme = "x0x0";
  let packageName = "com.cartersnich.x0x0";

  if (process.env.NODE_ENV === "development") {
    appName = "x0x0 DEV";
    slug = "x0x0-dev";
    scheme = "x0x0";
    packageName = "com.cartersnich.x0x0.dev";
  }

  return {
    name: appName,
    slug: slug,
    version: "0.0.2",
    githubUrl: "https://github.com/CarterSnich/x0x0-react-native",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: packageName,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      package: packageName,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-font",
      "expo-web-browser",
    ],
    extra: {
      router: {},
      eas: {
        projectId: "d29daeb4-7d54-45e5-bd69-bc5fc152fb71",
      },
    },
    owner: "cartersnich",
  };
};
