import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  isPanelOpen: boolean;
  toastMessage: string | null;
  setPanelOpen: (open: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  addNotifications: (newNotifications: { id: number; title: string; message: string; type: string }[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isPanelOpen: false,
      toastMessage: null,

      setPanelOpen: (open) => set({ isPanelOpen: open }),
      setToastMessage: (msg) => set({ toastMessage: msg }),

      addNotifications: (newNotifications) => {
        const notifications = get().notifications;
        const now = new Date().toISOString();
        const incoming = newNotifications.map((n) => ({
          ...n,
          read: false,
          createdAt: now,
        }));
        set({ notifications: [...incoming, ...notifications] });
      },

      markAsRead: (id) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        set({ notifications: updated });
      },

      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, read: true }));
        set({ notifications: updated });
      },

      clearAll: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
