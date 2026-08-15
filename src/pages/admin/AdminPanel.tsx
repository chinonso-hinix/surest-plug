import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import {
  getAdminUsers,
  getAdminWebsites,
  getAdminOrders,
  getAdminDeposits,
  getAdminTransactions,
  getAdminCategories,
  getAdminTickets,
  getAdminBroadcasts,
  calculateAdminStats
} from '../../api/adminFirestore';
import { LoadingGear } from '../../components/common/LoadingGear';
import {
  User,
  Website,
  Order,
  Transaction,
  Deposit,
  SupportTicket,
  Category,
  SiteSettings,
  Broadcast
} from '../../types';
import {
  LayoutDashboard,
  Users,
  Globe,
  ShoppingBag,
  History,
  Wallet,
  Headphones,
  Bell,
  Settings,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Lock,
  Send,
  PlusCircle,
  Menu,
  X,
  Building2,
  Eye,
  AlertCircle,
  RotateCcw,
  Clock,
  Check,
  MessageSquare,
  Sparkles,
  Inbox
} from 'lucide-react';

interface AdminPanelProps {
  initialTab?: string;
  onNavigatePage: (view: string, tab?: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab = 'dashboard', onNavigatePage }) => {
  const { user, settings, refreshSettings, logout } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const currency = settings?.currency || '₦';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onNavigatePage) {
      onNavigatePage('admin', tabId);
    }
  };

  // Admin Data State
  const [stats, setStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminWebsites, setAdminWebsites] = useState<Website[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminDeposits, setAdminDeposits] = useState<Deposit[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminTickets, setAdminTickets] = useState<SupportTicket[]>([]);
  const [adminBroadcasts, setAdminBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Users Filters & Modals
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjDesc, setAdjDesc] = useState<string>('');
  const [adjSubmitting, setAdjSubmitting] = useState<boolean>(false);
  const [resetPassModalUser, setResetPassModalUser] = useState<User | null>(null);
  const [resetPassInput, setResetPassInput] = useState<string>('');

  // Websites Add/Edit Modal State
  const [webModalOpen, setWebModalOpen] = useState<boolean>(false);
  const [editingWeb, setEditingWeb] = useState<Website | null>(null);
  const [webTitle, setWebTitle] = useState<string>('');
  const [webCategory, setWebCategory] = useState<string>('SMM');
  const [webPrice, setWebPrice] = useState<string>('149');
  const [webDesc, setWebDesc] = useState<string>('');
  const [webPreviewImg, setWebPreviewImg] = useState<string>('');
  const [webDemoUrl, setWebDemoUrl] = useState<string>('');
  const [webTechs, setWebTechs] = useState<string>('React 19, Node.js, Express, Tailwind CSS');
  const [webFeatures, setWebFeatures] = useState<string>('Automated API Processing, Dark Mode, Multi-currency');
  const [webFeatured, setWebFeatured] = useState<boolean>(false);
  const [webStatus, setWebStatus] = useState<'published' | 'unpublished' | 'sold'>('published');

  // Website Delivery State
  const [webLoginUrl, setWebLoginUrl] = useState<string>('');
  const [webAdminPanelUrl, setWebAdminPanelUrl] = useState<string>('');
  const [webAdminEmail, setWebAdminEmail] = useState<string>('');
  const [webAdminPassword, setWebAdminPassword] = useState<string>('');
  const [webInstructions, setWebInstructions] = useState<string>('');
  const [webDownloadFileUrl, setWebDownloadFileUrl] = useState<string>('');
  const [webPackageFileName, setWebPackageFileName] = useState<string>('');

  // Orders Management State
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundNote, setRefundNote] = useState<string>('');

  // Transactions Ledger State
  const [transactionSearch, setTransactionSearch] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');

  // Categories Management State
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catEditModalOpen, setCatEditModalOpen] = useState<boolean>(false);
  const [catEditName, setCatEditName] = useState<string>('');
  const [catEditDesc, setCatEditDesc] = useState<string>('');

  // Tickets Management State
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>('all');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'active' | 'selected'>('all');
  const [broadcastPriority, setBroadcastPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [selectedUserIdsForBroadcast, setSelectedUserIdsForBroadcast] = useState<string[]>([]);

  // Site Settings Form State
  const [siteName, setSiteName] = useState<string>(settings?.siteName || 'SUREST PLUG');
  const [contactEmail, setContactEmail] = useState<string>(settings?.contactEmail || 'suresstplug@gmail.com');
  const [contactPhone, setContactPhone] = useState<string>(settings?.contactPhone || '08141853557');
  const [bankName, setBankName] = useState<string>(settings?.bankDetails?.bankName || 'Opay Bank');
  const [bankAccNum, setBankAccNum] = useState<string>(settings?.bankDetails?.accountNumber || '8141853557');
  const [bankAccName, setBankAccName] = useState<string>(settings?.bankDetails?.accountName || 'chinonso monday');
  const [bankInstructions, setBankInstructions] = useState<string>(settings?.bankDetails?.instructions || 'Please transfer your deposit amount to the Opay Bank account above. Include your account email as the transaction reference or upload reference details below.');

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || 'SUREST PLUG');
      setContactEmail(settings.contactEmail || 'suresstplug@gmail.com');
      setContactPhone(settings.contactPhone || '08141853557');
      setBankName(settings.bankDetails?.bankName || 'Opay Bank');
      setBankAccNum(settings.bankDetails?.accountNumber || '8141853557');
      setBankAccName(settings.bankDetails?.accountName || 'chinonso monday');
      setBankInstructions(settings.bankDetails?.instructions || 'Please transfer your deposit amount to the Opay Bank account above. Include your account email as the transaction reference or upload reference details below.');
    }
  }, [settings]);

  const fetchAdminData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const [
        users,
        websites,
        orders,
        deposits,
        transactions,
        categories,
        tickets,
        broadcasts
      ] = await Promise.all([
        getAdminUsers(),
        getAdminWebsites(),
        getAdminOrders(),
        getAdminDeposits(),
        getAdminTransactions(),
        getAdminCategories(),
        getAdminTickets(),
        getAdminBroadcasts()
      ]);

      const calculatedStats = calculateAdminStats(
        users,
        websites,
        orders,
        deposits,
        tickets
      );

      setStats(calculatedStats);
      setAdminUsers(users);
      setAdminWebsites(websites);
      setAdminOrders(orders);
      setAdminDeposits(deposits);
      setAdminTransactions(transactions);
      setAdminCategories(categories);
      setAdminTickets(tickets);
      setAdminBroadcasts(broadcasts);
    } catch (err: any) {
      console.error('Error fetching admin data directly from Firebase:', err);

      setFetchError(
        err?.message ||
        'Failed to load admin panel data from Firebase.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isAuthorizedAdmin = user?.role === 'admin' && user?.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com';

  useEffect(() => {
    if (isAuthorizedAdmin) {
      fetchAdminData();
    }
  }, [activeTab, isAuthorizedAdmin]);

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md shadow-xl">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Admin Access Denied</h2>
          <p className="text-sm text-slate-600">
            Only the administrator account (<strong className="text-slate-900">chinonsochinix@gmail.com</strong>) is authorized to access the SUREST PLUG Admin Console.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => onNavigatePage('dashboard', 'overview')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 cursor-pointer"
              >
                Return to User Dashboard
              </button>
            ) : (
              <button
                onClick={() => onNavigatePage('login')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 cursor-pointer"
              >
                Go to Login Page
              </button>
            )}
            <button
              onClick={() => onNavigatePage('home')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleToggleUserStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await api.setUserStatus(targetUser.id, nextStatus);
      showSuccess(`User status updated to ${nextStatus}`, 'User Updated');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Action failed', 'Admin Error');
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.deleteUser(targetUserId);
      showSuccess('User account deleted successfully', 'User Deleted');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Delete failed', 'Delete Error');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const numAmt = parseFloat(adjAmount);
    if (isNaN(numAmt) || numAmt <= 0 || !adjDesc.trim()) {
      showWarning('Please enter a valid amount and mandatory description.', 'Invalid Inputs');
      return;
    }

    setAdjSubmitting(true);
    try {
      await api.adjustUserBalance(selectedUser.id, {
        amount: numAmt,
        type: adjType,
        description: adjDesc.trim()
      });
      showSuccess(`Balance adjusted for ${selectedUser.name}`, 'Balance Adjusted');
      setSelectedUser(null);
      setAdjAmount('');
      setAdjDesc('');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Balance adjustment failed', 'Adjustment Error');
    } finally {
      setAdjSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModalUser || !resetPassInput.trim()) return;

    try {
      await api.resetUserPassword(resetPassModalUser.id, resetPassInput.trim());
      showSuccess(`Password reset successfully for ${resetPassModalUser.name}`, 'Password Reset');
      setResetPassModalUser(null);
      setResetPassInput('');
    } catch (err: any) {
      showError(err.message || 'Password reset failed', 'Reset Error');
    }
  };

  const handleOpenWebModal = async (web?: Website) => {
    if (web) {
      setEditingWeb(web);
      setWebTitle(web.title);
      setWebCategory(web.category);
      setWebPrice(web.price.toString());
      setWebDesc(web.description);
      setWebPreviewImg(web.previewImage);
      setWebDemoUrl(web.demoUrl || '');
      setWebTechs(web.technologies?.join(', ') || 'React 19, Node.js, Express');
      setWebFeatures(web.features?.join(', ') || 'Automated Processing, Responsive');
      setWebFeatured(web.featured || false);
      setWebStatus(web.status || 'published');
      setWebLoginUrl('');
      setWebAdminPanelUrl('');
      setWebAdminEmail('');
      setWebAdminPassword('');
      setWebInstructions('');
      setWebDownloadFileUrl(web.fileUrl || '');
      setWebPackageFileName(web.packageFileName || '');

      try {
        const res = await api.getAdminWebsiteDelivery(web.id);
        if (res.delivery) {
          setWebLoginUrl(res.delivery.loginUrl || '');
          setWebAdminPanelUrl(res.delivery.adminPanelUrl || '');
          setWebAdminEmail(res.delivery.adminEmail || '');
          setWebAdminPassword(res.delivery.adminPassword || '');
          setWebInstructions(res.delivery.instructions || '');
          setWebDownloadFileUrl(res.delivery.downloadFileUrl || web.fileUrl || '');
          setWebPackageFileName(res.delivery.packageFileName || web.packageFileName || '');
        }
      } catch (err) {
        console.warn('Could not fetch existing website delivery info:', err);
      }
    } else {
      setEditingWeb(null);
      setWebTitle('');
      setWebCategory(adminCategories[0]?.name || 'SMM');
      setWebPrice('149');
      setWebDesc('');
      setWebPreviewImg('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop');
      setWebDemoUrl('https://demo.surestplug.com');
      setWebTechs('React 19, Node.js, Express, Tailwind CSS');
      setWebFeatures('Automated API Processing, Dark Mode, Multi-currency');
      setWebFeatured(false);
      setWebStatus('published');
      setWebLoginUrl('');
      setWebAdminPanelUrl('');
      setWebAdminEmail('');
      setWebAdminPassword('');
      setWebInstructions('');
      setWebDownloadFileUrl('');
      setWebPackageFileName('');
    }
    setWebModalOpen(true);
  };

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: webTitle.trim(),
      category: webCategory,
      price: parseFloat(webPrice),
      description: webDesc.trim(),
      previewImage: webPreviewImg.trim(),
      demoUrl: webDemoUrl.trim(),
      technologies: webTechs.split(',').map(s => s.trim()).filter(Boolean),
      features: webFeatures.split(',').map(s => s.trim()).filter(Boolean),
      featured: webFeatured,
      status: webStatus,
      delivery: {
        loginUrl: webLoginUrl.trim(),
        adminPanelUrl: webAdminPanelUrl.trim(),
        adminEmail: webAdminEmail.trim(),
        adminPassword: webAdminPassword.trim(),
        instructions: webInstructions.trim(),
        downloadFileUrl: webDownloadFileUrl.trim(),
        packageFileName: webPackageFileName.trim()
      }
    };

    try {
      if (editingWeb) {
        await api.updateWebsite(editingWeb.id, payload);
        showSuccess('Website listing updated successfully', 'Website Saved');
      } else {
        await api.createWebsite(payload);
        showSuccess('New website listing created successfully', 'Website Published');
      }
      setWebModalOpen(false);
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to save website', 'Save Error');
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website listing? Historical order records will remain intact.')) return;
    try {
      await api.deleteWebsite(id);
      showSuccess('Website listing removed', 'Website Deleted');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Delete failed', 'Delete Error');
    }
  };

  const handleApproveDeposit = async (id: string) => {
    const note = prompt('Optional Admin Approval Note (visible to user):', 'Approved manually by Admin.');
    try {
      const res = await api.approveDeposit(id, note || undefined);
      showSuccess(res.message || 'Deposit approved successfully', 'Deposit Approved');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Approval failed', 'Approval Error');
    }
  };

  const handleRejectDeposit = async (id: string) => {
    const note = prompt('Reason for rejection (mandatory):', 'Proof of payment unverified.');
    if (!note) return;
    try {
      const res = await api.rejectDeposit(id, note);
      showSuccess(res.message || 'Deposit rejected', 'Deposit Rejected');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Rejection failed', 'Rejection Error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      await api.updateOrderStatus(orderId, orderStatus, paymentStatus);
      showSuccess('Order status updated', 'Order Updated');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update order status', 'Order Error');
    }
  };

  const handleRefundOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;
    try {
      const res = await api.refundOrder(refundModalOrder.id, refundNote);
      showSuccess(res.message || 'Order refunded successfully', 'Order Refunded');
      setRefundModalOrder(null);
      setRefundNote('');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Refund failed', 'Refund Error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      showSuccess(`Category "${newCatName.trim()}" created`, 'Category Created');
      setNewCatName('');
      setNewCatDesc('');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to create category', 'Category Error');
    }
  };

  const handleOpenCatEditModal = (cat: Category) => {
    setEditingCat(cat);
    setCatEditName(cat.name);
    setCatEditDesc(cat.description || '');
    setCatEditModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    try {
      await api.updateCategory(editingCat.id, { name: catEditName, description: catEditDesc });
      showSuccess('Category details saved', 'Category Saved');
      setCatEditModalOpen(false);
      setEditingCat(null);
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update category', 'Category Error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(catId);
      showSuccess('Category deleted', 'Category Deleted');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Delete category failed', 'Category Error');
    }
  };

  const handleAdminTicketReply = async (ticketId: string) => {
    if (!adminReplyText.trim()) return;
    try {
      const res = await api.adminReplyTicket(ticketId, adminReplyText.trim());
      setActiveTicket(res.ticket);
      setAdminReplyText('');
      showSuccess('Support reply sent to user', 'Reply Sent');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Reply failed', 'Reply Error');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await api.updateTicketStatus(ticketId, status);
      if (activeTicket?.id === ticketId) {
        setActiveTicket(res.ticket);
      }
      showSuccess(`Ticket status set to ${status}`, 'Ticket Updated');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update ticket status', 'Ticket Error');
    }
  };

  const handleUpdateTicketPriority = async (ticketId: string, priority: string) => {
    try {
      const res = await api.updateTicketPriority(ticketId, priority);
      if (activeTicket?.id === ticketId) {
        setActiveTicket(res.ticket);
      }
      showSuccess(`Ticket priority updated to ${priority}`, 'Priority Updated');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to update ticket priority', 'Priority Error');
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent, status: 'draft' | 'sent') => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showWarning('Please enter a title and message.', 'Missing Broadcast Info');
      return;
    }

    try {
      const res = await api.createBroadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        targetAudience: broadcastAudience,
        selectedUserIds: selectedUserIdsForBroadcast,
        priority: broadcastPriority,
        status
      });
      showSuccess(res.message || 'Broadcast created', 'Broadcast Published');
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastAudience('all');
      setSelectedUserIdsForBroadcast([]);
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Broadcast action failed', 'Broadcast Error');
    }
  };

  const handleSendDraftBroadcast = async (id: string) => {
    try {
      const res = await api.sendBroadcast(id);
      showSuccess(res.message || 'Broadcast transmitted', 'Broadcast Sent');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to send broadcast', 'Broadcast Error');
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      await api.deleteBroadcast(id);
      showSuccess('Broadcast deleted', 'Broadcast Deleted');
      await fetchAdminData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete broadcast', 'Broadcast Error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        siteName: siteName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        bankDetails: {
          bankName: bankName.trim(),
          accountNumber: bankAccNum.trim(),
          accountName: bankAccName.trim(),
          instructions: bankInstructions.trim()
        }
      });
      await refreshSettings();
      showSuccess('Platform settings updated successfully.', 'Settings Saved');
    } catch (err: any) {
      showError(err.message || 'Failed to update settings', 'Settings Error');
    }
  };

  // --- Filtered Data ---
  const filteredUsers = adminUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrders = adminOrders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.websiteTitle.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = adminTransactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      t.userName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(transactionSearch.toLowerCase()));
    const matchesType = transactionTypeFilter === 'all' || t.type === transactionTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredCategories = adminCategories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const filteredTickets = adminTickets.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.userName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const matchesPriority = ticketPriorityFilter === 'all' || t.priority === ticketPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0 min-h-screen">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight">ADMIN PANEL</h2>
              <p className="text-[10px] text-amber-400 font-bold uppercase">SUREST PLUG Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Management', icon: Users, count: adminUsers.length },
            { id: 'websites', label: 'Website Listings', icon: Globe, count: adminWebsites.length },
            { id: 'orders', label: 'Orders Management', icon: ShoppingBag, count: adminOrders.length },
            { id: 'deposits', label: 'Deposit Requests', icon: Wallet, count: adminDeposits.filter(d => d.status === 'pending').length, alert: true },
            { id: 'transactions', label: 'Transactions Ledger', icon: History, count: adminTransactions.length },
            { id: 'categories', label: 'Categories', icon: Filter, count: adminCategories.length },
            { id: 'tickets', label: 'Support Tickets', icon: Headphones, count: adminTickets.filter(t => t.status === 'open').length, alert: adminTickets.some(t => t.status === 'open') },
            { id: 'broadcast', label: 'Broadcast Alert', icon: Bell },
            { id: 'settings', label: 'Site & Bank Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.alert ? 'bg-red-600 text-white animate-pulse' : isActive ? 'bg-slate-900 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => onNavigatePage('home')}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            Go to Public Website
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <div className="md:hidden bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {mobileAdminMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm text-amber-400">SUREST PLUG ADMIN</span>
        </div>
        <button
          onClick={() => onNavigatePage('home')}
          className="text-xs bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg"
        >
          Exit Console
        </button>
      </div>

      {/* Mobile Admin Drawer */}
      {mobileAdminMenuOpen && (
        <div className="md:hidden bg-slate-950 text-slate-300 p-4 border-b border-slate-800 space-y-2 animate-in fade-in">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'websites', label: 'Website Listings', icon: Globe },
            { id: 'orders', label: 'Orders Management', icon: ShoppingBag },
            { id: 'deposits', label: 'Deposit Requests', icon: Wallet },
            { id: 'transactions', label: 'Transactions Ledger', icon: History },
            { id: 'categories', label: 'Categories', icon: Filter },
            { id: 'tickets', label: 'Support Tickets', icon: Headphones },
            { id: 'broadcast', label: 'Broadcast Alert', icon: Bell },
            { id: 'settings', label: 'Site & Bank Settings', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleTabClick(item.id);
                setMobileAdminMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs ${
                activeTab === item.id ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto max-w-7xl">

        {/* Global Loading / Error State Bar */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-pulse">
            <span className="flex items-center gap-2">
              <LoadingGear size="sm" />
              Synchronizing real live platform data from database...
            </span>
          </div>
        )}

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              {fetchError}
            </span>
            <button
              onClick={() => fetchAdminData()}
              className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics Overview</h1>
                <p className="text-xs text-slate-500 mt-1">Live platform metrics, user sales, and financial ledger statistics.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchAdminData()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Refresh
                </button>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-extrabold text-xs">
                  Admin Console
                </span>
              </div>
            </div>

            {/* High level stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
                <p className="text-2xl font-black text-blue-600">{currency}{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</p>
                <p className="text-[11px] text-slate-400">{stats?.totalSales || 0} completed website sales</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Registered Users</span>
                <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
                <p className="text-[11px] text-emerald-600 font-bold">{stats?.activeUsers || 0} active user accounts</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Pending Deposit Review</span>
                <p className="text-2xl font-black text-amber-600">{stats?.pendingDeposits || 0}</p>
                <p className="text-[11px] text-slate-400">Awaiting admin payment check</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-slate-500">Open Tickets</span>
                <p className="text-2xl font-black text-slate-900">{stats?.openTickets || 0}</p>
                <p className="text-[11px] text-slate-400">Customer support queries</p>
              </div>
            </div>

            {/* Analytics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Platform Financial Metrics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Orders Count</span>
                    <span className="text-xl font-bold text-slate-900">{adminOrders.length}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Total Ledger Tx</span>
                    <span className="text-xl font-bold text-slate-900">{adminTransactions.length}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Websites Listed</span>
                    <span className="text-xl font-bold text-blue-600">{adminWebsites.length}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-2">
                  <span className="font-bold text-blue-900 block">Quick System Status</span>
                  <p>All database records are synced in real-time. Changes made by admin reflect immediately on the user marketplace.</p>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">System Quick Actions</h3>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => handleTabClick('websites')}
                    className="w-full p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-left flex items-center justify-between"
                  >
                    <span>Add / Manage Website Listings</span>
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTabClick('deposits')}
                    className="w-full p-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 text-left flex items-center justify-between"
                  >
                    <span>Review Pending Deposits ({adminDeposits.filter(d => d.status === 'pending').length})</span>
                    <Wallet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTabClick('broadcast')}
                    className="w-full p-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 text-left flex items-center justify-between"
                  >
                    <span>Send Platform Broadcast Alert</span>
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">User Accounts Management</h2>
                <p className="text-xs text-slate-500 mt-1">View registered users, search, adjust wallet balances, manage status, and reset passwords.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No matching users found</p>
                <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Balance</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1d4ed8&color=fff`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">{currency}{u.balance.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[10px] hover:bg-blue-100 border border-blue-200"
                              title="Adjust User Wallet Balance"
                            >
                              Balance
                            </button>
                            <button
                              onClick={() => setResetPassModalUser(u)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] hover:bg-slate-200 border border-slate-200"
                              title="Reset Password"
                            >
                              Pass
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                                u.status === 'active' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEBSITE LISTINGS MANAGEMENT */}
        {activeTab === 'websites' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Marketplace Website Listings</h2>
                <p className="text-xs text-slate-500 mt-1">Add, edit, publish, unpublish, feature, or delete digital website products.</p>
              </div>

              <button
                onClick={() => handleOpenWebModal()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Website
              </button>
            </div>

            {adminWebsites.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Globe className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Websites Listed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the "Add New Website" button above to publish your first website listing to the marketplace.
                </p>
                <button
                  onClick={() => handleOpenWebModal()}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminWebsites.map((web) => (
                  <div key={web.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="relative">
                        <img src={web.previewImage} alt="" className="w-full h-40 rounded-xl object-cover border border-slate-100" />
                        {web.featured && (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> FEATURED
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {web.category}
                          </span>
                          <span className="text-base font-black text-blue-600">{currency}{web.price.toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{web.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{web.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        web.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {web.status.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenWebModal(web)}
                          className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWebsite(web.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Orders Management</h2>
                <p className="text-xs text-slate-500 mt-1">Review website purchase orders, status updates, and issue customer refunds.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full sm:w-auto p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID, customer, title..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Orders Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {adminOrders.length === 0
                    ? 'No website orders have been placed on the marketplace yet.'
                    : 'No orders match your current filter and search query.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Website Title</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Order Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{o.userName}</p>
                          <p className="text-[11px] text-slate-500">{o.userEmail}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{o.websiteTitle}</td>
                        <td className="p-3 font-mono font-extrabold text-blue-600">{currency}{o.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            o.orderStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            o.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                            o.orderStatus === 'refunded' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {o.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>

                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="p-1 rounded-lg border border-slate-300 text-[10px] font-bold bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {o.orderStatus !== 'refunded' && (
                              <button
                                onClick={() => setRefundModalOrder(o)}
                                className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-bold text-[10px] border border-amber-200"
                              >
                                Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DEPOSIT APPROVALS */}
        {activeTab === 'deposits' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">User Deposit Requests Review</h2>
                <p className="text-xs text-slate-500 mt-1">Review manual bank transfers submitted by users and credit their wallet balance.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
                  Pending: {adminDeposits.filter(d => d.status === 'pending').length}
                </span>
              </div>
            </div>

            {adminDeposits.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Deposit Requests</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">No wallet deposit requests have been submitted by users yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Deposit ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Method & Ref</th>
                      <th className="p-3">Proof / Note</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminDeposits.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{d.id}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {d.userName}
                          <span className="block text-[10px] text-slate-500 font-normal">{d.userEmail}</span>
                        </td>
                        <td className="p-3 font-extrabold text-emerald-600 text-sm">{currency}{d.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-600">
                          {d.paymentMethod} • <span className="font-mono text-slate-900 font-bold">{d.reference}</span>
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{d.proofNote || 'No extra note'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : d.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {d.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          {d.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleApproveDeposit(d.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 shadow-xs"
                              >
                                Approve & Credit
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(d.id)}
                                className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-[10px] hover:bg-red-200 border border-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Transactions Financial Ledger</h2>
                <p className="text-xs text-slate-500 mt-1">Audit trail of all wallet credits, debits, purchases, deposits, and refunds.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  className="w-full sm:w-auto p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="purchase">Purchase</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="refund">Refund</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    placeholder="Search ledger..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <History className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Transactions Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">No transaction records match your query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Tx ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{tx.id}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {tx.userName}
                          <span className="block text-[10px] text-slate-500 font-normal">{tx.userEmail}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'deposit' || tx.type === 'credit' || tx.type === 'refund'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs">{tx.description}</td>
                        <td className={`p-3 font-mono font-extrabold text-sm ${
                          tx.type === 'deposit' || tx.type === 'credit' || tx.type === 'refund' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'purchase' || tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{tx.reference || 'N/A'}</td>
                        <td className="p-3 text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Categories Management</h2>
                <p className="text-xs text-slate-500 mt-1">Organize website digital products into public categories.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Add New Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Fintech, E-Commerce, SMM Panel"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Brief description of this category..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Save Category
              </button>
            </form>

            {/* Categories Table */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Filter className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No Categories Found</p>
                <p className="text-xs text-slate-500">Create a category above to start organizing website listings.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Category Name</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Listings Count</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCategories.map((cat) => {
                      const count = adminWebsites.filter(w => w.category.toLowerCase() === cat.name.toLowerCase()).length;
                      return (
                        <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{cat.name}</td>
                          <td className="p-3 text-slate-600 max-w-sm">{cat.description || 'No description provided'}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[11px] border border-blue-100">
                              {count} listings
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                              ACTIVE
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenCatEditModal(cat)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Support Tickets Management</h2>
                <p className="text-xs text-slate-500 mt-1">Review customer support inquiries, assign priority, and reply to support messages.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_user">Waiting for User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => setTicketPriorityFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search ticket..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Headphones className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Support Tickets Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">There are currently no support tickets matching your view criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Updated</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((tk) => (
                      <tr key={tk.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{tk.id}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {tk.userName}
                          <span className="block text-[10px] text-slate-500 font-normal">{tk.userEmail}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 max-w-xs">{tk.subject}</td>
                        <td className="p-3">
                          <select
                            value={tk.priority}
                            onChange={(e) => handleUpdateTicketPriority(tk.id, e.target.value)}
                            className="p-1 rounded-lg border border-slate-300 text-[10px] font-bold bg-white"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={tk.status}
                            onChange={(e) => handleUpdateTicketStatus(tk.id, e.target.value)}
                            className="p-1 rounded-lg border border-slate-300 text-[10px] font-bold bg-white"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_for_user">Waiting for User</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(tk.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => setActiveTicket(tk)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-xs"
                          >
                            <MessageSquare className="w-3 h-3" /> Reply & Thread
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: BROADCAST ALERT MANAGEMENT */}
        {activeTab === 'broadcast' && (
          <div className="space-y-8">
            {/* Create Broadcast Form Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Broadcast Alert System</h2>
                <p className="text-xs text-slate-500 mt-1">Send platform announcement notifications to all users or specific user segments.</p>
              </div>

              <form className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Maintenance Scheduled / New Websites Added"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                    <select
                      value={broadcastAudience}
                      onChange={(e) => setBroadcastAudience(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="all">All Users ({adminUsers.length})</option>
                      <option value="active">Active Users Only ({adminUsers.filter(u => u.status === 'active').length})</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Broadcast Message Body</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter full announcement details that will appear in user notifications..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => handleCreateBroadcast(e, 'draft')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCreateBroadcast(e, 'sent')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Dispatch Broadcast Now
                  </button>
                </div>
              </form>
            </div>

            {/* Broadcast History List */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Broadcast History & Drafts</h3>

              {adminBroadcasts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">No Broadcasts Created</p>
                  <p className="text-xs text-slate-500">Dispatch your first broadcast notification above.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {adminBroadcasts.map((bc) => (
                    <div key={bc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            bc.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {bc.status.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{bc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({bc.targetAudience.toUpperCase()})</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{bc.message}</p>
                        <p className="text-[10px] text-slate-400">Created {new Date(bc.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {bc.status === 'draft' && (
                          <button
                            onClick={() => handleSendDraftBroadcast(bc.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" /> Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBroadcast(bc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                          title="Delete Broadcast"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: SITE & BANK SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Platform & Manual Bank Settings</h2>
              <p className="text-xs text-slate-500 mt-1">Configure platform identity, logos, support contact info, and official bank transfer accounts.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Platform Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Support Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              {/* Bank Details Config */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 space-y-3">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Manual Bank Funding Account Configuration
                </h4>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Account Number</label>
                    <input
                      type="text"
                      value={bankAccNum}
                      onChange={(e) => setBankAccNum(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Account Name</label>
                    <input
                      type="text"
                      value={bankAccName}
                      onChange={(e) => setBankAccName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Deposit Instructions</label>
                  <textarea
                    value={bankInstructions}
                    onChange={(e) => setBankInstructions(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
              >
                Save Site Settings
              </button>
            </form>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* 1. Wallet Balance Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Adjust User Balance</h3>
              <button onClick={() => setSelectedUser(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="font-bold text-slate-900">{selectedUser.name}</p>
              <p className="text-slate-500">{selectedUser.email}</p>
              <p className="text-slate-700 font-mono">Current Balance: <strong className="text-blue-600">{currency}{selectedUser.balance.toLocaleString()}</strong></p>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('credit')}
                    className={`py-2 rounded-xl font-bold border ${adjType === 'credit' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
                  >
                    + Credit Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('debit')}
                    className={`py-2 rounded-xl font-bold border ${adjType === 'debit' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-300'}`}
                  >
                    - Debit Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory Description / Reason</label>
                <input
                  type="text"
                  value={adjDesc}
                  onChange={(e) => setAdjDesc(e.target.value)}
                  placeholder="e.g. Manual bank deposit verification / Bonus credit"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Website Add/Edit Modal */}
      {webModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="min-h-full flex items-start justify-center p-4">
            <div className="bg-white p-6 rounded-2xl max-w-xl w-full my-4 space-y-4 shadow-xl border border-slate-200 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingWeb ? 'Edit Website Listing' : 'Add New Website Listing'}
              </h3>
              <button onClick={() => setWebModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveWebsite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Website Title</label>
                <input
                  type="text"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder="e.g. SMM Panel Pro V5"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={webCategory}
                    onChange={(e) => setWebCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {adminCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={webPrice}
                    onChange={(e) => setWebPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preview Image URL</label>
                <input
                  type="url"
                  value={webPreviewImg}
                  onChange={(e) => setWebPreviewImg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={webDemoUrl}
                  onChange={(e) => setWebDemoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={webDesc}
                  onChange={(e) => setWebDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Technologies (Comma separated)</label>
                <input
                  type="text"
                  value={webTechs}
                  onChange={(e) => setWebTechs(e.target.value)}
                  placeholder="React 19, Node.js, Express, MySQL"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Features (Comma separated)</label>
                <input
                  type="text"
                  value={webFeatures}
                  onChange={(e) => setWebFeatures(e.target.value)}
                  placeholder="Auto Refill, Drip Feed, Support System"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webFeatured}
                    onChange={(e) => setWebFeatured(e.target.checked)}
                  />
                  Featured Listing
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold">Status:</span>
                  <select
                    value={webStatus}
                    onChange={(e) => setWebStatus(e.target.value as any)}
                    className="p-1.5 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* WEBSITE DELIVERY & ACCESS INFORMATION SECTION */}
              <div className="pt-5 border-t border-slate-200 space-y-4">
                <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-xl space-y-1">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                    <Shield className="w-4 h-4 text-amber-600" />
                    Website Delivery & Access Information
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    These details are private and will only be shown to buyers after a successful purchase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">1. Website Login URL</label>
                    <input
                      type="url"
                      value={webLoginUrl}
                      onChange={(e) => setWebLoginUrl(e.target.value)}
                      placeholder="e.g. https://demo.surestplug.com/login"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. Admin Panel URL</label>
                    <input
                      type="url"
                      value={webAdminPanelUrl}
                      onChange={(e) => setWebAdminPanelUrl(e.target.value)}
                      placeholder="e.g. https://demo.surestplug.com/admin"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">3. Admin Email / Username</label>
                    <input
                      type="text"
                      value={webAdminEmail}
                      onChange={(e) => setWebAdminEmail(e.target.value)}
                      placeholder="e.g. admin@surestplug.com or superadmin"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">4. Admin Password</label>
                    <input
                      type="text"
                      value={webAdminPassword}
                      onChange={(e) => setWebAdminPassword(e.target.value)}
                      placeholder="e.g. SecretPassword123!"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">5. Additional Access Instructions</label>
                  <textarea
                    value={webInstructions}
                    onChange={(e) => setWebInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. Log in with admin credentials provided above. Change password immediately in Settings..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">6. Optional Downloadable Website Package/File URL</label>
                    <input
                      type="url"
                      value={webDownloadFileUrl}
                      onChange={(e) => setWebDownloadFileUrl(e.target.value)}
                      placeholder="e.g. https://storage.example.com/files/smm-v1.zip"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Only fill if you want buyers to download a source package zip file. Leave blank if credentials-only.
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Package File Name (Optional)</label>
                    <input
                      type="text"
                      value={webPackageFileName}
                      onChange={(e) => setWebPackageFileName(e.target.value)}
                      placeholder="e.g. smm-panel-source-code.zip"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setWebModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Save Website
                </button>
              </div>
            </form>
          </div>
        </div>
     </div>
    )}

      {/* 3. Password Reset Modal */}
      {resetPassModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Reset Password for {resetPassModalUser.name}</h3>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="text"
                  value={resetPassInput}
                  onChange={(e) => setResetPassInput(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassModalUser(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Order #{selectedOrderDetails.id} Details</h3>
              <button onClick={() => setSelectedOrderDetails(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p><strong>Customer:</strong> {selectedOrderDetails.userName} ({selectedOrderDetails.userEmail})</p>
              <p><strong>Product Title:</strong> {selectedOrderDetails.websiteTitle}</p>
              <p><strong>Amount Charged:</strong> <span className="text-blue-600 font-bold">{currency}{selectedOrderDetails.amount.toLocaleString()}</span></p>
              <p><strong>Payment Status:</strong> <span className="font-bold uppercase text-emerald-600">{selectedOrderDetails.paymentStatus}</span></p>
              <p><strong>Order Fulfillment Status:</strong> <span className="font-bold uppercase text-blue-600">{selectedOrderDetails.orderStatus}</span></p>
              <p><strong>Date Purchased:</strong> {new Date(selectedOrderDetails.createdAt).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* 5. Order Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Issue Order Refund</h3>
              <button onClick={() => setRefundModalOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-600">
              Refunding order <strong>#{refundModalOrder.id}</strong> for <strong>{refundModalOrder.userName}</strong> will automatically credit <strong>{currency}{refundModalOrder.amount.toLocaleString()}</strong> back to their wallet balance and mark order status as <strong>REFUNDED</strong>.
            </p>

            <form onSubmit={handleRefundOrder} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Optional Admin Refund Note</label>
                <input
                  type="text"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  placeholder="e.g. Order cancelled upon customer request"
        
          className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"                  onClick={() => setRefundModalOrder(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 text-white font-bold rounded-xl"
                >
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Category Edit Modal */}
      {catEditModalOpen && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Category</h3>
              <button onClick={() => setCatEditModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  value={catEditName}
                  onChange={(e) => setCatEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={catEditDesc}
                  onChange={(e) => setCatEditDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Support Ticket Thread & Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ticket #{activeTicket.id}: {activeTicket.subject}</h3>
                <p className="text-slate-500">From: {activeTicket.userName} ({activeTicket.userEmail})</p>
              </div>
              <button onClick={() => setActiveTicket(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {activeTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl max-w-lg space-y-1 ${
                    m.isAdmin ? 'bg-blue-600 text-white ml-auto' : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                    <span className="font-bold">{m.senderName} ({m.isAdmin ? 'Admin Support' : 'Customer'})</span>
                    <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="space-y-3 pt-2">
              <textarea
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="Type administrator response..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Status:</span>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleUpdateTicketStatus(activeTicket.id, e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_user">Waiting for User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <button
                  onClick={() => handleAdminTicketReply(activeTicket.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Send Support Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
