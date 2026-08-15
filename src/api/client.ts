import {
  AuthResponse,
  User,
  Website,
  WebsiteDelivery,
  Category,
  Order,
  Transaction,
  Deposit,
  SupportTicket,
  AppNotification,
  MockEmail,
  SiteSettings
} from '../types';
import { getIdToken } from '../lib/firebase';

const API_BASE_URL = 'https://surest-plug.ai.studio';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred');
  }

  return data as T;
}

export const api = {
  // Auth
  getMe: () => request<{ user: User }>('/api/auth/me'),
  updateProfile: (data: any) => request<{ user: User }>('/api/auth/profile', { method: 'POST', body: JSON.stringify(data) }),

  // Public
  getWebsites: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ websites: Website[] }>(`/api/websites${query}`);
  },
  getWebsiteById: (id: string) => request<{ website: Website }>(`/api/websites/${id}`),
  getCategories: () => request<{ categories: Category[] }>('/api/categories'),
  getSettings: () => request<{ settings: SiteSettings }>('/api/settings'),

  // User Protected
  purchaseWebsite: (websiteId: string) => request<{ order: Order; newBalance: number; emailNotification?: MockEmail }>('/api/marketplace/purchase', { method: 'POST', body: JSON.stringify({ websiteId }) }),
  getPurchases: () => request<{ purchases: { order: Order; website: Website }[] }>('/api/user/purchases'),
  getPurchaseDelivery: (websiteId: string) => request<{ website: Website; delivery: WebsiteDelivery }>(`/api/user/purchases/${websiteId}/delivery`),
  downloadWebsite: async (websiteId: string) => {
    const token = await getIdToken();
    const res = await fetch(`${API_BASE_URL}/api/user/purchases/${websiteId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Download failed');
    }
    const data = await res.json();
    return data;
  },
  getBalance: () => request<{ balance: number }>('/api/user/balance'),
  submitDeposit: (data: { amount: number; paymentMethod: string; reference: string; proofNote?: string }) =>
    request<{ deposit: Deposit; message: string }>('/api/user/deposit', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: () => request<{ transactions: Transaction[] }>('/api/user/transactions'),
  getDeposits: () => request<{ deposits: Deposit[] }>('/api/user/deposits'),
  getOrders: () => request<{ orders: Order[] }>('/api/user/orders'),
  getNotifications: () => request<{ notifications: AppNotification[] }>('/api/user/notifications'),
  markNotificationsRead: () => request<{ status: string }>('/api/user/notifications/read', { method: 'POST' }),
  getMockEmails: () => request<{ emails: MockEmail[] }>('/api/user/emails'),
  markMockEmailRead: (id: string) => request<{ status: string }>(`/api/user/emails/${id}/read`, { method: 'POST' }),
  getTickets: () => request<{ tickets: SupportTicket[] }>('/api/user/tickets'),
  createTicket: (data: { subject: string; category?: string; priority?: string; message: string }) =>
    request<{ ticket: SupportTicket }>('/api/user/tickets', { method: 'POST', body: JSON.stringify(data) }),
  replyTicket: (id: string, message: string) =>
    request<{ ticket: SupportTicket }>(`/api/user/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),

  // Admin
  getAdminStats: () => request<{ stats: any }>('/api/admin/stats'),
  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),
  setUserStatus: (id: string, status: 'active' | 'suspended') => request<{ success: boolean }>(`/api/admin/users/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  resetUserPassword: (id: string, newPassword: string) => request<{ message: string }>(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  adjustUserBalance: (id: string, data: { amount: number; type: 'credit' | 'debit'; description: string }) =>
    request<{ balance: number; transaction: Transaction }>(`/api/admin/users/${id}/balance`, { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),

  getAdminWebsites: () => request<{ websites: Website[] }>('/api/admin/websites'),
  getAdminWebsiteDelivery: (websiteId: string) => request<{ delivery: WebsiteDelivery }>(`/api/admin/websites/${websiteId}/delivery`),
  createWebsite: (data: any) => request<{ website: Website; delivery?: WebsiteDelivery }>('/api/admin/websites', { method: 'POST', body: JSON.stringify(data) }),
  updateWebsite: (id: string, data: any) => request<{ website: Website }>(`/api/admin/websites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWebsite: (id: string) => request<{ success: boolean }>(`/api/admin/websites/${id}`, { method: 'DELETE' }),

  getAdminOrders: () => request<{ orders: Order[] }>('/api/admin/orders'),
  updateOrderStatus: (id: string, orderStatus: string, paymentStatus?: string) =>
    request<{ order: Order }>(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ orderStatus, paymentStatus }) }),
  refundOrder: (id: string, adminNote?: string) =>
    request<{ order: Order; message: string }>(`/api/admin/orders/${id}/refund`, { method: 'POST', body: JSON.stringify({ adminNote }) }),

  getAdminDeposits: () => request<{ deposits: Deposit[] }>('/api/admin/deposits'),
  approveDeposit: (id: string, adminNote?: string) => request<{ deposit: Deposit; message: string }>(`/api/admin/deposits/${id}/approve`, { method: 'POST', body: JSON.stringify({ adminNote }) }),
  rejectDeposit: (id: string, adminNote?: string) => request<{ deposit: Deposit; message: string }>(`/api/admin/deposits/${id}/reject`, { method: 'POST', body: JSON.stringify({ adminNote }) }),
  getAdminTransactions: () => request<{ transactions: Transaction[] }>('/api/admin/transactions'),

  createCategory: (data: { name: string; description?: string }) => request<{ category: Category }>('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: { name?: string; description?: string; status?: string }) =>
    request<{ category: Category }>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ success: boolean }>(`/api/admin/categories/${id}`, { method: 'DELETE' }),

  getAdminTickets: () => request<{ tickets: SupportTicket[] }>('/api/admin/tickets'),
  adminReplyTicket: (id: string, message: string) => request<{ ticket: SupportTicket }>(`/api/admin/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  updateTicketStatus: (id: string, status: string) => request<{ ticket: SupportTicket }>(`/api/admin/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateTicketPriority: (id: string, priority: string) => request<{ ticket: SupportTicket }>(`/api/admin/tickets/${id}/priority`, { method: 'PUT', body: JSON.stringify({ priority }) }),

  getAdminBroadcasts: () => request<{ broadcasts: any[] }>('/api/admin/broadcasts'),
  createBroadcast: (data: any) => request<{ broadcast: any; message: string }>('/api/admin/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  updateBroadcast: (id: string, data: any) => request<{ broadcast: any }>(`/api/admin/broadcasts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendBroadcast: (id: string) => request<{ broadcast: any; message: string }>(`/api/admin/broadcasts/${id}/send`, { method: 'POST' }),
  deleteBroadcast: (id: string) => request<{ success: boolean }>(`/api/admin/broadcasts/${id}`, { method: 'DELETE' }),

  updateSettings: (data: any) => request<{ settings: SiteSettings }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  broadcastNotification: (data: { title: string; message: string; type?: string }) => request<{ message: string }>('/api/admin/broadcast', { method: 'POST', body: JSON.stringify(data) })
};

