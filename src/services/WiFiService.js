import { Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { checkWiFiPermissions } from '../utils/permissions';

class WiFiService {
  constructor() {
    this._networks = [];
    this._connectedNetwork = null;
    this._isEnabled = false;
    this._subscribers = [];
    
    // Initial check for WiFi status
    this._checkWiFiStatus();
  }

  // Get current state
  get state() {
    return {
      enabled: this._isEnabled,
      networks: [...this._networks],
      connectedNetwork: this._connectedNetwork,
    };
  }

  // Subscribe to changes
  subscribe(callback) {
    if (typeof callback === 'function' && !this._subscribers.includes(callback)) {
      this._subscribers.push(callback);
    }
    return () => this.unsubscribe(callback);
  }

  // Unsubscribe from changes
  unsubscribe(callback) {
    this._subscribers = this._subscribers.filter(cb => cb !== callback);
  }

  // Notify all subscribers
  _notifySubscribers() {
    this._subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in WiFi subscriber callback:', error);
      }
    });
  }

  // Check WiFi status
  async _checkWiFiStatus() {
    try {
      const isEnabled = await WifiManager.isEnabled();
      
      if (this._isEnabled !== isEnabled) {
        this._isEnabled = isEnabled;
        this._notifySubscribers();
      }
      
      if (isEnabled) {
        // Try to get the current SSID
        try {
          const SSID = await WifiManager.getCurrentWifiSSID();
          if (SSID) {
            this._connectedNetwork = { SSID };
            this._notifySubscribers();
          }
        } catch (error) {
          console.log('Could not get current SSID:', error);
        }
      }
      
      return isEnabled;
    } catch (error) {
      console.error('Error checking WiFi status:', error);
      return false;
    }
  }

  // Enable WiFi
  async enableWifi() {
    try {
      // This only works on Android
      if (Platform.OS === 'android') {
        await WifiManager.setEnabled(true);
      }
      
      // On iOS, we need to wait for the user to enable it manually
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isEnabled = await this._checkWiFiStatus();
      if (!isEnabled && Platform.OS === 'ios') {
        throw new Error('Please enable WiFi manually in settings.');
      }
      
      return isEnabled;
    } catch (error) {
      console.error('Error enabling WiFi:', error);
      throw new Error('Could not enable WiFi: ' + error.message);
    }
  }

  // Disable WiFi
  async disableWifi() {
    try {
      // This only works on Android
      if (Platform.OS === 'android') {
        await WifiManager.setEnabled(false);
      }
      
      // On iOS, we need to wait for the user to disable it manually
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isEnabled = await this._checkWiFiStatus();
      if (isEnabled && Platform.OS === 'ios') {
        throw new Error('Please disable WiFi manually in settings.');
      }
      
      return !isEnabled;
    } catch (error) {
      console.error('Error disabling WiFi:', error);
      throw new Error('Could not disable WiFi: ' + error.message);
    }
  }

  // Scan for networks
  async scanForNetworks() {
    try {
      const hasPermissions = await checkWiFiPermissions();
      if (!hasPermissions) {
        throw new Error('Location permissions are required to scan for WiFi networks.');
      }

      if (!this._isEnabled) {
        throw new Error('WiFi is not enabled. Please enable WiFi first.');
      }

      const networks = await WifiManager.loadWifiList();
      
      // Transform the network data
      this._networks = networks.map(network => ({
        SSID: network.SSID,
        BSSID: network.BSSID,
        capabilities: network.capabilities || '',
        frequency: network.frequency,
        level: network.level,
        timestamp: network.timestamp,
      }));
      
      this._notifySubscribers();
      return [...this._networks];
    } catch (error) {
      console.error('Error scanning for WiFi networks:', error);
      throw new Error('Failed to scan for networks: ' + error.message);
    }
  }

  // Connect to network
  async connectToNetwork(network, password = '') {
    try {
      if (!network || !network.SSID) {
        throw new Error('Invalid network object');
      }
      
      if (!this._isEnabled) {
        throw new Error('WiFi is not enabled. Please enable WiFi first.');
      }

      // Check if the network requires a password
      const requiresPassword = network.capabilities && (
        network.capabilities.includes('WPA') || 
        network.capabilities.includes('WEP')
      );
      
      if (requiresPassword && !password) {
        throw new Error('This network requires a password.');
      }

      // Connect to the network
      if (requiresPassword) {
        await WifiManager.connectToProtectedSSID(
          network.SSID,
          password,
          false // Join hidden network: false
        );
      } else {
        await WifiManager.connectToSSID(network.SSID);
      }
      
      // Wait a moment for the connection to establish
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify the connection
      const connectedSSID = await WifiManager.getCurrentWifiSSID();
      
      if (connectedSSID === network.SSID) {
        this._connectedNetwork = { ...network };
        this._notifySubscribers();
        return true;
      } else {
        throw new Error('Failed to connect to the network.');
      }
    } catch (error) {
      console.error('Error connecting to WiFi network:', error);
      throw new Error('Failed to connect to network: ' + error.message);
    }
  }

  // Disconnect from network
  async disconnectFromNetwork() {
    try {
      if (Platform.OS === 'android') {
        // On Android, we can disconnect programmatically
        await WifiManager.disconnect();
      } else {
        // On iOS, we need to provide instructions to the user
        throw new Error('Please disconnect from WiFi network manually in settings.');
      }
      
      this._connectedNetwork = null;
      this._notifySubscribers();
      return true;
    } catch (error) {
      console.error('Error disconnecting from WiFi network:', error);
      throw new Error('Failed to disconnect from network: ' + error.message);
    }
  }
}

// Create a singleton instance
const wifiService = new WiFiService();

export default wifiService;
