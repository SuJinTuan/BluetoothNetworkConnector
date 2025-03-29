import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useExportService } from '../services/ExportService';

const ExportScreen = () => {
  const { exportCode, exportState } = useExportService();
  const [activeTab, setActiveTab] = useState('project');

  const handleExport = async () => {
    try {
      await exportCode();
      Alert.alert(
        'Export Successful', 
        'The code has been successfully exported and is ready to share.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Export Failed', 
        error.message || 'There was a problem exporting the code.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShare = async () => {
    if (!exportState.exportedPath) {
      Alert.alert('Export Required', 'Please export the code first.');
      return;
    }

    try {
      await Share.share({
        title: 'ConnectivityApp Code',
        message: `Here's the code for the ConnectivityApp: ${exportState.exportedPath}`,
        url: exportState.exportedPath,
      });
    } catch (error) {
      Alert.alert(
        'Sharing Failed',
        error.message || 'There was a problem sharing the code.',
        [{ text: 'OK' }]
      );
    }
  };

  // Sample code preview (for demonstration)
  const codeExamples = {
    project: 
`// ConnectivityApp Project Structure
|-- App.js                    // Main app component
|-- assets/                   // App assets
|   |-- html/
|       |-- demo.html         // Demo H5 page
|       |-- bridge.js         // JavaScript bridge for H5-app communication
|-- src/
|   |-- components/          // Reusable UI components
|   |-- contexts/            // React contexts for state management
|   |-- navigation/          // Navigation configuration
|   |-- screens/             // App screens
|   |-- services/            // Services for Bluetooth, WiFi, etc.
|   |-- utils/               // Utility functions`,

    bluetooth: 
`// BluetoothService.js
import { BleManager } from 'react-native-ble-plx';

export class BluetoothService {
  constructor() {
    this.manager = new BleManager();
    this.devices = [];
    this.connectedDevice = null;
  }

  // Enable Bluetooth
  async enableBluetooth() {
    return await this.manager.enable();
  }

  // Scan for devices
  async scanForDevices() {
    return new Promise((resolve, reject) => {
      this.devices = [];
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          this.manager.stopDeviceScan();
          reject(error);
          return;
        }
        
        if (device && !this.devices.find(d => d.id === device.id)) {
          this.devices.push(device);
        }
      });

      // Stop scan after 10 seconds
      setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve(this.devices);
      }, 10000);
    });
  }

  // Connect to device
  async connectToDevice(device) {
    try {
      const connectedDevice = await device.connect();
      this.connectedDevice = connectedDevice;
      return connectedDevice;
    } catch (error) {
      throw new Error(\`Connection failed: \${error.message}\`);
    }
  }
}`,

    wifi: 
`// WiFiService.js
import WifiManager from 'react-native-wifi-reborn';

export class WiFiService {
  constructor() {
    this.networks = [];
    this.connectedNetwork = null;
  }

  // Check if WiFi is enabled
  async isWifiEnabled() {
    return await WifiManager.isEnabled();
  }

  // Enable WiFi
  async enableWifi() {
    return await WifiManager.setEnabled(true);
  }

  // Scan for networks
  async scanForNetworks() {
    try {
      this.networks = await WifiManager.loadWifiList();
      return this.networks;
    } catch (error) {
      throw new Error(\`Scanning failed: \${error.message}\`);
    }
  }

  // Connect to network
  async connectToNetwork(SSID, password) {
    try {
      await WifiManager.connectToProtectedSSID(SSID, password, false);
      this.connectedNetwork = { SSID };
      return true;
    } catch (error) {
      throw new Error(\`Connection failed: \${error.message}\`);
    }
  }
}`,

    webview: 
`// WebViewBridge.js
export class WebViewBridge {
  constructor(webViewRef) {
    this.webViewRef = webViewRef;
  }

  // Send message to WebView
  sendMessage(message) {
    if (!this.webViewRef.current) return false;
    
    const script = \`
      if (window.connectivityBridge && typeof window.connectivityBridge.receiveMessage === 'function') {
        window.connectivityBridge.receiveMessage(${JSON.stringify(message)});
      }
      true;
    \`;
    
    this.webViewRef.current.injectJavaScript(script);
    return true;
  }

  // Update connection status in WebView
  updateConnectionStatus(bluetoothStatus, wifiStatus, bluetoothDevice, wifiNetwork) {
    if (!this.webViewRef.current) return false;
    
    const script = \`
      if (window.connectivityBridge && typeof window.connectivityBridge.updateConnectionStatus === 'function') {
        window.connectivityBridge.updateConnectionStatus(
          ${bluetoothStatus},
          ${wifiStatus},
          ${bluetoothDevice ? \`"\${bluetoothDevice}"\` : null},
          ${wifiNetwork ? \`"\${wifiNetwork}"\` : null}
        );
      }
      true;
    \`;
    
    this.webViewRef.current.injectJavaScript(script);
    return true;
  }
}`
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Code</Text>
        <Text style={styles.subtitle}>
          Export and share the app code for customization
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'project' && styles.activeTab]} 
          onPress={() => setActiveTab('project')}
        >
          <Text style={[styles.tabText, activeTab === 'project' && styles.activeTabText]}>Project</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bluetooth' && styles.activeTab]} 
          onPress={() => setActiveTab('bluetooth')}
        >
          <Text style={[styles.tabText, activeTab === 'bluetooth' && styles.activeTabText]}>Bluetooth</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'wifi' && styles.activeTab]} 
          onPress={() => setActiveTab('wifi')}
        >
          <Text style={[styles.tabText, activeTab === 'wifi' && styles.activeTabText]}>WiFi</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'webview' && styles.activeTab]} 
          onPress={() => setActiveTab('webview')}
        >
          <Text style={[styles.tabText, activeTab === 'webview' && styles.activeTabText]}>WebView</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeContainer}>
        <ScrollView style={styles.codeScroll}>
          <Text style={styles.codeText}>{codeExamples[activeTab]}</Text>
        </ScrollView>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleExport}
          disabled={exportState.isExporting}
        >
          {exportState.isExporting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Feather name="download" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Export Code</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.shareButton, !exportState.exportedPath && styles.disabledButton]} 
          onPress={handleShare}
          disabled={!exportState.exportedPath}
        >
          <Feather name="share-2" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Share Code</Text>
        </TouchableOpacity>
      </View>

      {exportState.exportedPath && (
        <View style={styles.exportInfoContainer}>
          <Text style={styles.exportInfoTitle}>Export Successful</Text>
          <Text style={styles.exportInfoPath}>Path: {exportState.exportedPath}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  codeContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
  },
  codeScroll: {
    padding: 16,
  },
  codeText: {
    color: '#e0e0e0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#34a853',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exportInfoContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  exportInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  exportInfoPath: {
    fontSize: 14,
    color: '#388e3c',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ExportScreen;
