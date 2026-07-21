import type { Notification, Page } from '../types/api';
import { queryString, request } from './apiClient';

export const notificationService = {
  list(page = 0, size = 20) {
    return request<Page<Notification>>(
      `/api/v1/notifications${queryString({ page, size })}`,
    );
  },
  unreadCount() {
    return request<{ count: number }>('/api/v1/notifications/unread-count');
  },
  markRead(id: string) {
    return request<Notification>(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
  },
  markAllRead() {
    return request<Notification[]>('/api/v1/notifications/read-all', { method: 'PATCH' });
  },
  delete(id: string) {
    return request<void>(`/api/v1/notifications/${id}`, { method: 'DELETE' });
  },
};
