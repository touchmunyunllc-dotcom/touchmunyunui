import apiClient from './apiClient';
import { getApiErrorMessage } from '@/lib/apiError';

export const imageService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<{ url: string }>('/Images/upload', formData);
      if (!response.data?.url) {
        throw new Error('Upload succeeded but no URL was returned.');
      }
      return response.data.url;
    } catch (error) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (cloudName && preset) {
        try {
          return await imageService.uploadToCloudinary(file);
        } catch {
          throw new Error(getApiErrorMessage(error));
        }
      }
      throw new Error(getApiErrorMessage(error));
    }
  },

  async uploadToCloudinary(file: File): Promise<string> {
    // Direct Cloudinary upload (client-side)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset || '');

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  },
};

