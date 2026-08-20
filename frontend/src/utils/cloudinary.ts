const CLOUDINARY_TRANSFORM = 'c_fill,g_auto,w_1280,h_720/f_auto/q_auto';
const CLOUDINARY_IMAGE_MARKER = '/image/upload/';

export function getThumbnailUrl(url?: string | null): string {
  if (!url || !url.trim()) {
    return '';
  }

  if (!url.includes(CLOUDINARY_IMAGE_MARKER)) {
    return url;
  }

  return url.replace(
    CLOUDINARY_IMAGE_MARKER,
    `${CLOUDINARY_IMAGE_MARKER}${CLOUDINARY_TRANSFORM}/`
  );
}
