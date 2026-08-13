import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db, adminAuth, adminDb } from './src/server/db.js';

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

// Auth Middleware helpers
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    const userDoc = db.getUserById(decodedToken.uid);
    const userEmail = (decodedToken.email || userDoc?.email || '').trim().toLowerCase();
    const isAdmin = userEmail === 'chinonsochinix@gmail.com';
    const role = isAdmin ? 'admin' : 'user';

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || userDoc?.email || '',
      role
    };
    next();
  } catch (err: any) {
    res.status(403).json({ error: 'Invalid or expired authentication session' });
  }
}

async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  await authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access Denied: Admin authorization required' });
    }
  });
}

// --- PUBLIC AUTH API ROUTES ---

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  let user = db.getUserById(req.user!.id);
  if (!user) {
    user = {
      id: req.user!.id,
      name: req.user!.email ? req.user!.email.split('@')[0] : 'User',
      email: req.user!.email || '',
      phone: '',
      role: req.user!.role || 'user',
      status: 'active',
      balance: 0,
      profileImage: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.upsertUser(user);
  }
  res.json({ user });
});

app.post('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, profileImage } = req.body;
    const userId = req.user!.id;

    try {
      await db.updateBalance(userId, 0, 'Profile update', 'credit', 'PROF-' + Date.now());
    } catch (e) {
      // ignore
    }

    try {
      await adminDb.collection('users').doc(userId).update({
        fullName,
        name: fullName,
        phone,
        profileImage,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      // ignore
    }

    let existing = db.getUserById(userId);
    if (!existing) {
      existing = {
        id: userId,
        name: fullName || req.user!.email.split('@')[0] || 'User',
        email: req.user!.email || '',
        phone: phone || '',
        role: req.user!.role || 'user',
        status: 'active',
        balance: 0,
        profileImage: profileImage || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      existing = {
        ...existing,
        name: fullName || existing.name,
        phone: phone !== undefined ? phone : existing.phone,
        profileImage: profileImage !== undefined ? profileImage : existing.profileImage,
        updatedAt: new Date().toISOString()
      };
    }
    db.upsertUser(existing);

    res.json({ user: existing });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

// --- MARKETPLACE & PUBLIC DATA ---

app.get('/api/websites', (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, featured, sort, status } = req.query;
  const filter: any = {};

  if (category) filter.category = String(category);
  if (search) filter.search = String(search);
  if (minPrice) filter.minPrice = parseFloat(String(minPrice));
  if (maxPrice) filter.maxPrice = parseFloat(String(maxPrice));
  if (featured === 'true') filter.featured = true;
  if (status) filter.status = String(status);
  if (sort) filter.sort = String(sort);

  const websites = db.getWebsites(filter);
  res.json({ websites });
});

app.get('/api/websites/:id', (req: Request, res: Response) => {
  const website = db.getWebsiteById(req.params.id);
  if (!website) {
    res.status(404).json({ error: 'Website listing not found' });
    return;
  }
  res.json({ website });
});

app.get('/api/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json({ categories });
});

app.get('/api/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// --- PROTECTED USER ACTIONS ---

app.post('/api/marketplace/purchase', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { websiteId } = req.body;
    if (!websiteId) {
      res.status(400).json({ error: 'Website ID is required' });
      return;
    }

    const result = await db.purchaseWebsite(req.user!.id, websiteId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Purchase failed' });
  }
});

app.get('/api/user/purchases', authenticateToken, (req: AuthRequest, res: Response) => {
  const orders = db.getOrders(req.user!.id).filter(o => o.orderStatus === 'completed' || o.paymentStatus === 'verified');
  const purchasedWebsites = orders.map(order => {
    const website = db.getWebsiteById(order.websiteId);
    return {
      order,
      website
    };
  });
  res.json({ purchases: purchasedWebsites });
});

app.get('/api/user/purchases/:websiteId/delivery', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const websiteId = req.params.websiteId;

  const hasPurchased = db.userHasPurchasedWebsite(userId, websiteId);
  if (!hasPurchased) {
    res.status(403).json({ error: 'Access denied. You have not purchased this website.' });
    return;
  }

  const website = db.getWebsiteById(websiteId);
  const delivery = db.getWebsiteDelivery(websiteId);

  res.json({ website, delivery });
});

app.get('/api/user/purchases/:websiteId/download', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const websiteId = req.params.websiteId;

  const hasPurchased = db.userHasPurchasedWebsite(userId, websiteId);

  if (!hasPurchased) {
    res.status(403).json({ error: 'You do not own this website listing. Purchase required before download.' });
    return;
  }

  const website = db.getWebsiteById(websiteId);
  const delivery = db.getWebsiteDelivery(websiteId);

  const downloadFileUrl = delivery?.downloadFileUrl || website?.fileUrl;

  if (!downloadFileUrl) {
    res.status(400).json({ error: 'No downloadable source package file was uploaded for this website listing.' });
    return;
  }

  const fileName = delivery?.packageFileName || website?.packageFileName || `${website?.slug || 'website'}-source-code.zip`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.json({
    status: 'success',
    fileName,
    websiteTitle: website?.title,
    downloadUrl: downloadFileUrl,
    instructions: delivery?.instructions || 'Extract ZIP file and check INSTALL.md to configure your domain and environment settings.',
  });
});

app.get('/api/user/balance', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.getUserById(req.user!.id);
  res.json({ balance: user ? user.balance : 0 });
});

app.post('/api/user/deposit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethod, reference, proofNote } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid deposit amount required' });
      return;
    }

    const deposit = await db.submitDeposit(req.user!.id, parseFloat(amount), paymentMethod, reference, proofNote);
    res.json({ deposit, message: 'Deposit request submitted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit submission failed' });
  }
});

app.get('/api/user/transactions', authenticateToken, (req: AuthRequest, res: Response) => {
  const transactions = db.getTransactions(req.user!.id);
  res.json({ transactions });
});

app.get('/api/user/deposits', authenticateToken, (req: AuthRequest, res: Response) => {
  const deposits = db.getDeposits(req.user!.id);
  res.json({ deposits });
});

app.get('/api/user/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const orders = db.getOrders(req.user!.id);
  res.json({ orders });
});

app.get('/api/user/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifications = db.getNotifications(req.user!.id);
  res.json({ notifications });
});

app.post('/api/user/notifications/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  await db.markNotificationsRead(req.user!.id);
  res.json({ status: 'ok' });
});

app.get('/api/user/emails', authenticateToken, (req: AuthRequest, res: Response) => {
  const emails = db.getMockEmails(req.user!.id);
  res.json({ emails });
});

app.post('/api/user/emails/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  await db.markMockEmailRead(req.params.id);
  res.json({ status: 'ok' });
});

app.get('/api/user/tickets', authenticateToken, (req: AuthRequest, res: Response) => {
  const tickets = db.getTickets(req.user!.id);
  res.json({ tickets });
});

app.post('/api/user/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    const ticket = await db.createTicket(req.user!.id, subject, category || 'General', priority || 'medium', message);
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create ticket' });
  }
});

app.post('/api/user/tickets/:id/reply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const user = db.getUserById(req.user!.id);
    if (!message || !user) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const ticket = await db.replyTicket(req.params.id, user.id, user.name, user.role === 'admin', message);
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send reply' });
  }
});

// --- ADMIN PANEL API ENDPOINTS ---

app.get('/api/admin/stats', requireAdmin, (req: AuthRequest, res: Response) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

app.get('/api/admin/users', requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

app.post('/api/admin/users/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Invalid user status' });
    return;
  }
  const success = await db.setUserStatus(req.params.id, status);
  res.json({ success });
});

app.post('/api/admin/users/:id/reset-password', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  try {
    await adminAuth.updateUser(req.params.id, { password: newPassword });
    res.json({ message: 'User password reset successfully in Firebase Auth.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Password reset failed' });
  }
});

app.post('/api/admin/users/:id/balance', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, description } = req.body;
    if (isNaN(amount) || amount <= 0 || !type || !description) {
      res.status(400).json({ error: 'Amount, valid type (credit/debit), and mandatory description required' });
      return;
    }

    const change = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
    const result = await db.updateBalance(
      req.params.id,
      change,
      `Admin Adjustment: ${description}`,
      type === 'credit' ? 'credit' : 'debit',
      'ADM-ADJ-' + Date.now()
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Balance adjustment failed' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) {
    res.status(400).json({ error: 'You cannot delete your own admin account' });
    return;
  }
  const success = await db.deleteUser(req.params.id);
  res.json({ success });
});

// Admin Websites
app.get('/api/admin/websites', requireAdmin, (req: AuthRequest, res: Response) => {
  const websites = db.getWebsites({ status: 'all' as any });
  res.json({ websites });
});

app.get('/api/admin/websites/:id/delivery', requireAdmin, (req: AuthRequest, res: Response) => {
  const delivery = db.getWebsiteDelivery(req.params.id);
  res.json({ delivery });
});

app.post('/api/admin/websites', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deliveryData = req.body.delivery || {
      loginUrl: req.body.loginUrl,
      adminPanelUrl: req.body.adminPanelUrl,
      adminEmail: req.body.adminEmail,
      adminPassword: req.body.adminPassword,
      instructions: req.body.instructions,
      downloadFileUrl: req.body.downloadFileUrl,
      packageFileName: req.body.packageFileName
    };
    const newWeb = await db.addWebsite(req.body, deliveryData);
    const newDelivery = db.getWebsiteDelivery(newWeb.id);
    res.json({ website: newWeb, delivery: newDelivery });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create website' });
  }
});

app.put('/api/admin/websites/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deliveryData = req.body.delivery || {
      loginUrl: req.body.loginUrl,
      adminPanelUrl: req.body.adminPanelUrl,
      adminEmail: req.body.adminEmail,
      adminPassword: req.body.adminPassword,
      instructions: req.body.instructions,
      downloadFileUrl: req.body.downloadFileUrl,
      packageFileName: req.body.packageFileName
    };
    const updated = await db.updateWebsite(req.params.id, req.body, deliveryData);
    if (!updated) {
      res.status(404).json({ error: 'Website listing not found' });
      return;
    }
    const updatedDelivery = db.getWebsiteDelivery(req.params.id);
    res.json({ website: updated, delivery: updatedDelivery });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update website' });
  }
});

app.delete('/api/admin/websites/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const success = await db.deleteWebsite(req.params.id);
  res.json({ success });
});

// Admin Orders & Deposits
app.get('/api/admin/orders', requireAdmin, (req: AuthRequest, res: Response) => {
  const orders = db.getOrders();
  res.json({ orders });
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    if (!orderStatus) {
      res.status(400).json({ error: 'orderStatus is required' });
      return;
    }
    const updatedOrder = await db.updateOrderStatus(req.params.id, orderStatus, paymentStatus);
    res.json({ order: updatedOrder });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
});

app.post('/api/admin/orders/:id/refund', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    const refundedOrder = await db.refundOrder(req.params.id, adminNote);
    res.json({ order: refundedOrder, message: 'Order refunded successfully and balance credited to user.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Refund failed' });
  }
});

app.get('/api/admin/deposits', requireAdmin, (req: AuthRequest, res: Response) => {
  const deposits = db.getDeposits();
  res.json({ deposits });
});

app.post('/api/admin/deposits/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    const deposit = await db.approveDeposit(req.params.id, adminNote);
    res.json({ deposit, message: 'Deposit approved and balance credited' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit approval failed' });
  }
});

app.post('/api/admin/deposits/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    const deposit = await db.rejectDeposit(req.params.id, adminNote);
    res.json({ deposit, message: 'Deposit rejected' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Deposit rejection failed' });
  }
});

app.get('/api/admin/transactions', requireAdmin, (req: AuthRequest, res: Response) => {
  const transactions = db.getTransactions();
  res.json({ transactions });
});

// Admin Categories
app.post('/api/admin/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  const cat = await db.addCategory(name, description || '');
  res.json({ category: cat });
});

app.put('/api/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const cat = await db.updateCategory(req.params.id, req.body);
    res.json({ category: cat });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Update category failed' });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const success = await db.deleteCategory(req.params.id);
  res.json({ success });
});

// Admin Support & Notifications
app.get('/api/admin/tickets', requireAdmin, (req: AuthRequest, res: Response) => {
  const tickets = db.getTickets();
  res.json({ tickets });
});

app.post('/api/admin/tickets/:id/reply', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const adminUser = db.getUserById(req.user!.id);
    if (!message || !adminUser) {
      res.status(400).json({ error: 'Reply message required' });
      return;
    }

    const ticket = await db.replyTicket(req.params.id, adminUser.id, adminUser.name, true, message);
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Reply failed' });
  }
});

app.put('/api/admin/tickets/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const ticket = await db.updateTicketStatus(req.params.id, status);
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Status update failed' });
  }
});

app.put('/api/admin/tickets/:id/priority', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { priority } = req.body;
    const ticket = await db.updateTicketPriority(req.params.id, priority);
    res.json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Priority update failed' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  const updatedSettings = await db.updateSettings(req.body);
  res.json({ settings: updatedSettings });
});

// Admin Broadcasts
app.get('/api/admin/broadcasts', requireAdmin, (req: AuthRequest, res: Response) => {
  const broadcasts = db.getBroadcasts();
  res.json({ broadcasts });
});

app.post('/api/admin/broadcasts', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, targetAudience, selectedUserIds, priority, status } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }

    const broadcast = await db.createBroadcast({
      title: title.trim(),
      message: message.trim(),
      targetAudience: targetAudience || 'all',
      selectedUserIds: selectedUserIds || [],
      priority: priority || 'normal',
      status: status || 'draft'
    });

    if (status === 'sent') {
      const sendRes = await db.sendBroadcast(broadcast.id);
      res.json({ broadcast: sendRes.broadcast, message: `Broadcast sent to ${sendRes.recipientCount} users.` });
      return;
    }

    res.json({ broadcast, message: 'Broadcast created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create broadcast' });
  }
});

app.put('/api/admin/broadcasts/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.updateBroadcast(req.params.id, req.body);
    res.json({ broadcast: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update broadcast' });
  }
});

app.post('/api/admin/broadcasts/:id/send', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.sendBroadcast(req.params.id);
    res.json({ broadcast: result.broadcast, message: `Broadcast notification sent to ${result.recipientCount} users` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send broadcast' });
  }
});

app.delete('/api/admin/broadcasts/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const success = await db.deleteBroadcast(req.params.id);
  res.json({ success });
});

app.post('/api/admin/broadcast', requireAdmin, (req: AuthRequest, res: Response) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'Title and message required' });
    return;
  }

  const users = db.getUsers();
  users.forEach(u => {
    db.addNotification({
      userId: u.id,
      title,
      message,
      type: type || 'info'
    });
  });

  res.json({ message: `Broadcast notification sent to ${users.length} users` });
});

// --- BOOTSTRAP FIREBASE ACCOUNTS ---
async function bootstrapFirebaseAccounts() {
  try {
    // 1. Existing authorized administrator account
    const adminRecord = await adminAuth.getUserByEmail('chinonsochinix@gmail.com');

    await adminAuth.setCustomUserClaims(adminRecord.uid, { admin: true });

    const adminRef = adminDb.collection('users').doc(adminRecord.uid);
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      await adminRef.set({
        uid: adminRecord.uid,
        fullName: adminRecord.displayName || 'Super Admin',
        name: adminRecord.displayName || 'Super Admin',
        email: 'chinonsochinix@gmail.com',
        phone: '',
        role: 'admin',
        status: 'active',
        balance: 1000,
        profileImage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      await adminRef.set({
        uid: adminRecord.uid,
        email: 'chinonsochinix@gmail.com',
        role: 'admin',
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 2. Demo User account
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail('user@surestplug.com');
    } catch (e) {
      userRecord = await adminAuth.createUser({
        email: 'user@surestplug.com',
        password: process.env.DEMO_USER_BOOTSTRAP_PASSWORD!,
        displayName: 'Demo Buyer'
      });
    }

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName: 'Demo Buyer',
      name: 'Demo Buyer',
      email: 'user@surestplug.com',
      phone: '',
      role: 'user',
      status: 'active',
      balance: 250,
      profileImage: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('Firebase bootstrap accounts synced successfully.');
  } catch (err) {
    console.error('Firebase account bootstrap error:', err);
  }
}

// --- VITE DEV / PRODUCTION INTEGRATION ---

async function startServer() {
  await bootstrapFirebaseAccounts();

  const publicPath = path.join(process.cwd(), 'public');
  const distPath = path.join(process.cwd(), 'dist');

  // Direct handlers for favicon routes to guarantee static asset delivery without SPA fallback
  app.get('/favicon.png', (req: Request, res: Response) => {
    const distFav = path.join(distPath, 'favicon.png');
    const pubFav = path.join(publicPath, 'favicon.png');
    if (fs.existsSync(distFav)) return res.type('image/png').sendFile(distFav);
    if (fs.existsSync(pubFav)) return res.type('image/png').sendFile(pubFav);
    res.status(404).send('Not found');
  });

  app.get('/favicon.ico', (req: Request, res: Response) => {
    const distIco = path.join(distPath, 'favicon.ico');
    const pubIco = path.join(publicPath, 'favicon.ico');
    if (fs.existsSync(distIco)) return res.type('image/x-icon').sendFile(distIco);
    if (fs.existsSync(pubIco)) return res.type('image/x-icon').sendFile(pubIco);
    res.status(404).send('Not found');
  });

  // Serve static assets from public and dist folders
  app.use(express.static(publicPath));
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.get('*', (req: Request, res: Response) => {
      if (req.path.match(/\.(png|ico|svg|jpg|jpeg|gif|css|js|json|woff|woff2)$/i)) {
        return res.status(404).send('Not found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SUREST PLUG Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
