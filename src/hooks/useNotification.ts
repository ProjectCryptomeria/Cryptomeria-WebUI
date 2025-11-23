import { useState, useEffect, useRef } from 'react';
import { Toast, NotificationItem } from '../types';

/**
 * 通知とトースト管理のためのHook
 * アプリケーション全体の通知センターとトースト通知を管理します
 */
export const useNotification = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (type: 'success' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setToasts(prev => {
      const updated = [...prev, { id, type, title, message }];
      if (updated.length > 3) return updated.slice(updated.length - 3);
      return updated;
    });
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const clearNotifications = () => setNotifications([]);

  return {
    toasts,
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    notificationRef,
    addToast,
    clearNotifications,
  };
};
