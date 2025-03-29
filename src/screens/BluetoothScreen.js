import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useConnection } from '../contexts/ConnectionContext';
import { checkBluetoothPermissions } from '../utils/permissions';
import DeviceList from '../components/DeviceList';
import LoadingIndicator from '../components/LoadingIndicator';

const BluetoothScreen = () => {
  const { 
    bluetoothState, 
    enableBluetooth, 
    disableBluetooth, 
    scanForDevices, 
    connectToDevice,
    disconnectFromDevice 
  } = useConnection();
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const result = await checkBluetoothPermissions();
      setHasPermissions(result);
      if (!result) {
        Alert.alert(
          'Bluetooth Permissions Required',
          'This app needs Bluetooth permissions to scan and connect to devices.',
          [{ text: 'OK' }]
        );
      }
    };
    
    checkPermissions();
  }, []);

  const handleToggleBluetooth = async () => {
    if (bluetoothState.enabled) {
      await disableBluetooth();
    } else {
      await enableBluetooth();
    }
  };

  const handleStartScan = async () => {
    if (!hasPermissions) {
      const result = await checkBluetoothPermissions();
      setHasPermissions(result);
      if (!result) return;
    }

    setIsScanning(true);
    try {
      await scanForDevices();
    } catch (error) {
      Alert.alert('Scanning Error', error.message || 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (device) => {
    try {
      await connectToDevice(device);
      Alert.alert('Success', `Connected to ${device.name || 'device'}`);
    } catch (error) {
      Alert.alert('Connection Error', error.message || 'Failed to connect to device');
    }
  };

  const handleDisconnectDevice = async () => {
    try {
      await disconnectFromDevice();
      Alert.alert('Success', 'Disconnected from device');
    } catch (error) {
      Alert.alert('Disconnection Error', error.message || 'Failed to disconnect from device');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable Bluetooth</Text>
          <Switch
            value={bluetoothState.enabled}
            onValueChange={handleToggleBluetooth}
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={bluetoothState.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {!hasPermissions && (
        <View style={styles.permissionWarning}>
          <Feather name="alert-circle" size={24} color="#f44336" />
          <Text style={styles.permissionText}>
            Bluetooth permissions are required for this feature
          </Text>
        </View>
      )}

      {bluetoothState.enabled && (
        <View style={styles.content}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={[styles.button, isScanning && styles.buttonDisabled]} 
              onPress={handleStartScan}
              disabled={isScanning}
            >
              <Feather name="search" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>
                {isScanning ? 'Scanning...' : 'Scan for Devices'}
              </Text>
            </TouchableOpacity>

            {bluetoothState.connectedDevice && (
              <TouchableOpacity 
                style={[styles.button, styles.disconnectButton]} 
                onPress={handleDisconnectDevice}
              >
                <Feather name="x-circle" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            )}
          </View>

          {isScanning && (
            <LoadingIndicator message="Scanning for Bluetooth devices..." />
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <DeviceList
              devices={bluetoothState.devices}
              connectedDevice={bluetoothState.connectedDevice}
              onSelectDevice={handleConnectDevice}
              emptyMessage="No Bluetooth devices found. Try scanning again."
            />
          </View>

          {bluetoothState.connectedDevice && (
            <View style={styles.connectedDeviceContainer}>
              <Text style={styles.sectionTitle}>Connected Device</Text>
              <View style={styles.connectedDeviceCard}>
                <Feather name="bluetooth" size={24} color="#4285F4" />
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>
                    {bluetoothState.connectedDevice.name || 'Unknown Device'}
                  </Text>
                  <Text style={styles.deviceId}>
                    ID: {bluetoothState.connectedDevice.id || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {!bluetoothState.enabled && (
        <View style={styles.enablePrompt}>
          <Feather name="bluetooth" size={64} color="#757575" />
          <Text style={styles.enableText}>
            Please enable Bluetooth to scan and connect to devices
          </Text>
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
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: 16,
    color: '#212121',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  permissionText: {
    marginLeft: 10,
    color: '#d32f2f',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 12,
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  connectedDeviceContainer: {
    marginTop: 20,
  },
  connectedDeviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  deviceId: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  enablePrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  enableText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BluetoothScreen;
