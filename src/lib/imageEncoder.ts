/**
 * Image Encoding/Decoding Utility
 * Converts images to base64 for storage in GitHub JSON files
 * and decodes them back for display.
 */

/**
 * Maximum image size in bytes (2MB) to prevent oversized GitHub files
 */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Supported image MIME types
 */
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/**
 * Compress and convert an image file to a base64 data URI
 * Returns null if the image is too large or unsupported
 */
export async function encodeImage(file: File): Promise<{ dataUri: string; mimeType: string; size: number } | null> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    console.warn(`Unsupported image type: ${file.type}`);
    return null;
  }

  if (file.size > MAX_IMAGE_SIZE * 3) {
    // Even after compression it might be too large
    console.warn(`Image too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    return null;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Compress if necessary
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        // Scale down if image is very large
        let { width, height } = img;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Try to compress with quality 0.8 for JPEG
        let quality = 0.8;
        let dataUri = canvas.toDataURL('image/jpeg', quality);
        let size = getBase64Size(dataUri);

        // Reduce quality further if still too large
        while (size > MAX_IMAGE_SIZE && quality > 0.3) {
          quality -= 0.1;
          dataUri = canvas.toDataURL('image/jpeg', quality);
          size = getBase64Size(dataUri);
        }

        if (size > MAX_IMAGE_SIZE) {
          console.warn(`Image still too large after compression: ${(size / 1024 / 1024).toFixed(2)}MB`);
          resolve(null);
          return;
        }

        resolve({
          dataUri,
          mimeType: 'image/jpeg',
          size,
        });
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a File object to base64 without compression
 * Use for small images like avatars
 */
export function fileToBase64(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Decode a base64 data URI back to a Blob
 */
export function decodeImage(dataUri: string): Blob | null {
  try {
    const parts = dataUri.split(',');
    if (parts.length !== 2) return null;

    const mimeMatch = parts[0].match(/:(.*?);/);
    if (!mimeMatch) return null;

    const mimeType = mimeMatch[1];
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeType });
  } catch {
    return null;
  }
}

/**
 * Create an object URL from a base64 data URI
 */
export function dataUriToObjectUrl(dataUri: string): string | null {
  const blob = decodeImage(dataUri);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Check if a string is a base64 encoded image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/');
}

/**
 * Get the approximate size in bytes of a base64 string
 */
export function getBase64Size(base64Str: string): number {
  // Remove the data URI prefix
  const base64 = base64Str.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Process multiple images from input files
 * Returns array of encoded images ready for storage
 */
export async function encodeMultipleImages(files: File[]): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    const encoded = await encodeImage(file);
    if (encoded) {
      results.push(encoded.dataUri);
    }
  }
  return results;
}

/**
 * Image storage helper for GitHub JSON files
 * Stores images as base64 data URIs within the JSON structure
 */
export interface StoredImage {
  id: string;
  dataUri: string;
  alt: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

/**
 * Create a stored image object from a file
 */
export async function createStoredImage(file: File, alt: string = ''): Promise<StoredImage | null> {
  const encoded = await encodeImage(file);
  if (!encoded) return null;

  return {
    id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    dataUri: encoded.dataUri,
    alt: alt || file.name,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Generate a unique image ID
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
