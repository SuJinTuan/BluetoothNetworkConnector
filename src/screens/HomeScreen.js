import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useConnection } from '../contexts/ConnectionContext';
import { Feather } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { bluetoothState, wifiState } = useConnection();

  const navigateToScreen = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Connectivity App</Text>
        <Text style={styles.subtitle}>Connect, Embed, and Communicate</Text>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Feather 
              name="bluetooth" 
              size={24} 
              color={bluetoothState.enabled ? '#4285F4' : '#757575'} 
            />
            <Text style={styles.statusText}>
              Bluetooth: {bluetoothState.enabled ? 'Enabled' : 'Disabled'}
            </Text>
            {bluetoothState.connectedDevice && (
              <Text style={styles.connectedText}>
                Connected to: {bluetoothState.connectedDevice.name || 'Unknown Device'}
              </Text>
            )}
          </View>

          <View style={styles.statusItem}>
            <Feather 
              name="wifi" 
              size={24} 
              color={wifiState.enabled ? '#4285F4' : '#757575'} 
            />
            <Text style={styles.statusText}>
              WiFi: {wifiState.enabled ? 'Enabled' : 'Disabled'}
            </Text>
            {wifiState.connectedNetwork && (
              <Text style={styles.connectedText}>
                Connected to: {wifiState.connectedNetwork.SSID || 'Unknown Network'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigateToScreen('Bluetooth')}
          >
            <Feather name="bluetooth" size={48} color="#4285F4" />
            <Text style={styles.cardTitle}>Bluetooth</Text>
            <Text style={styles.cardDescription}>
              Scan and connect to Bluetooth devices
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigateToScreen('WiFi')}
          >
            <Feather name="wifi" size={48} color="#4285F4" />
            <Text style={styles.cardTitle}>WiFi</Text>
            <Text style={styles.cardDescription}>
              Scan and connect to WiFi networks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigateToScreen('WebView')}
          >
            <Feather name="globe" size={48} color="#4285F4" />
            <Text style={styles.cardTitle}>H5 WebView</Text>
            <Text style={styles.cardDescription}>
              Load H5 pages with two-way communication
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigateToScreen('Export')}
          >
            <Feather name="code" size={48} color="#4285F4" />
            <Text style={styles.cardTitle}>Export Code</Text>
            <Text style={styles.cardDescription}>
              Export the app code for customization
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#212121',
  },
  connectedText: {
    fontSize: 14,
    color: '#4285F4',
    marginLeft: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default HomeScreen;
