// src/components/home/QueueStatus.tsx
import React from 'react';
import { FaClock } from 'react-icons/fa';
import { QueueStatus as QueueStatusType } from './types';

interface QueueStatusProps {
  status: QueueStatusType;
  onRetryFailed: () => void;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ status, onRetryFailed }) => {
  return (
    <>
      {status.pending > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-purple-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
          <FaClock className="animate-pulse" />
          <span>Syncing {status.pending} post{status.pending > 1 ? 's' : ''}...</span>
        </div>
      )}

      {status.failed > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-3 shadow-lg">
          <span>{status.failed} post{status.failed > 1 ? 's' : ''} failed</span>
          <button
            onClick={onRetryFailed}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold transition-all"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
};