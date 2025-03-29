# Building an APK for ConnectivityApp

The ConnectivityApp is a React Native application built with Expo. To build an APK, you have several options:

## Option 1: Using EAS Build (Recommended)

EAS (Expo Application Services) is the recommended way to build native binaries for Expo applications.

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Configure your build:
```bash
eas build:configure
```

4. Build an APK:
```bash
eas build -p android --profile preview
```

This will start a build on Expo's servers and provide you with a link to download the APK when it's ready.

## Option 2: Building Locally (For Development)

If you need to build locally:

1. Run the Expo prebuild command:
```bash
npx expo prebuild --platform android
```

2. Navigate to the Android directory:
```bash
cd android
```

3. Build the debug APK:
```bash
./gradlew assembleDebug
```

4. Find the APK at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Option 3: Expo Classic Build (Legacy Approach)

If you're using an older version of Expo that supports classic builds:

```bash
expo build:android -t apk
```

## Additional Configuration

Your app is already properly configured in app.json with:
- Appropriate package name (`com.yourcompany.connectivityapp`)
- Required permissions for Bluetooth and WiFi
- Adaptive icons 

You may want to update the package name in app.json to match your organization's domain name before building.

## Building for Production

For production builds, you will need to:
1. Generate a keystore for signing your app
2. Configure build settings in app.json
3. Use EAS build with a production profile:
```bash
eas build -p android --profile production
```