const KB = 1024;
const MB = 1024 * KB;

/**
 * Loads an image File or Blob into an HTMLImageElement
 */
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image for compression."));
    };
    img.src = url;
  });

/**
 * Client-side browser image compression and auto-cropping using HTML5 Canvas.
 * Operates 100% in the user's browser with 0% server CPU or network load.
 *
 * @param {File} file - Original user-uploaded file
 * @param {Object} options - Compression options
 * @param {number} [options.maxBytes=1048576] - Maximum target byte size (e.g. 1 MB)
 * @param {number} [options.minBytes=10240] - Minimum target byte size (e.g. 10 KB)
 * @param {boolean} [options.square=false] - Whether the image must be center-cropped to square (e.g. photo requirement)
 * @param {number} [options.maxWidth=1200] - Max dimension width in pixels
 * @param {number} [options.maxHeight=1200] - Max dimension height in pixels
 * @param {number} [options.quality=0.85] - Initial JPEG quality
 * @returns {Promise<{ file: File, originalSize: number, compressedSize: number, wasCompressed: boolean, width: number, height: number }>}
 */
export async function compressImage(file, options = {}) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isJpegOrPng = ["jpg", "jpeg", "png", "webp"].includes(extension) || file.type.startsWith("image/");

  if (!isJpegOrPng || typeof window === "undefined" || typeof document === "undefined") {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
    };
  }

  const maxBytes = options.maxBytes || 1 * MB;
  const square = Boolean(options.square);
  const maxWidth = options.maxWidth || (square ? 1000 : 1600);
  const maxHeight = options.maxHeight || (square ? 1000 : 1600);

  const img = await loadImage(file);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Determine crop dimensions
  let sx = 0, sy = 0, sWidth = originalWidth, sHeight = originalHeight;
  if (square && originalWidth !== originalHeight) {
    const minDim = Math.min(originalWidth, originalHeight);
    sx = Math.floor((originalWidth - minDim) / 2);
    sy = Math.floor((originalHeight - minDim) / 2);
    sWidth = minDim;
    sHeight = minDim;
  }

  // Calculate target canvas dimensions
  let targetWidth = sWidth;
  let targetHeight = sHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Check if processing is needed (oversized, non-square when square requested, or larger than maxBytes)
  const needsCrop = square && originalWidth !== originalHeight;
  const needsResize = targetWidth < sWidth || targetHeight < sHeight;
  const needsCompression = file.size > maxBytes;

  if (!needsCrop && !needsResize && !needsCompression && extension === "jpg") {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
      width: originalWidth,
      height: originalHeight,
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  // Fill with white background for transparency conversion
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  // Compress progressively if size exceeds limit
  let quality = options.quality || 0.85;
  let blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));

  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1;
    blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  }

  const outputName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  const compressedFile = new File([blob], outputName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    wasCompressed: compressedFile.size < file.size || needsCrop,
    width: targetWidth,
    height: targetHeight,
  };
}
