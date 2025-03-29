import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { unzip } from 'react-native-zip-archive';
import { Platform } from 'react-native';

class ZipService {
  constructor() {
    this._cacheDirectory = FileSystem.cacheDirectory;
    this._documentDirectory = FileSystem.documentDirectory;
    this._extractedFolders = [];
    this._currentExtractedFolder = null;
    this._lastProcessedZip = null;
  }

  /**
   * Unzip a file from a URI to the specified destination
   * @param {string} zipUri - URI of the zip file (could be a remote URL or local file URI)
   * @param {string} destDirectory - Optional destination directory (defaults to a new folder in the cache directory)
   * @returns {Promise<string>} - Path to the extracted contents
   */
  async unzipFromUri(zipUri, destDirectory = null) {
    try {
      // Create a unique temporary directory name if none provided
      const targetDir = destDirectory || `${this._cacheDirectory}extracted_${Date.now()}/`;
      
      // If it's a remote URI, download the file first
      let localZipPath = zipUri;
      if (zipUri.startsWith('http')) {
        const filename = zipUri.split('/').pop();
        localZipPath = `${this._cacheDirectory}${filename}`;
        
        console.log('Downloading zip file from', zipUri);
        const { uri } = await FileSystem.downloadAsync(zipUri, localZipPath);
        localZipPath = uri;
      }

      // Store the last processed zip
      this._lastProcessedZip = localZipPath;

      // Ensure the target directory exists
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });

      // Unzip the file
      console.log('Unzipping file from', localZipPath, 'to', targetDir);
      const extractedPath = await unzip(localZipPath, targetDir);
      
      // Keep track of extracted folders
      this._extractedFolders.push(extractedPath);
      this._currentExtractedFolder = extractedPath;
      
      return extractedPath;
    } catch (error) {
      console.error('Error unzipping file:', error);
      throw new Error('Failed to unzip file: ' + error.message);
    }
  }

  /**
   * Get a list of files in an extracted directory
   * @param {string} directory - Path to the directory
   * @param {boolean} recursive - Whether to include files in subdirectories
   * @returns {Promise<Array>} - List of files and directories
   */
  async getExtractedFiles(directory, recursive = false) {
    try {
      if (!recursive) {
        const fileInfo = await FileSystem.readDirectoryAsync(directory);
        return fileInfo;
      }
      
      // Recursive file listing
      return await this._listFilesRecursively(directory);
    } catch (error) {
      console.error('Error getting extracted files:', error);
      throw new Error('Failed to read extracted files: ' + error.message);
    }
  }

  /**
   * List files recursively in a directory
   * @param {string} directory - Path to directory
   * @param {string} basePath - Base path for relative paths
   * @returns {Promise<Array>} - List of file objects with path and isDirectory properties
   * @private
   */
  async _listFilesRecursively(directory, basePath = '') {
    const results = [];
    const items = await FileSystem.readDirectoryAsync(directory);
    
    for (const item of items) {
      const itemPath = `${directory}${item}`;
      const info = await FileSystem.getInfoAsync(itemPath);
      
      const relativePath = basePath ? `${basePath}/${item}` : item;
      
      results.push({
        name: item,
        path: itemPath,
        relativePath,
        isDirectory: info.isDirectory,
        size: info.size,
        modificationTime: info.modificationTime
      });
      
      if (info.isDirectory) {
        const subResults = await this._listFilesRecursively(`${itemPath}/`, relativePath);
        results.push(...subResults);
      }
    }
    
    return results;
  }

  /**
   * Find all HTML files in an extracted directory
   * @param {string} directory - Path to the directory
   * @returns {Promise<Array>} - List of HTML files with full paths
   */
  async findHtmlFiles(directory) {
    try {
      const allFiles = await this._listFilesRecursively(directory);
      return allFiles.filter(file => 
        !file.isDirectory && file.name.toLowerCase().endsWith('.html')
      );
    } catch (error) {
      console.error('Error finding HTML files:', error);
      throw new Error('Failed to find HTML files: ' + error.message);
    }
  }

  /**
   * Find the main HTML file in an extracted directory
   * @param {string} directory - Path to the directory
   * @returns {Promise<string|null>} - Path to the main HTML file or null if not found
   */
  async findMainHtmlFile(directory) {
    try {
      const htmlFiles = await this.findHtmlFiles(directory);
      
      if (htmlFiles.length === 0) {
        return null;
      }
      
      // Try to find index.html first
      const indexHtml = htmlFiles.find(file => 
        file.name.toLowerCase() === 'index.html'
      );
      
      if (indexHtml) {
        return indexHtml.path;
      }
      
      // If no index.html, return the first HTML file
      return htmlFiles[0].path;
    } catch (error) {
      console.error('Error finding main HTML file:', error);
      throw new Error('Failed to find main HTML file: ' + error.message);
    }
  }

  /**
   * Read an HTML file from the extracted content
   * @param {string} filePath - Path to the HTML file
   * @returns {Promise<string>} - Content of the HTML file
   */
  async readHtmlFile(filePath) {
    try {
      const content = await FileSystem.readAsStringAsync(filePath);
      return content;
    } catch (error) {
      console.error('Error reading HTML file:', error);
      throw new Error('Failed to read HTML file: ' + error.message);
    }
  }

  /**
   * Fix relative paths in HTML content for WebView
   * @param {string} htmlContent - Original HTML content
   * @param {string} basePath - Base path for resolving relative URLs
   * @returns {string} - HTML content with fixed paths
   */
  fixHtmlPaths(htmlContent, basePath) {
    // Convert the basePath to a file:// URL if needed
    const baseUrl = this.getFileUrl(basePath);
    
    // Add a base tag to the HTML to resolve relative URLs
    if (!htmlContent.includes('<base')) {
      return htmlContent.replace(
        '<head>',
        `<head>\n  <base href="${baseUrl}">`
      );
    }
    
    return htmlContent;
  }

  /**
   * Get the current extracted folder
   * @returns {string|null} - Path to the current extracted folder
   */
  getCurrentExtractedFolder() {
    return this._currentExtractedFolder;
  }

  /**
   * Get the last processed ZIP file
   * @returns {string|null} - Path to the last processed ZIP file
   */
  getLastProcessedZip() {
    return this._lastProcessedZip;
  }

  /**
   * Clean up extracted folders to free up space
   * @param {string} directory - Optional specific directory to clean
   * @returns {Promise<void>}
   */
  async cleanUp(directory = null) {
    try {
      if (directory) {
        await FileSystem.deleteAsync(directory, { idempotent: true });
        this._extractedFolders = this._extractedFolders.filter(dir => dir !== directory);
        
        // Reset current folder if it's the one being deleted
        if (this._currentExtractedFolder === directory) {
          this._currentExtractedFolder = null;
        }
      } else {
        // Clean up all extracted folders
        for (const dir of this._extractedFolders) {
          await FileSystem.deleteAsync(dir, { idempotent: true });
        }
        this._extractedFolders = [];
        this._currentExtractedFolder = null;
      }
    } catch (error) {
      console.error('Error cleaning up extracted folders:', error);
    }
  }

  /**
   * Share an extracted file with other apps
   * @param {string} filePath - Path to the file to share
   * @returns {Promise<void>}
   */
  async shareFile(filePath) {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(filePath);
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error('Failed to share file: ' + error.message);
    }
  }

  /**
   * Create a ZIP archive from a directory
   * @param {string} sourceDir - Directory to zip
   * @param {string} outputPath - Path for the output ZIP file
   * @returns {Promise<string>} - Path to the created ZIP file
   */
  async createZip(sourceDir, outputPath = null) {
    try {
      const targetPath = outputPath || `${this._cacheDirectory}archive_${Date.now()}.zip`;
      
      // Use the zip function from react-native-zip-archive
      const zipPath = await zip(sourceDir, targetPath);
      
      return zipPath;
    } catch (error) {
      console.error('Error creating ZIP archive:', error);
      throw new Error('Failed to create ZIP archive: ' + error.message);
    }
  }

  /**
   * Get a file URL that can be used in a WebView
   * @param {string} filePath - Path to the file
   * @returns {string} - URL that can be used in a WebView
   */
  getFileUrl(filePath) {
    if (Platform.OS === 'android' && !filePath.startsWith('file://')) {
      return `file://${filePath}`;
    }
    // On iOS, the file:// protocol is already included
    return filePath;
  }
}

// Create a singleton instance
const zipService = new ZipService();

export default zipService;