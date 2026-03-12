// src/components/home/ReportModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaFlag } from 'react-icons/fa';
import { ReportReason } from '../../services/reportService';

interface ReportModalProps {
  darkMode: boolean;
  isOpen: boolean;
  postId: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => Promise<void>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  darkMode,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons: { value: ReportReason; label: string; description: string }[] = [
    { value: 'spam', label: 'Spam', description: 'Repetitive or promotional content' },
    { value: 'harassment', label: 'Harassment', description: 'Bullying or targeted attacks' },
    { value: 'inappropriate', label: 'Inappropriate', description: 'Offensive or inappropriate content' },
    { value: 'nsfw', label: 'NSFW', description: 'Adult or explicit content' },
    { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
    { value: 'other', label: 'Other', description: 'Other violations' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, description);
      setDescription('');
      setSelectedReason('spam');
      onClose();
    } catch (error) {
      console.error('Report submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-lg w-full p-6 border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FaFlag className="text-orange-500 text-lg" />
            </div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report Post
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <p className={`text-sm mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Help us keep Onyx safe. Select a reason for reporting this post.
        </p>

        <div className="space-y-2 mb-5">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedReason === reason.value
                  ? 'border-orange-500 bg-orange-500/10'
                  : darkMode
                    ? 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold text-sm ${
                    selectedReason === reason.value 
                      ? 'text-orange-500' 
                      : darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {reason.label}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {reason.description}
                  </div>
                </div>
                {selectedReason === reason.value && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details (optional)"
          className={`w-full p-3 border rounded-lg resize-none text-sm focus:outline-none ${
            darkMode
              ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-orange-600/50'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-orange-400'
          }`}
          rows={3}
        />

        <div className="flex items-center justify-end space-x-3 mt-5">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              darkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Reporting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};