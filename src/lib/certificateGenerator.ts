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

const DEFAULT_CONFIG: CertificateConfig = {
  namePosition: { x: 50, y: 50 },
  fontSize: 36,
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
 * Loads an image from a URL with crossOrigin support.
 * Retries with fallback URL on failure.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Loads the template image, trying GitHub first then local fallback.
 */
async function loadTemplateImage(): Promise<HTMLImageElement> {
  try {
    return await loadImage(GITHUB_RAW_TEMPLATE_URL);
  } catch {
    console.warn('[certificateGenerator] GitHub raw URL failed, trying local fallback');
    return await loadImage(FALLBACK_TEMPLATE_URL);
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
  const dataUrl = await generateCertificate(name);
  const safeFilename = filename || `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  downloadDataUrl(dataUrl, safeFilename);
  return dataUrl;
}

/**
 * Downloads an already-generated data URL as a certificate PNG.
 * Avoids regenerating the image.
 * @param dataUrl - The already-generated certificate data URL
 * @param name - The name for the filename
 */
export function downloadExistingCertificate(dataUrl: string, name: string): void {
  const safeFilename = `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  downloadDataUrl(dataUrl, safeFilename);
}

/**
 * Generates a certificate and returns it as a Blob for upload/sharing.
 */
export async function generateCertificateBlob(name: string): Promise<Blob> {
  const dataUrl = await generateCertificate(name);
  const response = await fetch(dataUrl);
  return await response.blob();
}
