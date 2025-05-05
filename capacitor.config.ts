import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.RawdahRemodeling.RawdahRemodeling',
    appName: 'Remo App',
    webDir: 'build',
    server: {
        androidScheme: 'https',
        allowNavigation: ['localhost'],
    },
    android: {
        allowMixedContent: false,
        minSdk: 23,  // Aligned with Gradle
        targetSdkVersion: 35,  // Aligned with Gradle
        arch: {
            arm64: true,
            x86: false,
            x86_64: false,  // Disabled for smaller APK
        },
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            launchAutoHide: true,
            backgroundColor: '#ffffffff',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        },
        StatusBar: {
            visible: true,
            style: 'light',
        },
    },
};

export default config;