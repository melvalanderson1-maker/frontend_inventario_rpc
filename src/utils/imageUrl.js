export function resolveImageUrl(image) {
  if (!image) return null;

  switch (image.storage_provider) {
    case "cloudinary":
      return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload/${image.storage_key}`;
    case "s3":
      return `https://${import.meta.env.VITE_AWS_BUCKET}.s3.amazonaws.com/${image.storage_key}`;
    default:
      return null;
  }
}
