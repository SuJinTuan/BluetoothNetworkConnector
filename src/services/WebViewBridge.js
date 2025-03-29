/**
 * WebViewBridge
 * 
 * This service manages bidirectional communication between the React Native app
 * and H5 pages loaded in WebViews.
 */
class WebViewBridge {
  constructor() {
    this._webViewRef = null;
    this._messageHandlers = {};
    this._isConnected = false;
    this._extractedContentPath = null;
    this._currentH5Path = null;
  }

  /**
   * Set the WebView reference
   * @param {Object} webViewRef - Reference to the WebView component
   */
  setWebViewRef(webViewRef) {
    this._webViewRef = webViewRef;
    this._isConnected = !!webViewRef;
    return this;
  }

  /**
   * Check if the bridge is connected to a WebView
   * @returns {boolean} True if connected to a WebView
   */
  isConnected() {
    return this._isConnected && !!this._webViewRef;
  }

  /**
   * Register a message handler
   * @param {string} type - Message type to handle
   * @param {Function} handler - Function to handle the message
   */
  registerMessageHandler(type, handler) {
    if (typeof handler === 'function') {
      this._messageHandlers[type] = handler;
    }
    return this;
  }

  /**
   * Unregister a message handler
   * @param {string} type - Message type to unregister
   */
  unregisterMessageHandler(type) {
    if (this._messageHandlers[type]) {
      delete this._messageHandlers[type];
    }
    return this;
  }

  /**
   * Handle a message received from the WebView
   * @param {Object} event - Event object from WebView's onMessage
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data && data.type && this._messageHandlers[data.type]) {
        this._messageHandlers[data.type](data);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }

  /**
   * Send a message to the WebView
   * @param {string} message - Message to send
   * @returns {boolean} True if message was sent successfully
   */
  sendMessage(message) {
    if (!this.isConnected()) return false;
    
    const script = `
      if (window.connectivityBridge && typeof window.connectivityBridge.receiveMessage === 'function') {
        window.connectivityBridge.receiveMessage(${JSON.stringify(message)});
      }
      true;
    `;
    
    try {
      this._webViewRef.injectJavaScript(script);
      return true;
    } catch (error) {
      console.error('Error sending message to WebView:', error);
      return false;
    }
  }

  /**
   * Update connection status in the WebView
   * @param {boolean} bluetoothStatus - Bluetooth connection status
   * @param {boolean} wifiStatus - WiFi connection status
   * @param {string|null} bluetoothDevice - Connected Bluetooth device name
   * @param {string|null} wifiNetwork - Connected WiFi network SSID
   * @returns {boolean} True if status was updated successfully
   */
  updateConnectionStatus(bluetoothStatus, wifiStatus, bluetoothDevice, wifiNetwork) {
    if (!this.isConnected()) return false;
    
    const script = `
      if (window.connectivityBridge && typeof window.connectivityBridge.updateConnectionStatus === 'function') {
        window.connectivityBridge.updateConnectionStatus(
          ${bluetoothStatus},
          ${wifiStatus},
          ${bluetoothDevice ? `"${bluetoothDevice}"` : null},
          ${wifiNetwork ? `"${wifiNetwork}"` : null}
        );
      }
      true;
    `;
    
    try {
      this._webViewRef.injectJavaScript(script);
      return true;
    } catch (error) {
      console.error('Error updating connection status in WebView:', error);
      return false;
    }
  }

  /**
   * Call a JavaScript function in the WebView
   * @param {string} functionName - Name of the function to call
   * @param {Array} args - Arguments to pass to the function
   * @returns {boolean} True if function was called successfully
   */
  callJavaScriptFunction(functionName, args = []) {
    if (!this.isConnected()) return false;
    
    const argsString = args.map(arg => {
      if (typeof arg === 'string') {
        return `"${arg}"`;
      } else if (typeof arg === 'object') {
        return JSON.stringify(arg);
      } else {
        return arg;
      }
    }).join(',');
    
    const script = `
      if (typeof ${functionName} === 'function') {
        ${functionName}(${argsString});
      }
      true;
    `;
    
    try {
      this._webViewRef.injectJavaScript(script);
      return true;
    } catch (error) {
      console.error(`Error calling JavaScript function ${functionName}:`, error);
      return false;
    }
  }

  /**
   * Inject JavaScript code into the WebView
   * @param {string} code - JavaScript code to inject
   * @returns {boolean} True if code was injected successfully
   */
  injectJavaScript(code) {
    if (!this.isConnected()) return false;
    
    try {
      this._webViewRef.injectJavaScript(`${code}\ntrue;`);
      return true;
    } catch (error) {
      console.error('Error injecting JavaScript into WebView:', error);
      return false;
    }
  }

  /**
   * Set the current H5 content path from extracted ZIP
   * @param {string} path - Path to the extracted content
   * @param {string} mainHtmlFile - Main HTML file to load
   * @returns {string} - Full path to the HTML file
   */
  setExtractedContentPath(path, mainHtmlFile = 'index.html') {
    this._extractedContentPath = path;
    
    // Check if the main HTML file already includes the path
    if (mainHtmlFile.includes('/')) {
      this._currentH5Path = mainHtmlFile;
    } else {
      this._currentH5Path = `${path}/${mainHtmlFile}`;
    }
    
    return this._currentH5Path;
  }
  
  /**
   * Get a properly formatted file URL for WebView
   * @param {string} filePath - Path to the file
   * @returns {string} - URL that can be used in WebView
   */
  getFileUrl(filePath) {
    if (!filePath) return null;
    
    // Handle file:// protocol
    if (filePath.startsWith('file://')) {
      return filePath;
    }
    
    return `file://${filePath}`;
  }

  /**
   * Get the current H5 path
   * @returns {string|null} - Current H5 path or null if not set
   */
  getCurrentH5Path() {
    return this._currentH5Path;
  }

  /**
   * Get the extracted content path
   * @returns {string|null} - Extracted content path or null if not set
   */
  getExtractedContentPath() {
    return this._extractedContentPath;
  }

  /**
   * Update device list in the WebView
   * @param {Array} devices - List of Bluetooth devices
   * @returns {boolean} - True if update was successful
   */
  updateDeviceList(devices) {
    if (!this.isConnected()) return false;
    
    const script = `
      if (window.connectivityBridge && typeof window.connectivityBridge.updateDeviceList === 'function') {
        window.connectivityBridge.updateDeviceList(${JSON.stringify(devices)});
      }
      true;
    `;
    
    try {
      this._webViewRef.injectJavaScript(script);
      return true;
    } catch (error) {
      console.error('Error updating device list in WebView:', error);
      return false;
    }
  }

  /**
   * Update network list in the WebView
   * @param {Array} networks - List of WiFi networks
   * @returns {boolean} - True if update was successful
   */
  updateNetworkList(networks) {
    if (!this.isConnected()) return false;
    
    const script = `
      if (window.connectivityBridge && typeof window.connectivityBridge.updateNetworkList === 'function') {
        window.connectivityBridge.updateNetworkList(${JSON.stringify(networks)});
      }
      true;
    `;
    
    try {
      this._webViewRef.injectJavaScript(script);
      return true;
    } catch (error) {
      console.error('Error updating network list in WebView:', error);
      return false;
    }
  }

  /**
   * Reset the bridge
   */
  reset() {
    this._webViewRef = null;
    this._isConnected = false;
    this._messageHandlers = {};
    this._extractedContentPath = null;
    this._currentH5Path = null;
  }
}

export default new WebViewBridge();
