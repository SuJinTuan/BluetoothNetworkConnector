import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DeviceList = ({ devices, connectedDevice, onSelectDevice, emptyMessage }) => {
  // Helper function to get signal strength icon
  const getSignalIcon = (rssi) => {
    if (!rssi) return 'wifi-off';
    
    // RSSI values typically range from -30 (very strong) to -100 (very weak)
    if (rssi >= -50) return 'wifi';
    if (rssi >= -65) return 'wifi';
    if (rssi >= -80) return 'wifi'; 
    return 'wifi-off';
  };
  
  // Helper function to get signal strength text
  const getSignalText = (rssi) => {
    if (!rssi) return 'Unknown';
    
    if (rssi >= -50) return 'Excellent';
    if (rssi >= -65) return 'Good';
    if (rssi >= -80) return 'Fair';
    return 'Poor';
  };
  
  // Helper function to check if device is connected
  const isConnected = (device) => {
    return connectedDevice && connectedDevice.id === device.id;
  };

  // Render a device item
  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.deviceItem, isConnected(item) && styles.connectedItem]}
      onPress={() => onSelectDevice(item)}
      disabled={isConnected(item)}
    >
      <View style={styles.deviceIcon}>
        <Feather name="bluetooth" size={24} color={isConnected(item) ? "#4285F4" : "#757575"} />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
      </View>
      <View style={styles.signalContainer}>
        <Feather name={getSignalIcon(item.rssi)} size={16} color="#757575" />
        <Text style={styles.signalText}>{getSignalText(item.rssi)}</Text>
        {isConnected(item) && (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bluetooth" size={64} color="#e0e0e0" />
      <Text style={styles.emptyText}>{emptyMessage || 'No devices found'}</Text>
    </View>
  );

  return (
    <FlatList
      data={devices}
      renderItem={renderDeviceItem}
      keyExtractor={item => item.id}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={devices.length === 0 ? styles.listEmptyContent : styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectedItem: {
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    color: '#757575',
  },
  signalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 8,
  },
  signalText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  connectedBadge: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  connectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default DeviceList;
