import { supabase } from '../config/supabaseClient';

export interface UploadResult {
  url: string;
  path: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Upload image or video to Supabase Storage
 * @param file - File to upload
 * @param type - 'avatar' | 'banner' | 'post' | 'video'
 * @returns Upload result with public URL
 */
export const uploadMedia = async (
  file: File, 
  type: 'avatar' | 'banner' | 'post' | 'video' = 'post'
): Promise<UploadResult> => {
  // Validate file
  if (!file) throw new Error('No file provided');
  
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  
  if (!isImage && !isVideo) {
    throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) allowed');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Max size is 5MB');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${type}/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath
  };
};

/**
 * Delete media from Supabase Storage
 * @param path - File path in storage
 */
export const deleteMedia = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('uploads')
    .remove([path]);

  if (error) throw error;
};

/**
 * Client-side image compression (optional but recommended)
 * @param file - Image file to compress
 * @param maxWidth - Max width in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Compressed file
 */
export const compressImage = async (
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height / width) * maxWidth;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};