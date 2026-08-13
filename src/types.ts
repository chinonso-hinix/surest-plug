export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type WebsiteStatus = 'draft' | 'published' | 'unpublished' | 'sold';

export interface WebsiteDelivery {
  websiteId: string;
  loginUrl?: string;
  adminPanelUrl?: string;
  adminEmail?: string;
  adminPassword?: string;
  instructions?: string;
  downloadFileUrl?: string;
  packageFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  buyerUid: string;
  websiteId: string;
  paymentStatus: string;
  purchasedAt: string;
}

export interface Website {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  previewImage: string;
  gallery: string[];
  demoUrl: string;
  technologies: string[];
  features: string[];
  fileUrl?: string;
  packageFileName?: string;
  status: WebsiteStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'verified' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  websiteId: string;
  websiteTitle: string;
  websitePrice: number;
  amount: number;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'deposit' | 'purchase' | 'credit' | 'debit' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  proofNote?: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'active' | 'selected';
  selectedUserIds?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent';
  recipientCount?: number;
  createdAt: string;
  sentAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
}

export interface MockEmail {
  id: string;
  userId: string;
  toEmail: string;
  toName: string;
  from: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  orderId?: string;
  websiteId?: string;
  websiteTitle?: string;
  amount?: number;
  createdAt: string;
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  instructions: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: SocialLinks;
  currency: string;
  maintenanceMode: boolean;
  bankDetails: BankDetails;
}

export interface AuthResponse {
  token: string;
  user: User;
}
