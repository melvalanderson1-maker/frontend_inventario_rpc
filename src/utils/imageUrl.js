export function resolveImageUrl(image) {
  if (!image) return null;

  // Si image es un string, parseamos JSON
  let imgObj = image;
  if (typeof image === "string") {
    try {
      imgObj = JSON.parse(image);
    } catch (err) {
      console.error("Error parseando imagen:", err);
      return null;
    }
  }

  switch (imgObj.storage_provider) {
    case "cloudinary":
      return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload/${imgObj.storage_key}`;
    case "s3":
      return `https://${import.meta.env.VITE_AWS_BUCKET}.s3.amazonaws.com/${imgObj.storage_key}`;
    default:
      return null;
  }
}
