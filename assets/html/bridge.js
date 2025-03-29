// Create a bridge object to communicate with the native app
window.connectivityBridge = {
  receiveMessage: function(message) {
    const messagesLog = document.getElementById('messagesLog');
    messagesLog.textContent += '→ ' + message + '\n';
  },
  
  updateConnectionStatus: function(bluetoothStatus, wifiStatus, bluetoothDevice, wifiNetwork) {
    const bluetoothStatusEl = document.getElementById('bluetoothStatus');
    const wifiStatusEl = document.getElementById('wifiStatus');
    
    bluetoothStatusEl.textContent = bluetoothStatus ? 'Connected' : 'Disconnected';
    bluetoothStatusEl.className = 'status ' + (bluetoothStatus ? 'connected' : 'disconnected');
    
    if (bluetoothDevice) {
      bluetoothStatusEl.textContent += ' (' + bluetoothDevice + ')';
    }
    
    wifiStatusEl.textContent = wifiStatus ? 'Connected' : 'Disconnected';
    wifiStatusEl.className = 'status ' + (wifiStatus ? 'connected' : 'disconnected');
    
    if (wifiNetwork) {
      wifiStatusEl.textContent += ' (' + wifiNetwork + ')';
    }
  },

  updateDeviceList: function(devices) {
    // This function could be implemented if we want to show the device list in the H5 page
    console.log('Bluetooth devices updated:', devices);
  },

  updateNetworkList: function(networks) {
    // This function could be implemented if we want to show the network list in the H5 page
    console.log('WiFi networks updated:', networks);
  }
};

// Function to get connection status from the app
function getConnectionStatus() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'getConnectionStatus'
  }));
}

// Function to send a message to the app
function sendMessageToApp() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (message) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'message',
      content: message
    }));
    messageInput.value = '';
  }
}

// Function to request Bluetooth scan
function requestBluetoothScan() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'requestBluetoothScan'
  }));
  const messagesLog = document.getElementById('messagesLog');
  messagesLog.textContent += '← Requested Bluetooth scan\n';
}

// Function to request WiFi scan
function requestWifiScan() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'requestWifiScan'
  }));
  const messagesLog = document.getElementById('messagesLog');
  messagesLog.textContent += '← Requested WiFi scan\n';
}

// Function to connect to a Bluetooth device (could be used in future implementation)
function connectToBluetoothDevice(deviceId) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'connectToBluetoothDevice',
    deviceId: deviceId
  }));
}

// Function to connect to a WiFi network (could be used in future implementation)
function connectToWifiNetwork(ssid, password) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'connectToWifiNetwork',
    ssid: ssid,
    password: password
  }));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  getConnectionStatus();
});
