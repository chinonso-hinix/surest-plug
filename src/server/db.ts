import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
import https from 'https';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import https from 'https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };
import {
  User,
  Website,
  WebsiteDelivery,
  Purchase,
  Order,
  OrderStatus,
  PaymentStatus,
  Transaction,
  Deposit,
  SupportTicket,
  TicketPriority,
  TicketStatus,
  Broadcast,
  AppNotification,
  MockEmail,
  Category,
  SiteSettings
} from '../types.js';

const firebaseHttpAgent = new https.Agent({
  family: 4,
  keepAlive: true
});

const firebaseApp = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
      httpAgent: firebaseHttpAgent
    })
  : getApp();

export const adminAuth = getAuth(firebaseApp);
export const adminDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const DEFAULT_LOGO = "/logo.png";

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Investment', slug: 'investment', description: 'HYIP, Staking, Forex & Crypto investment portals', status: 'active' },
  { id: 'cat-2', name: 'SMM', slug: 'smm', description: 'Social Media Marketing panels and reseller web apps', status: 'active' },
  { id: 'cat-3', name: 'Portfolio', slug: 'portfolio', description: 'Agency, freelancer, developer & creative showcase sites', status: 'active' },
  { id: 'cat-4', name: 'Blog', slug: 'blog', description: 'High performance blogs, magazine & editorial publishing apps', status: 'active' },
  { id: 'cat-5', name: 'Restaurant', slug: 'restaurant', description: 'Food ordering, table reservation, and menu management portals', status: 'active' },
  { id: 'cat-6', name: 'Real Estate', slug: 'real-estate', description: 'Property listing, agent directory & virtual tour platforms', status: 'active' },
  { id: 'cat-7', name: 'Education', slug: 'education', description: 'LMS, online course selling & student portals', status: 'active' },
  { id: 'cat-8', name: 'Entertainment', slug: 'entertainment', description: 'Media streaming, gaming portals & ticket booking apps', status: 'active' },
  { id: 'cat-9', name: 'Finance', slug: 'finance', description: 'Fintech dashboards, wallet apps & banking interfaces', status: 'active' },
  { id: 'cat-10', name: 'Landing Pages', slug: 'landing-pages', description: 'High conversion SaaS & lead generation single pages', status: 'active' },
  { id: 'cat-11', name: 'Other', slug: 'other', description: 'Custom web platforms, e-commerce & utility applications', status: 'active' }
];

const initialSettings: SiteSettings = {
  siteName: 'SUREST PLUG',
  logoUrl: DEFAULT_LOGO,
  description: 'Your #1 Marketplace for Ready-To-Launch Websites & Digital Assets.',
  contactEmail: 'suresstplug@gmail.com',
  contactPhone: '08141853557',
  address: '100 Innovation Way, Suite 400, Tech Plaza',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  currency: '₦',
  maintenanceMode: false,
  bankDetails: {
    bankName: 'Opay Bank',
    accountNumber: '8141853557',
    accountName: 'chinonso monday',
    instructions: 'Please transfer your deposit amount to the Opay Bank account above. Include your account email as the transaction reference or upload reference details below.'
  }
};

class FirestoreDatabase {
  private usersMap = new Map<string, User>();
  private websitesMap = new Map<string, Website>();
  private websiteDeliveriesMap = new Map<string, WebsiteDelivery>();
  private purchasesMap = new Map<string, Purchase>();
  private ordersMap = new Map<string, Order>();
  private transactionsMap = new Map<string, Transaction>();
  private depositsMap = new Map<string, Deposit>();
  private ticketsMap = new Map<string, SupportTicket>();
  private broadcastsMap = new Map<string, Broadcast>();
  private notificationsMap = new Map<string, AppNotification>();
  private mockEmailsMap = new Map<string, MockEmail>();
  private categoriesMap = new Map<string, Category>();
  private settings: SiteSettings = initialSettings;

  constructor() {
    this.initCategoriesAndSettings();
    this.listenToFirestore();
  }

  private async initCategoriesAndSettings() {
    try {
      // Seed categories if empty
      const catSnap = await adminDb.collection('categories').get();
      if (catSnap.empty) {
        const batch = adminDb.batch();
        initialCategories.forEach(cat => {
          const ref = adminDb.collection('categories').doc(cat.id);
          batch.set(ref, cat);
        });
        await batch.commit();
      }

      // Seed site settings if empty
      const settingsRef = adminDb.collection('siteSettings').doc('general');
      const settingsSnap = await settingsRef.get();
      if (!settingsSnap.exists) {
        await settingsRef.set(initialSettings);
      }
    } catch (err) {
      console.warn('Note on Firestore categories/settings init:', err);
    }
  }

  private listenToFirestore() {
    const errorLog = (name: string) => (err: any) => {
      console.warn(`Firestore admin snapshot handled [${name}]:`, err?.message || err);
    };

    try {
      adminDb.collection('users').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          const data = change.doc.data() as any;
          const user: User = {
            id: change.doc.id,
            name: data.fullName || data.name || 'User',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'user',
            status: data.status || 'active',
            balance: typeof data.balance === 'number' ? data.balance : 0,
            profileImage: data.profileImage || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          };
          if (change.type === 'removed') {
            this.usersMap.delete(change.doc.id);
          } else {
            this.usersMap.set(change.doc.id, user);
          }
        });
      }, errorLog('users'));

      adminDb.collection('websites').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.websitesMap.delete(change.doc.id);
          } else {
            this.websitesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Website);
          }
        });
      }, errorLog('websites'));

      adminDb.collection('categories').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.categoriesMap.delete(change.doc.id);
          } else {
            this.categoriesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Category);
          }
        });
      }, errorLog('categories'));

      adminDb.collection('orders').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.ordersMap.delete(change.doc.id);
          } else {
            this.ordersMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Order);
          }
        });
      }, errorLog('orders'));

      adminDb.collection('transactions').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.transactionsMap.delete(change.doc.id);
          } else {
            this.transactionsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Transaction);
          }
        });
      }, errorLog('transactions'));

      adminDb.collection('deposits').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.depositsMap.delete(change.doc.id);
          } else {
            this.depositsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Deposit);
          }
        });
      }, errorLog('deposits'));

      adminDb.collection('supportTickets').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.ticketsMap.delete(change.doc.id);
          } else {
            this.ticketsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as SupportTicket);
          }
        });
      }, errorLog('supportTickets'));

      adminDb.collection('broadcasts').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.broadcastsMap.delete(change.doc.id);
          } else {
            this.broadcastsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Broadcast);
          }
        });
      }, errorLog('broadcasts'));

      adminDb.collection('notifications').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.notificationsMap.delete(change.doc.id);
          } else {
            this.notificationsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as AppNotification);
          }
        });
      }, errorLog('notifications'));

      adminDb.collection('websiteDeliveries').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.websiteDeliveriesMap.delete(change.doc.id);
          } else {
            this.websiteDeliveriesMap.set(change.doc.id, { websiteId: change.doc.id, ...change.doc.data() } as WebsiteDelivery);
          }
        });
      }, errorLog('websiteDeliveries'));

      adminDb.collection('purchases').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.purchasesMap.delete(change.doc.id);
          } else {
            this.purchasesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as Purchase);
          }
        });
      }, errorLog('purchases'));

      adminDb.collection('mockEmails').onSnapshot(snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            this.mockEmailsMap.delete(change.doc.id);
          } else {
            this.mockEmailsMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() } as MockEmail);
          }
        });
      }, errorLog('mockEmails'));

      adminDb.collection('siteSettings').doc('general').onSnapshot(snap => {
        if (snap.exists) {
          this.settings = { ...initialSettings, ...snap.data() } as SiteSettings;
        }
      }, errorLog('siteSettings'));
    } catch (err) {
      console.warn('Note setting up snapshot listeners:', err);
    }
  }

  public upsertUser(user: User) {
    this.usersMap.set(user.id, user);
  }

  // --- Getters ---
  public getUsers(): User[] {
    return Array.from(this.usersMap.values());
  }

  public getUserById(id: string): User | null {
    return this.usersMap.get(id) || null;
  }

  public getUserByEmail(email: string): User | null {
    const target = email.toLowerCase();
    for (const u of this.usersMap.values()) {
      if (u.email.toLowerCase() === target) return u;
    }
    return null;
  }

  public getWebsites(filter?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; featured?: boolean; status?: string; sort?: string }): Website[] {
    let list = Array.from(this.websitesMap.values());

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        list = list.filter(w => w.status === filter.status);
      } else if (!filter.status) {
        list = list.filter(w => w.status === 'published');
      }

      if (filter.category && filter.category !== 'All') {
        list = list.filter(w => w.category.toLowerCase() === filter.category!.toLowerCase());
      }

      if (filter.featured) {
        list = list.filter(w => w.featured);
      }

      if (filter.minPrice !== undefined && !isNaN(filter.minPrice)) {
        list = list.filter(w => w.price >= filter.minPrice!);
      }

      if (filter.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
        list = list.filter(w => w.price <= filter.maxPrice!);
      }

      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(w => 
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          (w.technologies && w.technologies.some(t => t.toLowerCase().includes(q)))
        );
      }

      if (filter.sort) {
        if (filter.sort === 'price-low') list.sort((a, b) => a.price - b.price);
        else if (filter.sort === 'price-high') list.sort((a, b) => b.price - a.price);
        else if (filter.sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (filter.sort === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    }

    return list;
  }

  public getWebsiteById(id: string): Website | null {
    return this.websitesMap.get(id) || null;
  }

  public getCategories(): Category[] {
    if (this.categoriesMap.size === 0) return initialCategories;
    return Array.from(this.categoriesMap.values());
  }

  public getOrders(userId?: string): Order[] {
    const list = Array.from(this.ordersMap.values());
    if (userId) {
      return list.filter(o => o.userId === userId);
    }
    return list;
  }

  public async updateOrderStatus(orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus) {
    let orderData = this.ordersMap.get(orderId);

    if (!orderData) {
      try {
        const snap = await adminDb.collection('orders').doc(orderId).get();
        if (snap.exists) {
          orderData = { ...snap.data(), id: orderId } as Order;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!orderData) throw new Error('Order not found');

    const updates: any = {
      orderStatus,
      updatedAt: new Date().toISOString()
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    const updatedOrder = { ...orderData, ...updates } as Order;
    this.ordersMap.set(orderId, updatedOrder);

    try {
      await adminDb.collection('orders').doc(orderId).update(updates);
    } catch (e) {
      // ignore
    }

    this.addNotification({
      userId: updatedOrder.userId,
      title: 'Order Status Updated',
      message: `Your order #${orderId} for "${updatedOrder.websiteTitle}" has been updated to ${orderStatus.toUpperCase()}.`,
      type: 'info'
    });

    return updatedOrder;
  }

  public async refundOrder(orderId: string, adminNote?: string) {
    let orderData = this.ordersMap.get(orderId);

    if (!orderData) {
      try {
        const snap = await adminDb.collection('orders').doc(orderId).get();
        if (snap.exists) {
          orderData = snap.data() as Order;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!orderData) throw new Error('Order not found');

    if (orderData.orderStatus === 'refunded') {
      throw new Error('Order has already been refunded');
    }

    await this.updateBalance(
      orderData.userId,
      orderData.amount,
      `Refund for Order #${orderId}: ${orderData.websiteTitle}`,
      'refund',
      'REF-' + orderId
    );

    const refundedOrder = {
      ...orderData,
      orderStatus: 'refunded' as OrderStatus,
      paymentStatus: 'refunded' as PaymentStatus,
      updatedAt: new Date().toISOString()
    };

    this.ordersMap.set(orderId, refundedOrder);

    try {
      await adminDb.collection('orders').doc(orderId).update({
        orderStatus: 'refunded',
        paymentStatus: 'refunded',
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      // ignore
    }

    this.addNotification({
      userId: orderData.userId,
      title: 'Order Refunded',
      message: `Your order #${orderId} for "${orderData.websiteTitle}" has been refunded. $${orderData.amount.toFixed(2)} credited back to your balance.`,
      type: 'success'
    });

    return refundedOrder;
  }

  public getTransactions(userId?: string): Transaction[] {
    const list = Array.from(this.transactionsMap.values());
    if (userId) {
      return list.filter(t => t.userId === userId);
    }
    return list;
  }

  public getDeposits(userId?: string): Deposit[] {
    const list = Array.from(this.depositsMap.values());
    if (userId) {
      return list.filter(d => d.userId === userId);
    }
    return list;
  }

  public getTickets(userId?: string): SupportTicket[] {
    const list = Array.from(this.ticketsMap.values());
    if (userId) {
      return list.filter(t => t.userId === userId);
    }
    return list;
  }

  public getBroadcasts(): Broadcast[] {
    return Array.from(this.broadcastsMap.values());
  }

  public getNotifications(userId: string): AppNotification[] {
    return Array.from(this.notificationsMap.values()).filter(n => n.userId === userId);
  }

  public getMockEmails(userId: string): MockEmail[] {
    return Array.from(this.mockEmailsMap.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markMockEmailRead(id: string) {
    const existing = this.mockEmailsMap.get(id);
    if (existing) {
      this.mockEmailsMap.set(id, { ...existing, read: true });
      try {
        await adminDb.collection('mockEmails').doc(id).update({ read: true });
      } catch (e) {
        // ignore
      }
    }
    return true;
  }

  public getSettings(): SiteSettings {
    return { ...this.settings, logoUrl: DEFAULT_LOGO };
  }

  // --- Mutations ---

  public async setUserStatus(userId: string, status: 'active' | 'suspended') {
    const existing = this.usersMap.get(userId);
    if (existing) {
      this.usersMap.set(userId, { ...existing, status, updatedAt: new Date().toISOString() });
    }
    try {
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      // ignore
    }
    return true;
  }

  public async deleteUser(userId: string) {
    this.usersMap.delete(userId);
    try {
      await adminDb.collection('users').doc(userId).delete();
    } catch (e) {
      // ignore
    }
    try {
      await adminAuth.deleteUser(userId);
    } catch (e) {
      // Ignored if user not found in auth
    }
    return true;
  }

  public async addNotification(notif: { userId: string; title: string; message: string; type?: 'info' | 'success' | 'warning' }) {
    const id = 'ntf-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newNotif: AppNotification = {
      id,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      read: false,
      type: notif.type || 'info',
      createdAt: new Date().toISOString()
    };

    this.notificationsMap.set(id, newNotif);
    try {
      await adminDb.collection('notifications').doc(id).set(newNotif);
    } catch (e) {
      // ignore
    }
    return newNotif;
  }

  public async markNotificationsRead(userId: string) {
    const userNotifs = Array.from(this.notificationsMap.values()).filter(n => n.userId === userId && !n.read);
    userNotifs.forEach(n => {
      this.notificationsMap.set(n.id, { ...n, read: true });
    });
    try {
      const batch = adminDb.batch();
      userNotifs.forEach(n => {
        const ref = adminDb.collection('notifications').doc(n.id);
        batch.update(ref, { read: true });
      });
      if (userNotifs.length > 0) {
        await batch.commit();
      }
    } catch (e) {
      // ignore
    }
    return true;
  }

  public async updateBalance(userId: string, amountChange: number, description: string, type: 'deposit' | 'purchase' | 'credit' | 'debit' | 'refund', reference: string) {
    let userData = this.usersMap.get(userId);

    if (!userData) {
      try {
        const snap = await adminDb.collection('users').doc(userId).get();
        if (snap.exists) {
          userData = { id: userId, ...snap.data() } as any;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!userData) {
      userData = {
        id: userId,
        name: 'User',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        balance: 0,
        profileImage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const currentBalance = typeof userData.balance === 'number' ? userData.balance : 0;
    const newBalance = currentBalance + amountChange;

    if (newBalance < 0) {
      throw new Error('Insufficient account balance');
    }

    const updatedUser = {
      ...userData,
      balance: newBalance,
      updatedAt: new Date().toISOString()
    };
    this.usersMap.set(userId, updatedUser);

    try {
      await adminDb.collection('users').doc(userId).update({
        balance: newBalance,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      // ignore
    }

    const txnId = 'TXN-' + Date.now();
    const txn: Transaction = {
      id: txnId,
      userId,
      userName: userData.name || userData.fullName || 'User',
      type,
      amount: Math.abs(amountChange),
      description,
      reference,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    this.transactionsMap.set(txnId, txn);
    try {
      await adminDb.collection('transactions').doc(txnId).set(txn);
    } catch (e) {
      // ignore
    }

    return { balance: newBalance, transaction: txn };
  }

  // --- Website Operations ---
  public getWebsiteDelivery(websiteId: string): WebsiteDelivery | null {
    return this.websiteDeliveriesMap.get(websiteId) || null;
  }

  public async saveWebsiteDelivery(websiteId: string, deliveryObj: Partial<WebsiteDelivery>) {
    const now = new Date().toISOString();
    const existing = this.websiteDeliveriesMap.get(websiteId);
    const newDelivery: WebsiteDelivery = {
      websiteId,
      loginUrl: deliveryObj.loginUrl || existing?.loginUrl || '',
      adminPanelUrl: deliveryObj.adminPanelUrl || existing?.adminPanelUrl || '',
      adminEmail: deliveryObj.adminEmail || existing?.adminEmail || '',
      adminPassword: deliveryObj.adminPassword || existing?.adminPassword || '',
      instructions: deliveryObj.instructions || existing?.instructions || '',
      downloadFileUrl: deliveryObj.downloadFileUrl || existing?.downloadFileUrl || '',
      packageFileName: deliveryObj.packageFileName || existing?.packageFileName || '',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    this.websiteDeliveriesMap.set(websiteId, newDelivery);
    try {
      await adminDb.collection('websiteDeliveries').doc(websiteId).set(newDelivery, { merge: true });
    } catch (e) {
      // ignore
    }
    return newDelivery;
  }

  public async addWebsite(
    websiteObj: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>,
    deliveryObj?: Partial<WebsiteDelivery>
  ) {
    const id = 'web-' + Date.now();
    const now = new Date().toISOString();

    // Clean public website object (do not store private credentials)
    const { ...cleanWeb } = websiteObj as any;
    delete cleanWeb.loginUrl;
    delete cleanWeb.adminPanelUrl;
    delete cleanWeb.adminEmail;
    delete cleanWeb.adminPassword;
    delete cleanWeb.instructions;

    const newWeb: Website = {
      ...cleanWeb,
      id,
      slug: websiteObj.slug || websiteObj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: now,
      updatedAt: now
    };

    this.websitesMap.set(id, newWeb);
    try {
      await adminDb.collection('websites').doc(id).set(newWeb);
    } catch (e) {
      // ignore
    }

    if (deliveryObj) {
      await this.saveWebsiteDelivery(id, deliveryObj);
    }

    return newWeb;
  }

  public async updateWebsite(
    id: string,
    updates: Partial<Website>,
    deliveryObj?: Partial<WebsiteDelivery>
  ) {
    const existing = this.websitesMap.get(id);
    const cleanUpdates = { ...updates } as any;
    delete cleanUpdates.loginUrl;
    delete cleanUpdates.adminPanelUrl;
    delete cleanUpdates.adminEmail;
    delete cleanUpdates.adminPassword;
    delete cleanUpdates.instructions;

    const newUpdates = {
      ...cleanUpdates,
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      const updated = { ...existing, ...newUpdates };
      this.websitesMap.set(id, updated);
    }

    try {
      const webRef = adminDb.collection('websites').doc(id);
      await webRef.update(newUpdates);
    } catch (e) {
      // ignore
    }

    if (deliveryObj) {
      await this.saveWebsiteDelivery(id, deliveryObj);
    }

    return this.websitesMap.get(id) || null;
  }

  public async deleteWebsite(id: string) {
    this.websitesMap.delete(id);
    this.websiteDeliveriesMap.delete(id);
    try {
      await adminDb.collection('websites').doc(id).delete();
      await adminDb.collection('websiteDeliveries').doc(id).delete();
    } catch (e) {
      // ignore
    }
    return true;
  }

  public userHasPurchasedWebsite(userId: string, websiteId: string): boolean {
    const purchaseKey = `${userId}_${websiteId}`;
    if (this.purchasesMap.has(purchaseKey)) return true;
    const orders = this.getOrders(userId);
    return orders.some(o => o.websiteId === websiteId && (o.orderStatus === 'completed' || o.paymentStatus === 'verified'));
  }

  // --- Purchase Flow ---
  public async purchaseWebsite(userId: string, websiteId: string) {
    let userData = this.usersMap.get(userId);
    if (!userData) {
      try {
        const userSnap = await adminDb.collection('users').doc(userId).get();
        if (userSnap.exists) {
          userData = { id: userId, ...userSnap.data() } as any;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!userData) throw new Error('User account profile not found');

    let website = this.websitesMap.get(websiteId);
    if (!website) {
      try {
        const webSnap = await adminDb.collection('websites').doc(websiteId).get();
        if (webSnap.exists) {
          website = webSnap.data() as Website;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!website) throw new Error('Website not found');

    if (website.status === 'unpublished' || website.status === 'draft') {
      throw new Error('Website is currently unavailable for purchase');
    }

    if (this.userHasPurchasedWebsite(userId, websiteId)) {
      throw new Error('You have already purchased this website');
    }

    const userBalance = typeof userData.balance === 'number' ? userData.balance : 0;
    if (userBalance < website.price) {
      throw new Error(`Insufficient balance. Available: ₦${userBalance.toLocaleString()}, Required: ₦${website.price.toLocaleString()}. Please fund your account balance first.`);
    }

    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const { balance, transaction } = await this.updateBalance(
      userId,
      -website.price,
      `Purchased website: ${website.title}`,
      'purchase',
      orderId
    );

    const newOrder: Order = {
      id: orderId,
      userId,
      userName: userData.name || userData.fullName || 'User',
      userEmail: userData.email,
      websiteId: website.id,
      websiteTitle: website.title,
      websitePrice: website.price,
      amount: website.price,
      paymentReference: transaction.id,
      paymentStatus: 'verified',
      orderStatus: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.ordersMap.set(orderId, newOrder);
    try {
      await adminDb.collection('orders').doc(orderId).set(newOrder);
    } catch (e) {
      // ignore
    }

    // Save purchase record for security rules verification
    const purchaseKey = `${userId}_${websiteId}`;
    const purchaseRecord: Purchase = {
      id: purchaseKey,
      buyerUid: userId,
      websiteId: websiteId,
      paymentStatus: 'verified',
      purchasedAt: new Date().toISOString()
    };
    this.purchasesMap.set(purchaseKey, purchaseRecord);
    try {
      await adminDb.collection('purchases').doc(purchaseKey).set(purchaseRecord);
    } catch (e) {
      // ignore
    }

    this.addNotification({
      userId,
      title: 'Website Purchase Successful!',
      message: `You successfully purchased "${website.title}" for ₦${website.price.toLocaleString()}. Access your private access credentials in My Purchases.`,
      type: 'success'
    });

    const emailNotification = await this.sendPurchaseReceiptEmail(userId, newOrder, website);

    return { order: newOrder, newBalance: balance, emailNotification };
  }

  public async sendPurchaseReceiptEmail(userId: string, order: Order, website: Website): Promise<MockEmail> {
    const userData = this.usersMap.get(userId);
    const toEmail = userData?.email || order.userEmail || 'customer@surestplug.com';
    const toName = userData?.name || order.userName || 'Valued Customer';
    const formattedPrice = `₦${website.price.toLocaleString()}`;
    const id = 'EML-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const delivery = this.websiteDeliveriesMap.get(website.id);

    const subject = `Order Confirmed! Your Ready-To-Launch Website "${website.title}" is Ready 🚀`;

    const textBody = `Hello ${toName},\n\nThank you for your purchase on SUREST PLUG!\n\nOrder Summary:\n- Order ID: ${order.id}\n- Website: ${website.title}\n- Category: ${website.category}\n- Total Paid: ${formattedPrice}\n- Payment Reference: ${order.paymentReference}\n- Date: ${dateStr}\n\nYour source package is ready for instant download in your User Dashboard under "My Purchases".\n\nThank you for choosing SUREST PLUG!`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SUREST PLUG</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order & Website Delivery Confirmation</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; margin-top: 0;">Hi <strong>${toName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5; color: #475569;">
            Your purchase of <strong>${website.title}</strong> has been successfully processed! Below are your order receipt details and immediate access guidelines.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px;">Order Details</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Order Number:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Website Title:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0284c7;">${website.title}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Category:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600;">${website.category}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Price Paid:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #16a34a; font-size: 15px;">${formattedPrice}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Payment Ref:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 12px;">${order.paymentReference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Date:</td>
                <td style="padding: 6px 0; text-align: right; color: #64748b;">${dateStr}</td>
              </tr>
            </table>
          </div>

          ${delivery?.adminEmail || delivery?.adminPassword ? `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; margin-bottom: 8px;">🔑 Admin Credentials Included</div>
              <p style="font-size: 12px; color: #15803d; margin: 0 0 8px 0;">Default login credentials are prepared for your deployment:</p>
              <div style="font-size: 12px; font-family: monospace; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #dcfce7;">
                ${delivery.adminPanelUrl ? `<div><strong>Admin URL:</strong> ${delivery.adminPanelUrl}</div>` : ''}
                ${delivery.adminEmail ? `<div><strong>Admin Email:</strong> ${delivery.adminEmail}</div>` : ''}
                ${delivery.adminPassword ? `<div><strong>Admin Password:</strong> ${delivery.adminPassword}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="${website.fileUrl || '#'}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);">
              Access & Download Source Code
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
            Need assistance or custom installation? Contact our live support team on WhatsApp anytime at <a href="https://wa.link/l8ef6x" style="color: #0284c7;">wa.link/l8ef6x</a>.
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          SUREST PLUG Marketplace • Ready-To-Launch Digital Assets & Website Scripts
        </div>
      </div>
    `;

    const mockEmail: MockEmail = {
      id,
      userId,
      toEmail,
      toName,
      from: 'SUREST PLUG <billing@surestplug.com>',
      subject,
      htmlBody,
      textBody,
      orderId: order.id,
      websiteId: website.id,
      websiteTitle: website.title,
      amount: website.price,
      createdAt: new Date().toISOString(),
      read: false
    };

    this.mockEmailsMap.set(id, mockEmail);
    try {
      await adminDb.collection('mockEmails').doc(id).set(mockEmail);
    } catch (e) {
      // ignore
    }

    console.log(`\n================ MOCK EMAIL NOTIFICATION DISPATCHED ================`);
    console.log(`TO: ${toName} <${toEmail}>`);
    console.log(`FROM: billing@surestplug.com`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`ORDER ID: ${order.id} | AMOUNT: ${formattedPrice}`);
    console.log(`===================================================================\n`);

    return mockEmail;
  }

  // --- Deposit Flow ---
  public async submitDeposit(userId: string, amount: number, paymentMethod: string, reference: string, proofNote?: string) {
    let userData = this.usersMap.get(userId);

    if (!userData) {
      try {
        const userSnap = await adminDb.collection('users').doc(userId).get();
        if (userSnap.exists) {
          userData = { id: userId, ...userSnap.data() } as any;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!userData) {
      userData = {
        id: userId,
        name: 'User',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        balance: 0,
        profileImage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    if (amount <= 0) throw new Error('Deposit amount must be greater than ₦0');

    const depositId = 'DEP-' + Math.floor(1000 + Math.random() * 9000);
    const newDeposit: Deposit = {
      id: depositId,
      userId,
      userName: userData.name || userData.fullName || 'User',
      userEmail: userData.email,
      amount,
      paymentMethod: paymentMethod || 'Manual Bank Funding',
      reference: reference || 'REF-' + Date.now(),
      proofNote,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.depositsMap.set(depositId, newDeposit);
    try {
      await adminDb.collection('deposits').doc(depositId).set(newDeposit);
    } catch (e) {
      // ignore
    }

    this.addNotification({
      userId,
      title: 'Deposit Request Submitted',
      message: `Your deposit request of ₦${amount.toLocaleString()} (${paymentMethod}) has been received and is pending admin verification.`,
      type: 'info'
    });

    return newDeposit;
  }

  public async approveDeposit(depositId: string, adminNote?: string) {
    let deposit = this.depositsMap.get(depositId);
    if (!deposit) {
      try {
        const snap = await adminDb.collection('deposits').doc(depositId).get();
        if (snap.exists) {
          deposit = { ...snap.data(), id: depositId } as Deposit;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!deposit) throw new Error('Deposit record not found');

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is already ${deposit.status}`);
    }

    const note = adminNote || 'Approved by Admin';
    const updatedDeposit = { ...deposit, status: 'approved' as const, adminNote: note };
    this.depositsMap.set(depositId, updatedDeposit);

    try {
      await adminDb.collection('deposits').doc(depositId).update({
        status: 'approved',
        adminNote: note
      });
    } catch (e) {
      // ignore
    }

    const { balance } = await this.updateBalance(
      deposit.userId,
      deposit.amount,
      `Deposit Approved (${deposit.paymentMethod} - Ref: ${deposit.reference})`,
      'deposit',
      deposit.id
    );

    this.addNotification({
      userId: deposit.userId,
      title: 'Deposit Approved! 🎉',
      message: `Your deposit of ₦${deposit.amount.toLocaleString()} has been verified and credited to your balance. Your new balance is ₦${balance.toLocaleString()}.`,
      type: 'success'
    });

    return updatedDeposit;
  }

  public async rejectDeposit(depositId: string, adminNote?: string) {
    let deposit = this.depositsMap.get(depositId);
    if (!deposit) {
      try {
        const snap = await adminDb.collection('deposits').doc(depositId).get();
        if (snap.exists) {
          deposit = { ...snap.data(), id: depositId } as Deposit;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!deposit) throw new Error('Deposit record not found');

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is already ${deposit.status}`);
    }

    const note = adminNote || 'Rejected by Admin';
    const updatedDeposit = { ...deposit, status: 'rejected' as const, adminNote: note };
    this.depositsMap.set(depositId, updatedDeposit);

    try {
      await adminDb.collection('deposits').doc(depositId).update({
        status: 'rejected',
        adminNote: note
      });
    } catch (e) {
      // ignore
    }

    this.addNotification({
      userId: deposit.userId,
      title: 'Deposit Rejected',
      message: `Your deposit request of ₦${deposit.amount.toLocaleString()} was not approved. Reason: ${note}`,
      type: 'warning'
    });

    return updatedDeposit;
  }

  // --- Categories ---
  public async addCategory(name: string, description: string) {
    const id = 'cat-' + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id,
      name,
      slug,
      description,
      status: 'active'
    };

    this.categoriesMap.set(id, newCat);
    try {
      await adminDb.collection('categories').doc(id).set(newCat);
    } catch (e) {
      // ignore
    }
    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<Category>) {
    let existing = this.categoriesMap.get(id);
    const newUpdates: any = { ...updates };
    if (updates.name) {
      newUpdates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    if (existing) {
      existing = { ...existing, ...newUpdates };
      this.categoriesMap.set(id, existing);
    }

    try {
      const catRef = adminDb.collection('categories').doc(id);
      await catRef.update(newUpdates);
    } catch (e) {
      // ignore
    }

    return this.categoriesMap.get(id) || null;
  }

  public async deleteCategory(id: string) {
    this.categoriesMap.delete(id);
    try {
      await adminDb.collection('categories').doc(id).delete();
    } catch (e) {
      // ignore
    }
    return true;
  }

  // --- Support Tickets ---
  public async createTicket(userId: string, subject: string, category: string, priority: TicketPriority, initialMessage: string) {
    let userData = this.usersMap.get(userId);
    if (!userData) {
      try {
        const userSnap = await adminDb.collection('users').doc(userId).get();
        if (userSnap.exists) {
          userData = { id: userId, ...userSnap.data() } as any;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!userData) {
      userData = {
        id: userId,
        name: 'User',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        balance: 0,
        profileImage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const ticketId = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const newTicket: SupportTicket = {
      id: ticketId,
      userId,
      userName: userData.name || userData.fullName || 'User',
      userEmail: userData.email,
      subject,
      category,
      priority,
      status: 'open',
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderId: userId,
          senderName: userData.name || userData.fullName || 'User',
          isAdmin: false,
          message: initialMessage,
          createdAt: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.ticketsMap.set(ticketId, newTicket);
    try {
      await adminDb.collection('supportTickets').doc(ticketId).set(newTicket);
    } catch (e) {
      // ignore
    }

    return newTicket;
  }

  public async replyTicket(ticketId: string, senderId: string, senderName: string, isAdmin: boolean, message: string) {
    let ticket = this.ticketsMap.get(ticketId);

    if (!ticket) {
      try {
        const snap = await adminDb.collection('supportTickets').doc(ticketId).get();
        if (snap.exists) {
          ticket = { ...snap.data(), id: ticketId } as SupportTicket;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!ticket) throw new Error('Ticket not found');

    const now = new Date().toISOString();
    const newMsg = {
      id: 'msg-' + Date.now(),
      senderId,
      senderName,
      isAdmin,
      message,
      createdAt: now
    };

    const messages = [...(ticket.messages || []), newMsg];
    let newStatus = ticket.status;
    if (isAdmin && ticket.status === 'open') {
      newStatus = 'in_progress';
    }

    const updated = { ...ticket, messages, status: newStatus, updatedAt: now };
    this.ticketsMap.set(ticketId, updated);

    try {
      await adminDb.collection('supportTickets').doc(ticketId).update({
        messages,
        status: newStatus,
        updatedAt: now
      });
    } catch (e) {
      // ignore
    }

    if (isAdmin) {
      this.addNotification({
        userId: ticket.userId,
        title: 'New Reply on Support Ticket',
        message: `Admin replied to your support ticket "${ticket.subject}".`,
        type: 'info'
      });
    }

    return updated;
  }

  public async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const existing = this.ticketsMap.get(ticketId);
    const now = new Date().toISOString();
    if (existing) {
      const updated = { ...existing, status, updatedAt: now };
      this.ticketsMap.set(ticketId, updated);
    }
    try {
      const tckRef = adminDb.collection('supportTickets').doc(ticketId);
      await tckRef.update({ status, updatedAt: now });
    } catch (e) {
      // ignore
    }
    return this.ticketsMap.get(ticketId);
  }

  public async updateTicketPriority(ticketId: string, priority: TicketPriority) {
    const existing = this.ticketsMap.get(ticketId);
    const now = new Date().toISOString();
    if (existing) {
      const updated = { ...existing, priority, updatedAt: now };
      this.ticketsMap.set(ticketId, updated);
    }
    try {
      const tckRef = adminDb.collection('supportTickets').doc(ticketId);
      await tckRef.update({ priority, updatedAt: now });
    } catch (e) {
      // ignore
    }
    return this.ticketsMap.get(ticketId);
  }

  // --- Broadcasts ---
  public async createBroadcast(data: Omit<Broadcast, 'id' | 'createdAt' | 'sentAt' | 'recipientCount'>) {
    const id = 'BC-' + Date.now();
    const newBcast: Broadcast = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    this.broadcastsMap.set(id, newBcast);
    try {
      await adminDb.collection('broadcasts').doc(id).set(newBcast);
    } catch (e) {
      // ignore
    }
    return newBcast;
  }

  public async updateBroadcast(id: string, updates: Partial<Broadcast>) {
    const existing = this.broadcastsMap.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.broadcastsMap.set(id, updated);
    }
    try {
      const bcastRef = adminDb.collection('broadcasts').doc(id);
      await bcastRef.update(updates);
    } catch (e) {
      // ignore
    }
    return this.broadcastsMap.get(id);
  }

  public async sendBroadcast(id: string) {
    let bcast = this.broadcastsMap.get(id);
    if (!bcast) {
      try {
        const snap = await adminDb.collection('broadcasts').doc(id).get();
        if (snap.exists) {
          bcast = { ...snap.data(), id } as Broadcast;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!bcast) throw new Error('Broadcast record not found');

    let targetUsers = this.getUsers().filter(u => u.role !== 'admin');
    if (bcast.targetAudience === 'active') {
      targetUsers = targetUsers.filter(u => u.status === 'active');
    } else if (bcast.targetAudience === 'selected' && bcast.selectedUserIds?.length) {
      targetUsers = targetUsers.filter(u => bcast.selectedUserIds!.includes(u.id));
    }

    targetUsers.forEach(u => {
      this.addNotification({
        userId: u.id,
        title: bcast!.title,
        message: bcast!.message,
        type: 'info'
      });
    });

    const now = new Date().toISOString();
    const updated = { ...bcast, status: 'sent' as const, sentAt: now, recipientCount: targetUsers.length };
    this.broadcastsMap.set(id, updated);

    try {
      await adminDb.collection('broadcasts').doc(id).update({
        status: 'sent',
        sentAt: now,
        recipientCount: targetUsers.length
      });
    } catch (e) {
      // ignore
    }

    return { broadcast: updated, recipientCount: targetUsers.length };
  }

  public async deleteBroadcast(id: string) {
    this.broadcastsMap.delete(id);
    try {
      await adminDb.collection('broadcasts').doc(id).delete();
    } catch (e) {
      // ignore
    }
    return true;
  }

  public async updateSettings(updates: Partial<SiteSettings>) {
    const { logoUrl: _ignoredLogo, ...allowedUpdates } = updates;
    const newSettings = {
      ...this.settings,
      ...allowedUpdates,
      logoUrl: DEFAULT_LOGO,
      socialLinks: { ...this.settings.socialLinks, ...(updates.socialLinks || {}) },
      bankDetails: { ...this.settings.bankDetails, ...(updates.bankDetails || {}) }
    };
    this.settings = newSettings;
    try {
      const settingsRef = adminDb.collection('siteSettings').doc('general');
      await settingsRef.set(newSettings);
    } catch (e) {
      // ignore
    }
    return newSettings;
  }

  public getAdminStats() {
    const users = this.getUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalWebsites = this.getWebsites({ status: 'all' }).length;
    
    const completedOrders = this.getOrders().filter(o => o.orderStatus === 'completed');
    const totalSales = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);

    const pendingOrders = this.getOrders().filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
    const pendingDeposits = this.getDeposits().filter(d => d.status === 'pending').length;
    const openTickets = this.getTickets().filter(t => t.status === 'open' || t.status === 'in_progress').length;

    return {
      totalUsers,
      activeUsers,
      totalWebsites,
      totalSales,
      totalRevenue,
      pendingOrders,
      pendingDeposits,
      openTickets
    };
  }
}

export const db = new FirestoreDatabase();
