import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { zip } from 'react-native-zip-archive';
import * as Sharing from 'expo-sharing';

// Create a context for the export service
const ExportServiceContext = React.createContext();

// Export hook for accessing the export service
export const useExportService = () => useContext(ExportServiceContext);

// Export provider component
export const ExportServiceProvider = ({ children }) => {
  const [exportState, setExportState] = useState({
    isExporting: false,
    exportedPath: null,
    error: null,
  });

  // Function to export the code
  const exportCode = useCallback(async () => {
    try {
      setExportState(prev => ({ ...prev, isExporting: true, error: null }));

      // Define the base directory for exporting
      const baseDir = `${FileSystem.documentDirectory}ConnectivityApp/`;
      
      // Ensure the directory exists
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });

      // Array of files to export
      const filesToExport = [
        {
          path: 'App.js',
          content: `import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { ConnectionProvider } from './src/contexts/ConnectionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectionProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </ConnectionProvider>
    </SafeAreaProvider>
  );
}`
        },
        {
          path: 'src/contexts/ConnectionContext.js',
          content: `import React, { createContext, useContext, useState, useEffect } from 'react';
import bluetoothService from '../services/BluetoothService';
import wifiService from '../services/WiFiService';

// Create the context
const ConnectionContext = createContext();

// Custom hook to use the context
export const useConnection = () => useContext(ConnectionContext);

// Provider component
export const ConnectionProvider = ({ children }) => {
  // State for Bluetooth
  const [bluetoothState, setBluetoothState] = useState({
    enabled: false,
    devices: [],
    connectedDevice: null,
  });

  // State for WiFi
  const [wifiState, setWifiState] = useState({
    enabled: false,
    networks: [],
    connectedNetwork: null,
  });

  // Subscribe to services on mount
  useEffect(() => {
    // Subscribe to Bluetooth service
    const bluetoothUnsubscribe = bluetoothService.subscribe(state => {
      setBluetoothState(state);
    });

    // Subscribe to WiFi service
    const wifiUnsubscribe = wifiService.subscribe(state => {
      setWifiState(state);
    });

    // Unsubscribe on unmount
    return () => {
      bluetoothUnsubscribe();
      wifiUnsubscribe();
    };
  }, []);

  // Bluetooth methods
  const enableBluetooth = async () => await bluetoothService.enableBluetooth();
  const disableBluetooth = async () => await bluetoothService.disableBluetooth();
  const scanForDevices = async () => await bluetoothService.scanForDevices();
  const connectToDevice = async (device) => await bluetoothService.connectToDevice(device);
  const disconnectFromDevice = async () => await bluetoothService.disconnectFromDevice();

  // WiFi methods
  const enableWifi = async () => await wifiService.enableWifi();
  const disableWifi = async () => await wifiService.disableWifi();
  const scanForNetworks = async () => await wifiService.scanForNetworks();
  const connectToNetwork = async (network, password) => {
    return await wifiService.connectToNetwork(network, password);
  };
  const disconnectFromNetwork = async () => await wifiService.disconnectFromNetwork();

  // Context value
  const value = {
    bluetoothState,
    wifiState,
    enableBluetooth,
    disableBluetooth,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    enableWifi,
    disableWifi,
    scanForNetworks,
    connectToNetwork,
    disconnectFromNetwork,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};`
        },
        {
          path: 'src/utils/permissions.js',
          content: `import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Check Bluetooth permissions
export const checkBluetoothPermissions = async () => {
  try {
    let permissionResult;
    
    if (Platform.OS === 'ios') {
      permissionResult = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 31) { // Android 12+
        const fineLocation = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const bluetoothScan = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        const bluetoothConnect = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        
        permissionResult = (
          fineLocation === RESULTS.GRANTED &&
          bluetoothScan === RESULTS.GRANTED &&
          bluetoothConnect === RESULTS.GRANTED
        ) ? RESULTS.GRANTED : RESULTS.DENIED;
      } else {
        permissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    }
    
    return permissionResult === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking Bluetooth permissions:', error);
    return false;
  }
};

// Check WiFi permissions
export const checkWiFiPermissions = async () => {
  try {
    let permissionResult;
    
    if (Platform.OS === 'ios') {
      permissionResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 29) { // Android 10+
        permissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } else {
        const fineLocation = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const coarseLocation = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
        
        permissionResult = (
          fineLocation === RESULTS.GRANTED ||
          coarseLocation === RESULTS.GRANTED
        ) ? RESULTS.GRANTED : RESULTS.DENIED;
      }
    }
    
    return permissionResult === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking WiFi permissions:', error);
    return false;
  }
};`
        },
        {
          path: 'assets/html/demo.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>H5 Connectivity Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      max-width: 100%;
      margin: 0 auto;
      color: #333;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card {
      background-color: #fff;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    button {
      background-color: #4285F4;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      margin: 5px;
    }
    input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .status {
      font-weight: bold;
    }
    .connected {
      color: green;
    }
    .disconnected {
      color: red;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>H5 Connectivity Demo</h1>
      <p>This page demonstrates bidirectional communication between an H5 page and the native app.</p>
    </div>
    
    <div class="card">
      <h2>Device Status</h2>
      <p>Bluetooth Status: <span id="bluetoothStatus" class="status disconnected">Unknown</span></p>
      <p>WiFi Status: <span id="wifiStatus" class="status disconnected">Unknown</span></p>
      <button onclick="getConnectionStatus()">Refresh Status</button>
    </div>
    
    <div class="card">
      <h2>Send Message to Native App</h2>
      <input type="text" id="messageInput" placeholder="Type a message...">
      <button onclick="sendMessageToApp()">Send</button>
    </div>
    
    <div class="card">
      <h2>Messages from App</h2>
      <pre id="messagesLog"></pre>
    </div>
  </div>

  <script src="bridge.js"></script>
</body>
</html>`
        },
        {
          path: 'assets/html/bridge.js',
          content: `// Create a bridge object to communicate with the native app
window.connectivityBridge = {
  receiveMessage: function(message) {
    const messagesLog = document.getElementById('messagesLog');
    messagesLog.textContent += '→ ' + message + '\\n';
  },
  
  updateConnectionStatus: function(bluetoothStatus, wifiStatus, bluetoothDevice, wifiNetwork) {
    const bluetoothStatusEl = document.getElementById('bluetoothStatus');
    const wifiStatusEl = document.getElementById('wifiStatus');
    
    bluetoothStatusEl.textContent = bluetoothStatus ? 'Connected' : 'Disconnected';
    bluetoothStatusEl.className = 'status ' + (bluetoothStatus ? 'connected' : 'disconnected');
    
    if (bluetoothDevice) {
      bluetoothStatusEl.textContent += ' (' + bluetoothDevice + ')';
    }
    
    wifiStatusEl.textContent = wifiStatus ? 'Connected' : 'Disconnected';
    wifiStatusEl.className = 'status ' + (wifiStatus ? 'connected' : 'disconnected');
    
    if (wifiNetwork) {
      wifiStatusEl.textContent += ' (' + wifiNetwork + ')';
    }
  }
};

function getConnectionStatus() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'getConnectionStatus'
  }));
}

function sendMessageToApp() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (message) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'message',
      content: message
    }));
    messageInput.value = '';
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  getConnectionStatus();
});`
        },
        {
          path: 'README.md',
          content: `# Connectivity App

A mobile application that enables Bluetooth/WiFi connections and embeds H5 pages with bidirectional communication capabilities.

## Features

- Connect devices to Bluetooth networks
- Connect devices to WiFi networks
- Embed and display H5 web pages
- Enable communication between the app and embedded H5 pages
- Export code functionality

## Installation

1. Clone this repository:
\`\`\`
git clone https://github.com/yourusername/connectivity-app.git
cd connectivity-app
\`\`\`

2. Install dependencies:
\`\`\`
npm install
\`\`\`

3. Run the app:
\`\`\`
npx react-native run-android
\`\`\`
or
\`\`\`
npx react-native run-ios
\`\`\`

## Required Dependencies

- React Native
- @react-navigation/native
- @react-navigation/bottom-tabs
- @react-navigation/native-stack
- react-native-ble-plx
- react-native-wifi-reborn
- react-native-webview
- react-native-permissions
- react-native-safe-area-context
- react-native-screens
- @expo/vector-icons

## Project Structure

- \`App.js\`: Main app component
- \`assets/\`: App assets
  - \`html/\`: HTML files for the WebView
- \`src/\`: Source code
  - \`components/\`: Reusable UI components
  - \`contexts/\`: React contexts for state management
  - \`navigation/\`: Navigation configuration
  - \`screens/\`: App screens
  - \`services/\`: Services for Bluetooth, WiFi, etc.
  - \`utils/\`: Utility functions

## License

MIT
`
        },
        // Add more files as needed
      ];

      // Write all files
      for (const file of filesToExport) {
        const filePath = `${baseDir}${file.path}`;
        
        // Ensure directory exists
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        
        // Write file
        await FileSystem.writeAsStringAsync(filePath, file.content);
      }

      // Create a ZIP file
      const zipPath = `${FileSystem.documentDirectory}ConnectivityApp.zip`;
      await zip(baseDir, zipPath);

      // Share the ZIP file if possible
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipPath);
      }

      setExportState(prev => ({
        ...prev,
        isExporting: false,
        exportedPath: zipPath,
      }));

      return zipPath;
    } catch (error) {
      console.error('Error exporting code:', error);
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        error: error.message || 'Failed to export code',
      }));
      throw error;
    }
  }, []);

  const value = {
    exportCode,
    exportState,
  };

  return (
    <ExportServiceContext.Provider value={value}>
      {children}
    </ExportServiceContext.Provider>
  );
};

export default function useExportServiceSetup() {
  const [exportState, setExportState] = useState({
    isExporting: false,
    exportedPath: null,
    error: null,
  });

  const exportCode = useCallback(async () => {
    setExportState(prev => ({ ...prev, isExporting: true }));
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportedPath = Platform.OS === 'ios' 
      ? '/path/to/exported/code.zip'
      : '/storage/emulated/0/Download/ConnectivityApp.zip';
    
    setExportState({
      isExporting: false,
      exportedPath,
      error: null,
    });
    
    return exportedPath;
  }, []);

  return {
    exportCode,
    exportState,
  };
}
