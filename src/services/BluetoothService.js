import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { checkBluetoothPermissions } from '../utils/permissions';

class BluetoothService {
  constructor() {
    this._manager = new BleManager();
    this._devices = [];
    this._connectedDevice = null;
    this._isEnabled = false;
    this._subscribers = [];
    
    // Monitor Bluetooth state
    this._manager.onStateChange((state) => {
      const isEnabled = state === 'PoweredOn';
      if (this._isEnabled !== isEnabled) {
        this._isEnabled = isEnabled;
        this._notifySubscribers();
      }
    }, true);
  }

  // Get current state
  get state() {
    return {
      enabled: this._isEnabled,
      devices: [...this._devices],
      connectedDevice: this._connectedDevice,
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
        console.error('Error in bluetooth subscriber callback:', error);
      }
    });
  }

  // Check if Bluetooth is available
  async isBluetoothAvailable() {
    try {
      const state = await this._manager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      return false;
    }
  }

  // Enable Bluetooth
  async enableBluetooth() {
    try {
      // This works only on Android
      if (Platform.OS === 'android') {
        await this._manager.enable();
      }
      
      // On iOS, we need to wait for the user to enable it manually
      const isEnabled = await this.isBluetoothAvailable();
      this._isEnabled = isEnabled;
      this._notifySubscribers();
      
      return isEnabled;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      throw new Error('Could not enable Bluetooth. Please enable it manually in settings.');
    }
  }

  // Disable Bluetooth
  async disableBluetooth() {
    try {
      // This works only on Android
      if (Platform.OS === 'android') {
        await this._manager.disable();
      }
      
      // On iOS, we need to wait for the user to disable it manually
      this._isEnabled = false;
      this._notifySubscribers();
      
      return true;
    } catch (error) {
      console.error('Error disabling Bluetooth:', error);
      throw new Error('Could not disable Bluetooth. Please disable it manually in settings.');
    }
  }

  // Scan for devices
  async scanForDevices(timeoutMs = 10000) {
    try {
      const hasPermissions = await checkBluetoothPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions are required to scan for devices.');
      }

      this._devices = [];
      
      return new Promise((resolve, reject) => {
        this._manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            this._manager.stopDeviceScan();
            reject(error);
            return;
          }
          
          if (device && !this._devices.find(d => d.id === device.id)) {
            this._devices.push({
              id: device.id,
              name: device.name || 'Unknown Device',
              rssi: device.rssi,
              serviceUUIDs: device.serviceUUIDs || [],
              isConnectable: device.isConnectable,
              _device: device // Keep a reference to the original device object
            });
            
            this._notifySubscribers();
          }
        });

        // Stop scan after specified timeout
        setTimeout(() => {
          this._manager.stopDeviceScan();
          resolve([...this._devices]);
        }, timeoutMs);
      });
    } catch (error) {
      console.error('Error scanning for Bluetooth devices:', error);
      throw new Error('Failed to scan for devices: ' + error.message);
    }
  }

  // Stop scanning
  stopScan() {
    this._manager.stopDeviceScan();
  }

  // Connect to device
  async connectToDevice(device) {
    try {
      if (!device || !device._device) {
        throw new Error('Invalid device object');
      }
      
      // Disconnect from any currently connected device
      if (this._connectedDevice) {
        await this.disconnectFromDevice();
      }

      // Connect to the device
      const connectedDevice = await device._device.connect();
      
      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      this._connectedDevice = {
        id: connectedDevice.id,
        name: connectedDevice.name || 'Unknown Device',
        services: [],
        _device: connectedDevice
      };
      
      this._notifySubscribers();
      return this._connectedDevice;
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      throw new Error('Failed to connect to device: ' + error.message);
    }
  }

  // Disconnect from device
  async disconnectFromDevice() {
    try {
      if (this._connectedDevice && this._connectedDevice._device) {
        await this._connectedDevice._device.cancelConnection();
        this._connectedDevice = null;
        this._notifySubscribers();
      }
      return true;
    } catch (error) {
      console.error('Error disconnecting from Bluetooth device:', error);
      throw new Error('Failed to disconnect from device: ' + error.message);
    }
  }

  // Clean up resources
  destroy() {
    this.stopScan();
    if (this._connectedDevice) {
      this.disconnectFromDevice().catch(console.error);
    }
    this._subscribers = [];
  }
}

// Create a singleton instance
const bluetoothService = new BluetoothService();

export default bluetoothService;
