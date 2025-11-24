import { StoreSlice } from '@/shared/store/types';
import { Toast, NotificationItem } from '@/shared/types';

export const createNotificationSlice: StoreSlice<{
  toasts: Toast[];
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  addToast: (type: Toast['type'], title: string, message: string) => void;
  clearNotifications: () => void;
  removeToast: (id: string) => void;
}> = (set, get) => ({
  toasts: [],
  notifications: [],
  isNotificationOpen: false,
  setIsNotificationOpen: isOpen => set({ isNotificationOpen: isOpen }),

  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  addToast: (type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    set(state => {
      const updatedToasts = [...state.toasts, { id, type, title, message }];
      const limitedToasts =
        updatedToasts.length > 3 ? updatedToasts.slice(updatedToasts.length - 3) : updatedToasts;
      return {
        notifications: [newNotification, ...state.notifications],
        toasts: limitedToasts,
      };
    });

    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  clearNotifications: () => set({ notifications: [] }),
});
