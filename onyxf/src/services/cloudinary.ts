import { Cloudinary } from '@cloudinary/url-gen';

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true
  }
});

export const uploadImage = async (file: File, folder: string = 'general'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getImageUrl = (publicId: string, transforms: any = {}): string => {
  return cloudinary.image(publicId).format('auto').quality('auto').toURL();
};

export const deleteImage = async (publicId: string): Promise<void> => {
  // Note: Image deletion should be handled through your backend
  // for security reasons. This is just a placeholder.
  console.warn('Image deletion should be implemented through your backend');
};
