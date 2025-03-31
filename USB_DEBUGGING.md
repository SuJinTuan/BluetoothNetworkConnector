# USB Debugging for ConnectivityApp

This guide provides instructions to set up USB debugging for the ConnectivityApp, allowing you to connect your physical device via USB for testing.

## Prerequisites

- Android device with Android 5.0 or higher
- USB cable
- Android Debug Bridge (adb) installed on your development machine
- Expo Go app installed on your Android device

## Setup Steps

### 1. Enable Developer Options on Your Android Device

1. Open **Settings** on your Android device
2. Scroll down and tap **About phone** (or **About device**)
3. Find the **Build number** entry
4. Tap on **Build number** 7 times until you see a message that you are now a developer
5. Go back to the main **Settings** screen
6. You should now see **Developer options** (usually near the bottom)

### 2. Enable USB Debugging on Your Android Device

1. Open **Settings** on your Android device
2. Navigate to **System** > **Developer options** (location may vary depending on your device)
3. Turn on the **USB debugging** toggle
4. Connect your device to your computer via USB
5. You may see a prompt on your device asking to allow USB debugging - tap **Allow**

### 3. Forward ADB Ports for Expo

Once your device is connected, you need to forward the required ports through ADB:

```bash
# Forward the Metro Bundler port (5000)
adb reverse tcp:5000 tcp:5000

# Forward the dev server port (19000)
adb reverse tcp:19000 tcp:19000

# Forward the dev socket port (19001)
adb reverse tcp:19001 tcp:19001

# Forward the Expo Developer Tools port (19002)
adb reverse tcp:19002 tcp:19002
```

### 4. Start the Application with USB Debugging Support

In your ConnectivityApp project:

1. Run the start script that uses the `--localhost` flag:
   ```bash
   # On Linux/macOS:
   ./start.sh
   
   # On Windows:
   start.bat
   ```

2. Alternatively, run the Expo command directly:
   ```bash
   npx expo start --port=5000 --localhost
   ```

The `--localhost` flag tells Expo to send your app to your mobile device over USB, rather than over LAN.

### 5. Connect Your Device to Expo

There are two ways to connect:

#### Option 1: Using Expo Go
1. Open the **Expo Go** app on your Android device
2. Tap on **Scan QR Code** and scan the QR code shown in your terminal

#### Option 2: Using Expo Go's Development URL
1. Open the **Expo Go** app on your Android device
2. Tap on the **Profile** tab
3. Tap on **Enter URL manually**
4. Enter: `exp://127.0.0.1:5000`

### 6. Verify Connection

Once connected, you should see the app loading on your device. You'll also see console logs from your device appearing in your terminal window.

## Debugging Tips

1. **Check Device Connection**:
   ```bash
   adb devices
   ```
   This should list your connected device.

2. **Reset ADB if Connection Issues Occur**:
   ```bash
   adb kill-server
   adb start-server
   ```

3. **Check Metro Bundler Status**:
   Make sure the Metro Bundler is running with the QR code displayed in your terminal.

4. **Reload App**:
   - In Expo Go, shake your device to open the developer menu
   - Tap **Reload** to refresh the app

5. **View Detailed Logs**:
   ```bash
   adb logcat *:E
   ```
   This shows error logs from your device.

## Additional Notes for Bluetooth and WiFi Testing

- For Bluetooth and WiFi functionality, your app requires permissions that should be granted when prompted
- For Android 12+, you might need to enable precise location in the device settings
- When testing Bluetooth functionality, make sure Bluetooth is enabled on your device
- For WiFi scanning, you need to have location services enabled on your device

## Troubleshooting

- **Connection Refused**: Check if the port forwarding is properly set up with ADB
- **Timeout Error**: Try restarting the Metro Bundler and reconnecting your device
- **Module Not Found**: Try clearing the Metro Bundler cache with `npx expo start -c`
- **Permission Issues**: Make sure all required permissions are granted in your device settings