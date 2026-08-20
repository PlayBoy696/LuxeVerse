import { v2 as cloudinary } from "cloudinary";

import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

type CloudinaryResourceType = "image" | "video";

const getCloudinaryPublicId = (
  url: string | null | undefined,
  resourceType: CloudinaryResourceType
) => {
  if (!url?.trim()) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (parsedUrl.hostname.toLowerCase() !== "res.cloudinary.com") {
    return null;
  }

  const pathParts = parsedUrl.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
  const resourceIndex = pathParts.indexOf(resourceType);

  if (
    resourceIndex === -1 ||
    pathParts[resourceIndex + 1] !== "upload"
  ) {
    return null;
  }

  const publicIdParts = pathParts.slice(resourceIndex + 2);

  if (publicIdParts[0]?.match(/^v\d+$/)) {
    publicIdParts.shift();
  }

  if (publicIdParts.length === 0) {
    return null;
  }

  const publicId = publicIdParts.join("/");
  const extensionIndex = publicId.lastIndexOf(".");

  return extensionIndex > 0
    ? publicId.slice(0, extensionIndex)
    : publicId;
};

export const deleteCloudinaryImageByUrl = async (
  url: string | null | undefined
) => {
  const publicId = getCloudinaryPublicId(url, "image");

  if (!publicId) {
    return;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

export const deleteCloudinaryVideoByUrl = async (
  url: string | null | undefined
) => {
  const publicId = getCloudinaryPublicId(url, "video");

  if (!publicId) {
    return;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
};

export { getCloudinaryPublicId };

export { cloudinary };
export default cloudinary;
