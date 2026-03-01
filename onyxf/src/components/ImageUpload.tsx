// src/components/ImageUpload.tsx - PRODUCTION READY
import React, { useState, useRef } from 'react';
import { FaImage, FaVideo, FaTimes, FaSpinner } from 'react-icons/fa';
import { uploadMedia, compressImage } from '../services/uploadService';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  onRemove?: () => void;
  currentPreview?: string;
  type?: 'avatar' | 'banner' | 'post' | 'video';
  accept?: string;
  darkMode?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onRemove,
  currentPreview,
  type = 'post',
  accept = 'image/*,video/*',
  darkMode = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Determine media type
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');

      // Create local preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Compress image if it's an image
      let fileToUpload = file;
      if (!isVideo && type !== 'video') {
        try {
          fileToUpload = await compressImage(file);
          console.log('✅ Compressed:', file.size, '→', fileToUpload.size);
        } catch (err) {
          console.warn('⚠️ Compression failed, uploading original:', err);
        }
      }

      // Upload to Supabase
      const result = await uploadMedia(fileToUpload, type);
      
      toast.success(isVideo ? 'Video uploaded!' : 'Image uploaded!');
      onUploadComplete(result.url, isVideo ? 'video' : 'image');

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      toast.error(error.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setMediaType('image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden group">
          {mediaType === 'video' ? (
            // ✅ FIXED: Video with controls, preload, and object-contain
            <video 
              src={preview} 
              controls 
              preload="metadata"
              className="w-full max-h-96 object-contain bg-black"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-h-96 object-cover"
            />
          )}
          
          {/* ✅ FIXED: Remove button - proper JSX syntax */}
          <button
            onClick={handleRemove}
            disabled={uploading}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
              darkMode 
                ? 'bg-black/50 hover:bg-black/70 text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-900'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <FaTimes />
          </button>

          {uploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-white text-center">
                <FaSpinner className="animate-spin text-3xl mx-auto mb-2" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${type}`}
          />
          
          <label
            htmlFor={`file-upload-${type}`}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              darkMode
                ? 'bg-gray-900 border-gray-800 hover:border-purple-600/50 hover:bg-gray-800'
                : 'bg-gray-50 border-gray-300 hover:border-purple-400 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3 p-6">
              {uploading ? (
                <>
                  <FaSpinner className={`text-4xl animate-spin ${
                    darkMode ? 'text-purple-500' : 'text-purple-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Uploading...</p>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <FaImage className={`text-3xl ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <FaVideo className={`text-3xl ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Click to upload image or video
                    </p>
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      JPEG, PNG, GIF, WebP, MP4, WebM (max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
};