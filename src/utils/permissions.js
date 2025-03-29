import { Platform } from 'react-native';
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
};
