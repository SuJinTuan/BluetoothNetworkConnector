import React, { createContext, useContext, useState, useEffect } from 'react';
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
};
