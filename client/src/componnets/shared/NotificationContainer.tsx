'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectNotification, hideNotification } from '@/store/slices/uiSlice';

export const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector(selectNotification);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 4000); // Auto hide after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
      <div
        className={`max-w-md rounded-xl border-2 shadow-lg p-4 ${getColors()} flex items-start gap-3`}
      >
        <span className="text-2xl shrink-0">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-medium">{notification.message}</p>
        </div>
        <button
          onClick={() => dispatch(hideNotification())}
          className="shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
