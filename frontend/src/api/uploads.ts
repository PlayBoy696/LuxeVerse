import { uploadMultipart } from './client.js';

export type UploadResourceType = 'image' | 'video';

export type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: UploadResourceType;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
};

export type UploadApiResponse = {
  success: true;
  data: UploadedMedia;
};

const createUploadFormData = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

export const uploadImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  return uploadMultipart<UploadApiResponse>('/uploads/image', createUploadFormData(file));
};

export const uploadVideo = async (file: File) => {
  if (!file.type.startsWith('video/')) {
    throw new Error('Please select a valid video file.');
  }

  return uploadMultipart<UploadApiResponse>('/uploads/video', createUploadFormData(file));
};
