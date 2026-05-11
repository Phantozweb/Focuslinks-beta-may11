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

/**
 * Fetches the certificate config from the server API.
 */
async function fetchCertificateConfig(): Promise<CertificateConfig> {
  try {
    const res = await fetch('/api/certificate-config');
    const data = await res.json();
    if (data.success && data.config) {
      return {
        namePosition: data.config.namePosition || DEFAULT_CONFIG.namePosition,
        fontSize: data.config.fontSize || DEFAULT_CONFIG.fontSize,
        fontFamily: data.config.fontFamily || DEFAULT_CONFIG.fontFamily,
        fontColor: data.config.fontColor || DEFAULT_CONFIG.fontColor,
        textAlign: data.config.textAlign || DEFAULT_CONFIG.textAlign,
      };
    }
  } catch (err) {
    console.error('[certificateGenerator] Failed to fetch config, using defaults:', err);
  }
  return DEFAULT_CONFIG;
}

/**
 * Loads an image from a URL. Returns an HTMLImageElement.
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
 * Generates a certificate image as a data URL (PNG).
 * @param name - The name to overlay on the certificate
 * @param templateWidth - Override template width (optional)
 * @param templateHeight - Override template height (optional)
 * @returns data URL of the generated certificate PNG
 */
export async function generateCertificate(
  name: string,
  templateWidth?: number,
  templateHeight?: number
): Promise<string> {
  // Fetch the config and template image in parallel
  const [config, templateImg] = await Promise.all([
    fetchCertificateConfig(),
    loadImage(GITHUB_RAW_TEMPLATE_URL).catch(() => loadImage(FALLBACK_TEMPLATE_URL)),
  ]);

  const width = templateWidth || templateImg.naturalWidth;
  const height = templateHeight || templateImg.naturalHeight;

  // Create canvas
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
  ctx.font = `${scaledFontSize}px ${config.fontFamily}`;
  ctx.fillStyle = config.fontColor;
  ctx.textAlign = config.textAlign;
  ctx.textBaseline = 'middle';

  // Text alignment offset
  let textX = x;
  if (config.textAlign === 'center') {
    textX = x;
  } else if (config.textAlign === 'right') {
    textX = x;
  } else {
    textX = x;
  }

  // Draw the name
  ctx.fillText(name, textX, y);

  // Return as PNG data URL
  return canvas.toDataURL('image/png');
}

/**
 * Generates a certificate and triggers a download.
 */
export async function downloadCertificate(
  name: string,
  filename?: string
): Promise<string> {
  const dataUrl = await generateCertificate(name);

  // Trigger download
  const link = document.createElement('a');
  link.download = filename || `certificate-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}

/**
 * Generates a certificate and returns it as a Blob for upload/sharing.
 */
export async function generateCertificateBlob(name: string): Promise<Blob> {
  const dataUrl = await generateCertificate(name);
  const response = await fetch(dataUrl);
  return await response.blob();
}
