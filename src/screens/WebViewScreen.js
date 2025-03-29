import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useConnection } from '../contexts/ConnectionContext';
import { useExportService } from '../services/ExportService';
import WebViewBridge from '../services/WebViewBridge';
import ZipService from '../services/ZipService';

const WebViewScreen = () => {
  const webViewRef = useRef(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [messageToSend, setMessageToSend] = useState('');
  const { bluetoothState, wifiState } = useConnection();
  const { exportH5Content, exportState } = useExportService();

  // Default HTML content with the bridge JavaScript
  const defaultHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H5 Connectivity Demo</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        padding: 20px;
        max-width: 100%;
        margin: 0 auto;
        color: #333;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .card {
        background-color: #fff;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      h1 {
        font-size: 24px;
        margin-bottom: 10px;
      }
      h2 {
        font-size: 18px;
        margin-bottom: 8px;
      }
      button {
        background-color: #4285F4;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        margin: 5px;
      }
      input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 10px;
      }
      pre {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
      }
      .status {
        font-weight: bold;
      }
      .connected {
        color: green;
      }
      .disconnected {
        color: red;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h1>H5 Connectivity Demo</h1>
        <p>This page demonstrates bidirectional communication between an H5 page and the native app.</p>
      </div>
      
      <div class="card">
        <h2>Device Status</h2>
        <p>Bluetooth Status: <span id="bluetoothStatus" class="status disconnected">Unknown</span></p>
        <p>WiFi Status: <span id="wifiStatus" class="status disconnected">Unknown</span></p>
        <button onclick="getConnectionStatus()">Refresh Status</button>
      </div>
      
      <div class="card">
        <h2>Send Message to Native App</h2>
        <input type="text" id="messageInput" placeholder="Type a message...">
        <button onclick="sendMessageToApp()">Send</button>
      </div>
      
      <div class="card">
        <h2>Messages from App</h2>
        <pre id="messagesLog"></pre>
      </div>
    </div>

    <script>
      // Create a bridge object to communicate with the native app
      window.connectivityBridge = {
        receiveMessage: function(message) {
          const messagesLog = document.getElementById('messagesLog');
          messagesLog.textContent += '→ ' + message + '\\n';
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
        }
      };
      
      function getConnectionStatus() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'getConnectionStatus'
        }));
      }
      
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
      
      // Initialize the page
      document.addEventListener('DOMContentLoaded', function() {
        getConnectionStatus();
      });
    </script>
  </body>
  </html>
  `;

  useEffect(() => {
    // Set up the WebViewBridge when the component mounts
    if (webViewRef.current) {
      WebViewBridge.setWebViewRef(webViewRef.current);
    }
    
    // Clean up when the component unmounts
    return () => {
      WebViewBridge.reset();
    };
  }, [webViewRef.current]);

  // Function to pick and unzip a file
  const pickAndUnzipFile = async () => {
    try {
      setIsLoading(true);
      addLog('Selecting a ZIP file...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        addLog('File selection canceled');
        setIsLoading(false);
        return;
      }
      
      const fileUri = result.assets[0].uri;
      addLog(`Selected file: ${result.assets[0].name}`);
      
      // Unzip the file
      addLog('Unzipping file...');
      const extractedPath = await ZipService.unzipFromUri(fileUri);
      
      // Find all HTML files in the extracted directory (recursively)
      addLog('Searching for HTML files...');
      const htmlFiles = await ZipService.findHtmlFiles(extractedPath);
      
      if (htmlFiles.length === 0) {
        throw new Error('No HTML files found in the ZIP package');
      }
      
      // Find the main HTML file (index.html or first HTML file)
      const mainHtmlFile = await ZipService.findMainHtmlFile(extractedPath);
      
      if (!mainHtmlFile) {
        throw new Error('Failed to determine main HTML file');
      }
      
      // Read the HTML content
      const htmlContent = await ZipService.readHtmlFile(mainHtmlFile);
      
      // Get the base directory for the HTML file
      const baseDir = mainHtmlFile.substring(0, mainHtmlFile.lastIndexOf('/') + 1);
      
      // Fix relative paths in the HTML content
      const fixedHtmlContent = ZipService.fixHtmlPaths(htmlContent, baseDir);
      
      // Set the extracted content path in the WebViewBridge
      WebViewBridge.setExtractedContentPath(extractedPath, mainHtmlFile.split('/').pop());
      
      // Get file URL for WebView
      const fileUrl = ZipService.getFileUrl(mainHtmlFile);
      
      // Load the extracted HTML file
      addLog(`Loading extracted file: ${mainHtmlFile.split('/').pop()}`);
      addLog(`Found ${htmlFiles.length} HTML file(s) in the package`);
      
      // Choose between loading the URL directly or using the fixed content
      // Direct URL is simpler but fixed content handles relative path issues better
      setCurrentUrl(fileUrl);
      setIsLoading(false);
    } catch (error) {
      console.error('Error picking or unzipping file:', error);
      setIsLoading(false);
      Alert.alert('Error', `Failed to process ZIP file: ${error.message}`);
      addLog(`Error: ${error.message}`);
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'getConnectionStatus') {
        const bluetoothConnected = !!bluetoothState.connectedDevice;
        const wifiConnected = !!wifiState.connectedNetwork;
        
        const bluetoothDevice = bluetoothState.connectedDevice ? 
          bluetoothState.connectedDevice.name || bluetoothState.connectedDevice.id : null;
        
        const wifiNetwork = wifiState.connectedNetwork ? 
          wifiState.connectedNetwork.SSID : null;

        // Send status back to WebView
        WebViewBridge.updateConnectionStatus(
          bluetoothConnected,
          wifiConnected, 
          bluetoothDevice,
          wifiNetwork
        );
        
        addLog('Sent connection status to H5 page');
      } else if (data.type === 'message') {
        addLog(`Received from H5: ${data.content}`);
      } else if (data.type === 'requestBluetoothScan') {
        addLog('H5 requested Bluetooth scan');
        // You would trigger Bluetooth scan here
      } else if (data.type === 'requestWifiScan') {
        addLog('H5 requested WiFi scan');
        // You would trigger WiFi scan here
      } else if (data.type === 'connectToBluetoothDevice') {
        addLog(`H5 requested to connect to Bluetooth device: ${data.deviceId}`);
        // You would connect to the Bluetooth device here
      } else if (data.type === 'connectToWifiNetwork') {
        addLog(`H5 requested to connect to WiFi network: ${data.ssid}`);
        // You would connect to the WiFi network here
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // Add log message
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Send message to WebView
  const sendMessageToWebView = () => {
    if (!messageToSend.trim()) return;
    
    const script = `
      window.connectivityBridge.receiveMessage(${JSON.stringify(messageToSend)});
      true;
    `;
    
    webViewRef.current.injectJavaScript(script);
    addLog(`Sent to H5: ${messageToSend}`);
    setMessageToSend('');
  };

  // Load URL
  const loadUrl = () => {
    if (!url) return;
    
    // Simple URL validation
    let urlToLoad = url;
    if (!/^https?:\/\//i.test(url)) {
      urlToLoad = 'https://' + url;
    }
    
    setIsLoading(true);
    setCurrentUrl(urlToLoad);
  };

  // Load local HTML (demo page)
  const loadDemoPage = () => {
    setCurrentUrl('');
    // The empty URL will trigger the renderLoading which will show our default HTML
  };
  
  // Export the current H5 content
  const handleExportH5 = async () => {
    try {
      const extractedPath = ZipService.getCurrentExtractedFolder();
      
      if (!extractedPath) {
        Alert.alert(
          'No H5 Content', 
          'Please load an H5 package first before exporting.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      addLog('Exporting current H5 content...');
      setIsLoading(true);
      
      const zipPath = await exportH5Content(extractedPath);
      
      setIsLoading(false);
      addLog(`H5 content exported to: ${zipPath}`);
      
      Alert.alert(
        'Export Successful', 
        'The H5 content has been exported and is ready to share.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting H5 content:', error);
      setIsLoading(false);
      Alert.alert(
        'Export Failed', 
        error.message || 'There was a problem exporting the H5 content.',
        [{ text: 'OK' }]
      );
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>H5 WebView</Text>
        <Text style={styles.subtitle}>
          Embed H5 pages with bidirectional communication
        </Text>
      </View>

      <View style={styles.urlContainer}>
        <TextInput
          style={styles.urlInput}
          placeholder="Enter URL (e.g., example.com)"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity 
          style={styles.loadButton} 
          onPress={loadUrl}
        >
          <Feather name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={loadDemoPage}
          >
            <Feather name="code" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Load Demo Page</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.zipButton} 
            onPress={pickAndUnzipFile}
          >
            <Feather name="file-plus" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Unzip H5 Package</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.buttonRow, {marginTop: 8}]}>
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExportH5}
            disabled={exportState.isExporting || !ZipService.getCurrentExtractedFolder()}
          >
            {exportState.isExporting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Feather name="download" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Export H5 Content</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={currentUrl ? { uri: currentUrl } : { html: defaultHTML }}
          onLoad={() => setIsLoading(false)}
          onError={(error) => {
            setIsLoading(false);
            Alert.alert('Error', 'Failed to load the page: ' + error);
          }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webView}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.communicationContainer}
      >
        <Text style={styles.sectionTitle}>Communication Log</Text>
        <ScrollView 
          style={styles.logsContainer}
          contentContainerStyle={styles.logsContent}
        >
          {logs.length === 0 ? (
            <Text style={styles.noLogsText}>No communication logs yet</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))
          )}
        </ScrollView>

        <View style={styles.sendMessageContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type message to send to H5..."
            value={messageToSend}
            onChangeText={setMessageToSend}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessageToWebView}
            disabled={!messageToSend.trim()}
          >
            <Feather name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  urlContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  },
  loadButton: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    borderRadius: 8,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoButton: {
    backgroundColor: '#34a853',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  zipButton: {
    backgroundColor: '#db4437',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  exportButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  webViewContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: '#ffffff',
  },
  communicationContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  logsContent: {
    padding: 12,
  },
  noLogsText: {
    color: '#9e9e9e',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  logText: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default WebViewScreen;
