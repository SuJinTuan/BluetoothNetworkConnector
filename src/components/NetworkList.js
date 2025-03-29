import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const NetworkList = ({ networks, connectedNetwork, onSelectNetwork, emptyMessage }) => {
  // Helper function to get signal strength icon based on level
  const getSignalIcon = (level) => {
    // WiFi level is usually between -30 (excellent) and -90 (poor)
    if (!level) return 'wifi-off';
    
    if (level >= -50) return 'wifi';
    if (level >= -65) return 'wifi';
    if (level >= -80) return 'wifi';
    return 'wifi-off';
  };
  
  // Helper function to get signal strength text
  const getSignalStrength = (level) => {
    if (!level) return 'Unknown';
    
    if (level >= -50) return 'Excellent';
    if (level >= -65) return 'Good';
    if (level >= -80) return 'Fair';
    return 'Poor';
  };
  
  // Helper function to check if network is secured
  const isSecured = (capabilities) => {
    if (!capabilities) return false;
    
    return capabilities.includes('WPA') || 
           capabilities.includes('WEP') || 
           capabilities.includes('PSK');
  };
  
  // Helper function to check if network is connected
  const isConnected = (network) => {
    return connectedNetwork && connectedNetwork.SSID === network.SSID;
  };

  // Render a network item
  const renderNetworkItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.networkItem, isConnected(item) && styles.connectedItem]}
      onPress={() => onSelectNetwork(item)}
      disabled={isConnected(item)}
    >
      <View style={styles.networkIcon}>
        <Feather 
          name={getSignalIcon(item.level)} 
          size={24} 
          color={isConnected(item) ? "#4285F4" : "#757575"} 
        />
      </View>
      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>{item.SSID || 'Unknown Network'}</Text>
        <View style={styles.networkDetails}>
          {isSecured(item.capabilities) && (
            <Feather name="lock" size={14} color="#757575" style={styles.secureIcon} />
          )}
          <Text style={styles.networkCapabilities}>
            {isSecured(item.capabilities) ? 'Secured' : 'Open'}
          </Text>
        </View>
      </View>
      <View style={styles.signalContainer}>
        <Text style={styles.signalText}>{getSignalStrength(item.level)}</Text>
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
      <Feather name="wifi" size={64} color="#e0e0e0" />
      <Text style={styles.emptyText}>{emptyMessage || 'No networks found'}</Text>
    </View>
  );

  return (
    <FlatList
      data={networks}
      renderItem={renderNetworkItem}
      keyExtractor={(item, index) => item.BSSID || `network-${index}`}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={networks.length === 0 ? styles.listEmptyContent : styles.listContent}
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
  networkItem: {
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
  networkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  networkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  networkDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureIcon: {
    marginRight: 4,
  },
  networkCapabilities: {
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

export default NetworkList;
