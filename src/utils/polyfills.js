/**
 * Polyfills for Web APIs that might not be available in React Native
 * This resolves "ReferenceError: ReadableStream is not defined" and similar issues
 */

// More comprehensive ReadableStream polyfill
if (typeof global.ReadableStream === 'undefined') {
  class ReadableStreamDefaultReader {
    constructor() {
      this._closed = false;
    }
    
    get closed() {
      return Promise.resolve(this._closed);
    }
    
    cancel(reason) {
      this._closed = true;
      return Promise.resolve();
    }
    
    read() {
      return Promise.resolve({ done: true, value: undefined });
    }
    
    releaseLock() {
      this._closed = true;
    }
  }
  
  class ReadableStreamDefaultController {
    constructor() {
      this._queue = [];
    }
    
    close() {
      this._closeRequested = true;
    }
    
    enqueue(chunk) {
      if (this._closeRequested) return;
      this._queue.push(chunk);
    }
    
    error(e) {
      this._errorStored = e;
    }
  }
  
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource = {}, strategy = {}) {
      this._state = 'readable';
      this._reader = null;
      this._controller = new ReadableStreamDefaultController();
      
      if (underlyingSource.start) {
        try {
          underlyingSource.start(this._controller);
        } catch (e) {
          console.error('Error in ReadableStream start:', e);
        }
      }
    }
    
    get locked() {
      return !!this._reader;
    }
    
    cancel(reason) {
      if (this._reader) {
        return this._reader.cancel(reason);
      }
      return Promise.resolve();
    }
    
    getReader() {
      if (this._reader) {
        throw new Error('ReadableStream already has a reader');
      }
      this._reader = new ReadableStreamDefaultReader();
      return this._reader;
    }
    
    pipeThrough(transformStream, options) {
      console.warn('ReadableStream.pipeThrough polyfill called - not implemented');
      return transformStream.writable;
    }
    
    pipeTo(writableStream, options) {
      console.warn('ReadableStream.pipeTo polyfill called - not implemented');
      return Promise.resolve();
    }
    
    tee() {
      console.warn('ReadableStream.tee polyfill called - not implemented');
      return [new ReadableStream(), new ReadableStream()];
    }
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

// WritableStream polyfill
if (typeof global.WritableStream === 'undefined') {
  class WritableStreamDefaultWriter {
    constructor() {
      this._closed = false;
    }
    
    get closed() {
      return Promise.resolve(this._closed);
    }
    
    abort(reason) {
      this._closed = true;
      return Promise.resolve();
    }
    
    close() {
      this._closed = true;
      return Promise.resolve();
    }
    
    write(chunk) {
      return Promise.resolve();
    }
    
    releaseLock() {
      this._closed = true;
    }
  }
  
  global.WritableStream = class WritableStream {
    constructor(underlyingSink = {}, strategy = {}) {
      this._state = 'writable';
      this._writer = null;
      
      if (underlyingSink.start) {
        try {
          underlyingSink.start();
        } catch (e) {
          console.error('Error in WritableStream start:', e);
        }
      }
    }
    
    get locked() {
      return !!this._writer;
    }
    
    abort(reason) {
      if (this._writer) {
        return this._writer.abort(reason);
      }
      return Promise.resolve();
    }
    
    getWriter() {
      if (this._writer) {
        throw new Error('WritableStream already has a writer');
      }
      this._writer = new WritableStreamDefaultWriter();
      return this._writer;
    }
  };
}

// TransformStream polyfill
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {
    constructor(transformer = {}, writableStrategy = {}, readableStrategy = {}) {
      this.readable = new global.ReadableStream();
      this.writable = new global.WritableStream();
    }
  };
}

// Add or remove polyfills as needed