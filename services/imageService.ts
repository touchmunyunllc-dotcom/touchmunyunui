import apiClient from './apiClient';

export const imageService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ url: string }>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
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

