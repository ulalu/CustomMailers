export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',');

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const OUTPUT_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.86;

class ImageError extends Error {}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      return decodeViaElement(file);
    }
  }
  return decodeViaElement(file);
}

function decodeViaElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageError('That file could not be read as an image.'));
    };
    image.src = objectUrl;
  });
}

function coverRect(sourceWidth, sourceHeight, aspectRatio) {
  const sourceAspect = sourceWidth / sourceHeight;
  if (sourceAspect > aspectRatio) {
    const width = sourceHeight * aspectRatio;
    return { sx: (sourceWidth - width) / 2, sy: 0, sw: width, sh: sourceHeight };
  }
  const height = sourceWidth / aspectRatio;
  return { sx: 0, sy: (sourceHeight - height) / 2, sw: sourceWidth, sh: height };
}

export async function cropImageToSlot(file, slot) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageError('Use a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImageError('That image is larger than 20MB. Try a smaller file.');
  }

  const source = await decode(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;

  const targetWidth = slot.exportWidth;
  const targetHeight = Math.round(targetWidth / slot.aspectRatio);
  const { sx, sy, sw, sh } = coverRect(sourceWidth, sourceHeight, slot.aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

  if (typeof source.close === 'function') {
    source.close();
  }

  const dataUrl = canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY);

  return {
    dataUrl,
    width: targetWidth,
    height: targetHeight,
    bytes: Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75),
  };
}

export function isImageError(error) {
  return error instanceof ImageError;
}
