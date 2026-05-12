/**
 * Certificate Generator Utility
 * Generates a certificate image by overlaying the user's name on the template.
 */

const GITHUB_RAW_TEMPLATE_URL = 'https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Certificate/certificate-template.png';
const FALLBACK_TEMPLATE_URL = '/certificate-template.png';

export interface CertificateConfig {
  namePosition: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  textAlign: 'center' | 'left' | 'right';
}

// Match the actual GitHub config to avoid wrong positioning on fallback
const DEFAULT_CONFIG: CertificateConfig = {
  namePosition: { x: 50.5, y: 39.5 },
  fontSize: 25,
  fontFamily: 'Georgia, serif',
  fontColor: '#1e293b',
  textAlign: 'center',
};

// In-memory cache for config to avoid refetching on every generation
let cachedConfig: CertificateConfig | null = null;

/**
 * Fetches the certificate config from the server API.
 * Caches the result in memory for subsequent calls.
 */
async function fetchCertificateConfig(): Promise<CertificateConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const res = await fetch('/api/certificate-config');
    if (!res.ok) throw new Error(`Config API returned ${res.status}`);
    const data = await res.json();
    if (data.success && data.config) {
      cachedConfig = {
        namePosition: data.config.namePosition || DEFAULT_CONFIG.namePosition,
        fontSize: data.config.fontSize || DEFAULT_CONFIG.fontSize,
        fontFamily: data.config.fontFamily || DEFAULT_CONFIG.fontFamily,
        fontColor: data.config.fontColor || DEFAULT_CONFIG.fontColor,
        textAlign: data.config.textAlign || DEFAULT_CONFIG.textAlign,
      };
      return cachedConfig;
    }
  } catch (err) {
    console.error('[certificateGenerator] Failed to fetch config, using defaults:', err);
  }
  return DEFAULT_CONFIG;
}

/**
 * Loads an image from a URL.
 * @param src - Image URL
 * @param crossOrigin - Whether to set crossOrigin='anonymous' (only for cross-origin URLs)
 * @param timeoutMs - Timeout in milliseconds (default 15s)
 */
function loadImage(src: string, crossOrigin: boolean = true, timeoutMs: number = 15000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      img.src = ''; // Cancel the load
      reject(new Error(`Image load timeout: ${src}`));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

/**
 * Loads the template image, trying GitHub first then local fallback.
 * Key fix: Only set crossOrigin='anonymous' for cross-origin URLs (GitHub),
 * NOT for same-origin fallback (which would taint the canvas).
 * Also adds cache-busting to the GitHub URL to avoid stale CORS responses.
 */
async function loadTemplateImage(): Promise<HTMLImageElement> {
  // Try GitHub raw URL first with cache-busting and CORS
  try {
    const cacheBustedUrl = `${GITHUB_RAW_TEMPLATE_URL}?t=${Date.now()}`;
    return await loadImage(cacheBustedUrl, true, 15000);
  } catch (githubErr) {
    console.warn('[certificateGenerator] GitHub template failed, trying local fallback:', githubErr);
  }

  // Fallback: load from local public directory — NO crossOrigin needed (same origin)
  // This is the critical fix: crossOrigin='anonymous' on same-origin images
  // causes canvas taint because Next.js dev server doesn't send CORS headers for static files
  try {
    return await loadImage(FALLBACK_TEMPLATE_URL, false, 10000);
  } catch (fallbackErr) {
    console.error('[certificateGenerator] Local fallback also failed:', fallbackErr);
    throw new Error('Could not load certificate template image from any source.');
  }
}

/**
 * Generates a certificate image as a data URL (PNG).
 * @param name - The name to overlay on the certificate
 * @returns data URL of the generated certificate PNG
 */
export async function generateCertificate(name: string): Promise<string> {
  // Fetch config and template image in parallel
  const [config, templateImg] = await Promise.all([
    fetchCertificateConfig(),
    loadTemplateImage(),
  ]);

  const width = templateImg.naturalWidth;
  const height = templateImg.naturalHeight;

  if (!width || !height) {
    throw new Error('Template image has invalid dimensions');
  }

  // Create canvas at full resolution
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  // Draw the template image as background
  ctx.drawImage(templateImg, 0, 0, width, height);

  // Calculate pixel position from percentage
  const x = (config.namePosition.x / 100) * width;
  const y = (config.namePosition.y / 100) * height;

  // Scale font size proportionally based on template width vs assumed design width (1536)
  const scaleFactor = width / 1536;
  const scaledFontSize = config.fontSize * scaleFactor;

  // Set up text rendering
  ctx.font = `bold ${scaledFontSize}px ${config.fontFamily}`;
  ctx.fillStyle = config.fontColor;
  ctx.textAlign = config.textAlign;
  ctx.textBaseline = 'middle';

  // Draw the name text
  ctx.fillText(name, x, y);

  // Return as PNG data URL (high quality)
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Generates a certificate image as a data URL (JPEG, quality 1.0).
 * @param name - The name to overlay on the certificate
 * @returns data URL of the generated certificate JPEG
 */
export async function generateCertificateJPEG(name: string): Promise<string> {
  // Fetch config and template image in parallel
  const [config, templateImg] = await Promise.all([
    fetchCertificateConfig(),
    loadTemplateImage(),
  ]);

  const width = templateImg.naturalWidth;
  const height = templateImg.naturalHeight;

  if (!width || !height) {
    throw new Error('Template image has invalid dimensions');
  }

  // Create canvas at full resolution
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  // Draw the template image as background
  ctx.drawImage(templateImg, 0, 0, width, height);

  // Calculate pixel position from percentage
  const x = (config.namePosition.x / 100) * width;
  const y = (config.namePosition.y / 100) * height;

  // Scale font size proportionally based on template width vs assumed design width (1536)
  const scaleFactor = width / 1536;
  const scaledFontSize = config.fontSize * scaleFactor;

  // Set up text rendering
  ctx.font = `bold ${scaledFontSize}px ${config.fontFamily}`;
  ctx.fillStyle = config.fontColor;
  ctx.textAlign = config.textAlign;
  ctx.textBaseline = 'middle';

  // Draw the name text
  ctx.fillText(name, x, y);

  // Return as JPEG data URL (maximum quality)
  return canvas.toDataURL('image/jpeg', 1.0);
}

/**
 * Downloads a data URL as a file.
 * @param dataUrl - The data URL to download
 * @param filename - The filename for the download
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // Small delay before removing to ensure download starts
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * Generates a certificate and triggers a download.
 * @param name - The name to overlay on the certificate
 * @param filename - Optional custom filename
 * @returns The generated data URL
 */
export async function downloadCertificate(
  name: string,
  filename?: string
): Promise<string> {
  const dataUrl = await generateCertificateJPEG(name);
  const safeFilename = filename || `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  downloadDataUrl(dataUrl, safeFilename);
  return dataUrl;
}

/**
 * Downloads an already-generated data URL as a certificate JPEG.
 * Avoids regenerating the image.
 * @param dataUrl - The already-generated certificate data URL
 * @param name - The name for the filename
 */
export function downloadExistingCertificate(dataUrl: string, name: string): void {
  const safeFilename = `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  // Ensure we download as JPEG with maximum quality
  // If the dataUrl is already a JPEG, use it directly; otherwise convert
  if (dataUrl.startsWith('data:image/jpeg')) {
    downloadDataUrl(dataUrl, safeFilename);
  } else {
    // Convert PNG data URL to JPEG with quality 1.0
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill white background (JPEG doesn't support transparency)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 1.0);
          downloadDataUrl(jpegDataUrl, safeFilename);
        } else {
          // Fallback: download as-is
          downloadDataUrl(dataUrl, safeFilename);
        }
      };
      img.src = dataUrl;
    } catch {
      // Fallback: download as-is with .jpg extension
      downloadDataUrl(dataUrl, safeFilename);
    }
  }
}

/**
 * Generates a certificate and returns it as a Blob for upload/sharing.
 */
export async function generateCertificateBlob(name: string): Promise<Blob> {
  const dataUrl = await generateCertificate(name);
  const response = await fetch(dataUrl);
  return await response.blob();
}
