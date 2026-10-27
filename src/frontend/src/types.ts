export type AdStatus =
  | 'ACTIVE'
  | 'MODERATION'
  | 'SOLD'
  | 'DELETE'
  | 'REJECTED';

export interface Option {
  value: string;
  label: string;
}

export interface Ad {
  id: string;
  title: string;
  images: string[];
  description: string;
  price: number;
  categoryId: string;
  status: AdStatus;
  location: string;
  authorId: string;
  phone: string;
  createdAt: string;
}

export interface FavoriteUser {
  userId: string;
  adId: string;
}

export interface Notification {
  id: string;
  username: string;
  message: string;
  createdAt: number;
  read: boolean;
  link?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}