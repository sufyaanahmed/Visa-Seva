const KB = 1024;
const MB = 1024 * KB;

const readImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const result = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The selected JPEG could not be read as an image."));
    };
    image.src = url;
  });

export const validateFile = async (file, requirement) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!requirement.extensions.includes(extension))
    return `Choose a ${requirement.extensions.join(" or ").toUpperCase()} file.`;
  if (file.type && !requirement.mimeTypes.includes(file.type))
    return `The file content type (${file.type}) does not match the required format.`;
  if (requirement.minBytes && file.size < requirement.minBytes)
    return `File must be at least ${Math.round(requirement.minBytes / KB)} KB.`;
  if (requirement.maxBytes && file.size > requirement.maxBytes)
    return `File must be no larger than ${requirement.maxBytes >= MB ? `${requirement.maxBytes / MB} MB` : `${requirement.maxBytes / KB} KB`}.`;
  if (!file.size) return "Choose a file that is not empty.";
  if (file.size > 10 * MB) return "The upload limit is 10 MB per file.";
  if (extension === "jpg" || extension === "jpeg") {
    const dimensions = await readImageDimensions(file);
    if (requirement.square && dimensions.width !== dimensions.height)
      return `Photo must be square; selected image is ${dimensions.width} × ${dimensions.height}px.`;
    if (
      requirement.minDimension &&
      Math.min(dimensions.width, dimensions.height) < requirement.minDimension
    )
      return `Image must be at least ${requirement.minDimension} pixels on each side.`;
    if (
      requirement.maxDimension &&
      Math.max(dimensions.width, dimensions.height) > requirement.maxDimension
    )
      return `Image must be no more than ${requirement.maxDimension} pixels on each side.`;
    return { ...dimensions, extension };
  }
  return { extension };
};
