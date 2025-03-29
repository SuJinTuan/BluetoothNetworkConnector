/**
 * Polyfills for Web APIs that might not be available in React Native
 * This resolves "ReferenceError: ReadableStream is not defined" and similar issues
 */

// Polyfill for ReadableStream
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = function() {
    console.warn('ReadableStream polyfill called - this is a minimal implementation');
    return {};
  };
}

// Polyfill for other potential missing APIs if needed
// For example, if TextEncoder/TextDecoder is used:
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = function() {
    return {
      encode: function(str) {
        console.warn('TextEncoder polyfill called - this is a minimal implementation');
        return { buffer: new ArrayBuffer(str.length) };
      }
    };
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = function() {
    return {
      decode: function(buffer) {
        console.warn('TextDecoder polyfill called - this is a minimal implementation');
        return '';
      }
    };
  };
}

// Add or remove polyfills as needed