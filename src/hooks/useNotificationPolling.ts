import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotificationPosts } from '../services/notificationService';
import { useNotificationStore } from '../stores/notificationStore';

export function useNotificationPolling() {
  const [isTabVisible, setIsTabVisible] = useState(true);

  const { notifications, addNotifications, isPanelOpen, setToastMessage } = useNotificationStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Poll JSONPlaceholder
  const { data: posts, isSuccess } = useQuery({
    queryKey: ['notificationPosts'],
    queryFn: () => fetchNotificationPosts(),
    refetchInterval: isTabVisible ? 10000 : false,
    refetchOnWindowFocus: true,
  });

  // Process incoming posts
  useEffect(() => {
    if (isSuccess && posts) {
      const existingIds = new Set(notifications.map((n) => n.id));
      const fresh = posts
        .filter((post) => !existingIds.has(post.id))
        .map((post) => ({
          id: post.id,
          title: `New Post: ${post.title}`,
          message: post.body,
          type: 'post',
        }));

      if (fresh.length > 0) {
        addNotifications(fresh);

        // Show toast for the latest notification title if panel is closed
        if (!isPanelOpen) {
          setToastMessage(fresh[0].title);
        }
      }
    }
  }, [posts, isSuccess, addNotifications, notifications, isPanelOpen, setToastMessage]);
}
