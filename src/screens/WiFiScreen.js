import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useConnection } from '../contexts/ConnectionContext';
import { checkWiFiPermissions } from '../utils/permissions';
import NetworkList from '../components/NetworkList';
import LoadingIndicator from '../components/LoadingIndicator';

const WiFiScreen = () => {
  const { 
    wifiState, 
    enableWifi, 
    disableWifi, 
    scanForNetworks, 
    connectToNetwork,
    disconnectFromNetwork
  } = useConnection();
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkPermissions = async () => {
      const result = await checkWiFiPermissions();
      setHasPermissions(result);
      if (!result) {
        Alert.alert(
          'Location Permissions Required',
          'This app needs location permissions to scan for WiFi networks.',
          [{ text: 'OK' }]
        );
      }
    };
    
    checkPermissions();
  }, []);

  const handleToggleWifi = async () => {
    if (wifiState.enabled) {
      await disableWifi();
    } else {
      await enableWifi();
    }
  };

  const handleStartScan = async () => {
    if (!hasPermissions) {
      const result = await checkWiFiPermissions();
      setHasPermissions(result);
      if (!result) return;
    }

    setIsScanning(true);
    try {
      await scanForNetworks();
    } catch (error) {
      Alert.alert('Scanning Error', error.message || 'Failed to scan for networks');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectNetwork = (network) => {
    setSelectedNetwork(network);
    if (network.capabilities.includes('WPA') || network.capabilities.includes('WEP')) {
      setShowPasswordModal(true);
    } else {
      handleConnectToNetwork(network, '');
    }
  };

  const handleConnectToNetwork = async (network, networkPassword) => {
    try {
      await connectToNetwork(network, networkPassword);
      Alert.alert('Success', `Connected to ${network.SSID}`);
    } catch (error) {
      Alert.alert('Connection Error', error.message || 'Failed to connect to network');
    }
  };

  const handleDisconnectNetwork = async () => {
    try {
      await disconnectFromNetwork();
      Alert.alert('Success', 'Disconnected from network');
    } catch (error) {
      Alert.alert('Disconnection Error', error.message || 'Failed to disconnect from network');
    }
  };

  const handlePasswordSubmit = () => {
    setShowPasswordModal(false);
    if (selectedNetwork) {
      handleConnectToNetwork(selectedNetwork, password);
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WiFi</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable WiFi</Text>
          <Switch
            value={wifiState.enabled}
            onValueChange={handleToggleWifi}
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={wifiState.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {!hasPermissions && (
        <View style={styles.permissionWarning}>
          <Feather name="alert-circle" size={24} color="#f44336" />
          <Text style={styles.permissionText}>
            Location permissions are required to scan for WiFi networks
          </Text>
        </View>
      )}

      {wifiState.enabled && (
        <View style={styles.content}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={[styles.button, isScanning && styles.buttonDisabled]} 
              onPress={handleStartScan}
              disabled={isScanning}
            >
              <Feather name="search" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>
                {isScanning ? 'Scanning...' : 'Scan for Networks'}
              </Text>
            </TouchableOpacity>

            {wifiState.connectedNetwork && (
              <TouchableOpacity 
                style={[styles.button, styles.disconnectButton]} 
                onPress={handleDisconnectNetwork}
              >
                <Feather name="x-circle" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            )}
          </View>

          {isScanning && (
            <LoadingIndicator message="Scanning for WiFi networks..." />
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Available Networks</Text>
            <NetworkList
              networks={wifiState.networks}
              connectedNetwork={wifiState.connectedNetwork}
              onSelectNetwork={handleSelectNetwork}
              emptyMessage="No WiFi networks found. Try scanning again."
            />
          </View>

          {wifiState.connectedNetwork && (
            <View style={styles.connectedNetworkContainer}>
              <Text style={styles.sectionTitle}>Connected Network</Text>
              <View style={styles.connectedNetworkCard}>
                <Feather name="wifi" size={24} color="#4285F4" />
                <View style={styles.networkInfo}>
                  <Text style={styles.networkName}>
                    {wifiState.connectedNetwork.SSID || 'Unknown Network'}
                  </Text>
                  <Text style={styles.networkDetails}>
                    Signal Strength: {wifiState.connectedNetwork.level} dBm
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {!wifiState.enabled && (
        <View style={styles.enablePrompt}>
          <Feather name="wifi" size={64} color="#757575" />
          <Text style={styles.enableText}>
            Please enable WiFi to scan and connect to networks
          </Text>
        </View>
      )}

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter WiFi Password</Text>
            {selectedNetwork && (
              <Text style={styles.networkNameLabel}>
                Network: {selectedNetwork.SSID}
              </Text>
            )}
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.connectButton]} 
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  connectedNetworkContainer: {
    marginTop: 20,
  },
  connectedNetworkCard: {
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
  networkInfo: {
    marginLeft: 16,
  },
  networkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  networkDetails: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  networkNameLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#212121',
    fontWeight: 'bold',
  },
  connectButton: {
    backgroundColor: '#4285F4',
  },
  connectButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default WiFiScreen;
