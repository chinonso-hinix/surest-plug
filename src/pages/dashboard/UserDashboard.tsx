import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import {
  Website,
  Order,
  Transaction,
  Deposit,
  SupportTicket,
  AppNotification,
  MockEmail,
  WebsiteDelivery
} from '../../types';
import { WebsiteCard } from '../../components/common/WebsiteCard';
import { DepositModal } from '../../components/common/DepositModal';
import { WebsiteDetailModal } from '../../components/common/WebsiteDetailModal';
import { MockEmailModal } from '../../components/common/MockEmailModal';
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  FileText,
  History,
  Headphones,
  Bell,
  Mail,
  User as UserIcon,
  PlusCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  Menu,
  X,
  Search,
  Filter,
  ShieldCheck,
  Send,
  Key,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Globe,
  FileCode
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

interface UserDashboardProps {
  initialTab?: string;
  onNavigatePage: (view: string, tab?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  initialTab = 'overview',
  onNavigatePage
}) => {
  const { user, refreshUser, settings } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const currency = settings?.currency || '₦';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onNavigatePage) {
      onNavigatePage('dashboard', tabId);
    }
  };

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<{ order: Order; website: Website }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mockEmails, setMockEmails] = useState<MockEmail[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Notifications sub tab
  const [notifSubTab, setNotifSubTab] = useState<'notifications' | 'emails'>('notifications');

  // Modals
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [activeEmailModal, setActiveEmailModal] = useState<MockEmail | null>(null);
  const [deliveryModalData, setDeliveryModalData] = useState<{ website: Website; delivery: WebsiteDelivery } | null>(null);
  const [deliveryModalLoading, setDeliveryModalLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleViewDelivery = async (websiteId: string) => {
    setDeliveryModalLoading(true);
    try {
      const res = await api.getPurchaseDelivery(websiteId);
      setDeliveryModalData(res);
      setShowPassword(false);
    } catch (err: any) {
      showError(err.message || 'Failed to retrieve website delivery credentials.', 'Access Failed');
    } finally {
      setDeliveryModalLoading(false);
    }
  };

  const handleCopyText = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showInfo(`${fieldName} copied to clipboard!`, 'Copied');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // New Support Ticket Form State
  const [newTicketSubject, setNewTicketSubject] = useState<string>('');
  const [newTicketCategory, setNewTicketCategory] = useState<string>('Technical Support');
  const [newTicketPriority, setNewTicketPriority] = useState<string>('medium');
  const [newTicketMessage, setNewTicketMessage] = useState<string>('');
  const [ticketSubmitting, setTicketSubmitting] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyMsg, setTicketReplyMsg] = useState<string>('');

  // Profile Edit State
  const [profileName, setProfileName] = useState<string>(user?.name || '');
  const [profileEmail, setProfileEmail] = useState<string>(user?.email || '');
  const [profilePhone, setProfilePhone] = useState<string>(user?.phone || '');
  const [profilePic, setProfilePic] = useState<string>(user?.profileImage || '');
  const [currPass, setCurrPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordRes, purRes, txnRes, depRes, ntfRes, tckRes, emlRes] = await Promise.all([
        api.getOrders(),
        api.getPurchases(),
        api.getTransactions(),
        api.getDeposits(),
        api.getNotifications(),
        api.getTickets(),
        api.getMockEmails()
      ]);

      setOrders(ordRes.orders);
      setPurchases(purRes.purchases);
      setTransactions(txnRes.transactions);
      setDeposits(depRes.deposits);
      setNotifications(ntfRes.notifications);
      setTickets(tckRes.tickets);
      setMockEmails(emlRes.emails || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handlePurchaseWebsite = async (website: Website) => {
    try {
      const res = await api.purchaseWebsite(website.id);
      await refreshUser();
      await fetchDashboardData();
      showSuccess(`Congratulations! You have successfully purchased "${website.title}". Source files are now ready in My Purchases.`, 'Purchase Complete');
      setSelectedWebsite(null);
      if (res.emailNotification) {
        setActiveEmailModal(res.emailNotification);
      } else {
        handleTabClick('purchases');
      }
    } catch (err: any) {
      showError(err.message || 'Purchase failed.', 'Purchase Error');
      throw err;
    }
  };

  const handleDownloadWebsite = async (websiteId: string) => {
    try {
      const pkg = await api.downloadWebsite(websiteId);
      // Trigger download blob
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pkg.fileName || 'surest-plug-website-source.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Download started!', 'Download Ready');
    } catch (err: any) {
      showError(err.message || 'Download failed', 'Download Error');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setTicketSubmitting(true);
    try {
      await api.createTicket({
        subject: newTicketSubject.trim(),
        category: newTicketCategory,
        priority: newTicketPriority,
        message: newTicketMessage.trim()
      });
      setNewTicketSubject('');
      setNewTicketMessage('');
      await fetchDashboardData();
      showSuccess('Support ticket created successfully! Our team will respond shortly.', 'Ticket Submitted');
    } catch (err: any) {
      showError(err.message || 'Ticket creation failed', 'Ticket Error');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyMsg.trim()) return;
    try {
      const res = await api.replyTicket(ticketId, ticketReplyMsg.trim());
      setSelectedTicket(res.ticket);
      setTicketReplyMsg('');
      await fetchDashboardData();
      showSuccess('Reply submitted to support ticket!', 'Reply Sent');
    } catch (err: any) {
      showError(err.message || 'Reply failed', 'Reply Error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        profileImage: profilePic,
        currentPassword: currPass || undefined,
        newPassword: newPass || undefined
      });
      await refreshUser();
      setCurrPass('');
      setNewPass('');
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      showSuccess('Your profile details have been saved successfully!', 'Profile Updated');
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
      showError(err.message || 'Failed to update profile', 'Profile Error');
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const purchasedWebsiteIds = purchases.map(p => p.website?.id).filter(Boolean);

  const completedOrdersCount = orders.filter(o => o.orderStatus === 'completed').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-screen">
        
        {/* User Mini Profile Header */}
        <div className="p-5 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1d4ed8&color=fff`}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/50"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span>Balance:</span>
            </div>
            <span className="text-sm font-extrabold text-white">{currency}{user?.balance.toLocaleString() || '0'}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'purchases', label: 'My Purchases', icon: ShoppingBag, count: purchases.length },
            { id: 'balance', label: 'Balance & Deposits', icon: Wallet },
            { id: 'orders', label: 'Order History', icon: FileText, count: orders.length },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'tickets', label: 'Support Tickets', icon: Headphones },
            { id: 'notifications', label: 'Notifications', icon: Bell, unread: notifications.filter(n => !n.read).length },
            { id: 'profile', label: 'Profile Settings', icon: UserIcon }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.unread !== undefined && item.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                    {item.unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Deposit Banner */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white space-y-2">
          <p className="text-xs font-bold">Need to buy a website?</p>
          <p className="text-[11px] text-blue-100">Fund your wallet balance via bank funding.</p>
          <button
            onClick={() => setDepositModalOpen(true)}
            className="w-full py-2 bg-white text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
          >
            + Deposit Funds
          </button>
        </div>
      </aside>

      {/* Mobile Dashboard Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-base tracking-tight">User Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400">{currency}{user?.balance.toLocaleString() || '0'}</span>
          <button
            onClick={() => setDepositModalOpen(true)}
            className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-2 animate-in fade-in">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'purchases', label: 'My Purchases', icon: ShoppingBag },
            { id: 'balance', label: 'Balance & Deposits', icon: Wallet },
            { id: 'orders', label: 'Order History', icon: FileText },
            { id: 'transactions', label: 'Transactions', icon: History },
            { id: 'tickets', label: 'Support Tickets', icon: Headphones },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'profile', label: 'Profile Settings', icon: UserIcon }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleTabClick(item.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs ${
                activeTab === item.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto max-w-7xl">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Available Balance</span>
                  <span className="text-2xl font-black text-slate-900">{currency}{user?.balance.toLocaleString() || '0'}</span>
                </div>
                <button
                  onClick={() => setDepositModalOpen(true)}
                  className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Deposit Funds"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Purchased Websites</span>
                  <span className="text-2xl font-black text-slate-900">{purchases.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Completed Orders</span>
                  <span className="text-2xl font-black text-slate-900">{completedOrdersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Pending Orders</span>
                  <span className="text-2xl font-black text-slate-900">{pendingOrdersCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Quick Actions & Recent Purchases Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Recent Purchases */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">My Recent Purchases</h3>
                  <button
                    onClick={() => handleTabClick('purchases')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All ({purchases.length})
                  </button>
                </div>

                {purchases.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl space-y-2">
                    <p>You haven't purchased any websites yet.</p>
                    <button
                      onClick={() => onNavigatePage('marketplace')}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchases.slice(0, 3).map(({ order, website }) => (
                      <div key={order.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {website && (
                            <img src={website.previewImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{order.websiteTitle}</h4>
                            <p className="text-[11px] text-slate-500">Order #{order.id} • {currency}{order.amount.toLocaleString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadWebsite(order.websiteId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Files
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions Ledger */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Recent Activity</h3>
                  <button
                    onClick={() => handleTabClick('transactions')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View Ledger
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                    No transactions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 4).map(txn => {
                      const isCredit = txn.type === 'deposit' || txn.type === 'credit' || txn.type === 'refund';
                      return (
                        <div key={txn.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-900 truncate">{txn.description}</p>
                              <p className="text-[10px] text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <span className={`font-mono font-extrabold shrink-0 ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isCredit ? '+' : '-'}{currency}{txn.amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MY PURCHASES */}
        {activeTab === 'purchases' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">My Purchased Websites</h2>
                <p className="text-xs text-slate-500">Access and download source files for websites you own.</p>
              </div>

              <button
                onClick={() => onNavigatePage('marketplace')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                Browse Marketplace
              </button>
            </div>

            {purchases.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Purchased Websites Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse our website marketplace and purchase ready-to-launch templates to download source files here.
                </p>
                <button
                  onClick={() => onNavigatePage('marketplace')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map(({ order, website }) => (
                  <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    {website && (
                      <img src={website.previewImage} alt="" className="w-full h-40 rounded-xl object-cover" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Purchased & Verified
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">Order #{order.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{order.websiteTitle}</h3>
                      <p className="text-xs text-slate-500">
                        Paid: <span className="font-bold text-slate-800">{currency}{order.amount.toLocaleString()}</span> • Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewDelivery(order.websiteId)}
                        className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Key className="w-4 h-4" />
                        Access Credentials & Details
                      </button>

                      {website && (
                        <button
                          onClick={() => setSelectedWebsite(website)}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                        >
                          View Listing
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BALANCE & DEPOSITS */}
        {activeTab === 'balance' && (
          <div className="space-y-8">
            
            {/* Balance Overview Card */}
            <div className="bg-gradient-to-r from-blue-700 to-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Available Wallet Balance</span>
                <h2 className="text-4xl font-black">{currency}{user?.balance.toLocaleString() || '0'}</h2>
                <p className="text-xs text-blue-200">Use your wallet balance to instantly buy websites on SUREST PLUG.</p>
              </div>

              <button
                onClick={() => setDepositModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 shadow-md flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Fund Account Balance
              </button>
            </div>

            {/* Deposits History */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Deposit Requests & History</h3>

              {deposits.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                  No deposit requests submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Deposit ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deposits.map(dep => (
                        <tr key={dep.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono font-bold text-slate-900">{dep.id}</td>
                          <td className="p-3 font-bold text-slate-900">{currency}{dep.amount.toLocaleString()}</td>
                          <td className="p-3 text-slate-600">{dep.paymentMethod}</td>
                          <td className="p-3 font-mono text-slate-600">{dep.reference}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              dep.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dep.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {dep.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{new Date(dep.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Order Management & History</h2>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                You have no orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Website Title</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Status</th>
                      <th className="p-3">Order Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="p-3 font-bold text-slate-800">{o.websiteTitle}</td>
                        <td className="p-3 font-bold text-slate-900">{currency}{o.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {o.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            {o.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDownloadWebsite(o.websiteId)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-700"
                          >
                            <Download className="w-3 h-3" />
                            Files
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

        {/* TAB 5: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Complete Financial Ledger</h2>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                No financial transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(txn => {
                      const isCredit = txn.type === 'deposit' || txn.type === 'credit' || txn.type === 'refund';
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{txn.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">{txn.description}</td>
                          <td className={`p-3 font-mono font-extrabold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isCredit ? '+' : '-'}{currency}{txn.amount.toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-slate-500">{txn.reference}</td>
                          <td className="p-3 text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* WhatsApp Instant Support Card */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white shrink-0 border border-white/20">
                  <WhatsAppIcon className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    Instant WhatsApp Support
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30">
                      24/7 Live Desk
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Need immediate answers? Chat directly with our support team on WhatsApp.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.link/l8ef6x"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                Chat on WhatsApp
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Ticket Submission Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Open Support Ticket</h3>
                  <a
                    href="https://wa.link/l8ef6x"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    title="Chat on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Subject</label>
                    <input
                      type="text"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Brief description of inquiry"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Category</label>
                      <select
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      >
                        <option value="Technical Support">Technical Support</option>
                        <option value="Deposit / Payment">Deposit / Payment</option>
                        <option value="Website Script">Website Script</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Priority</label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Message Details</label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      rows={4}
                      placeholder="Describe your issue or question..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    {ticketSubmitting ? 'Creating Ticket...' : 'Submit Support Ticket'}
                  </button>
                </form>
              </div>

              {/* Tickets List / Chat */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">My Tickets History</h3>
                  <a
                    href="https://wa.link/l8ef6x"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Live WhatsApp Desk
                  </a>
                </div>

                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                    No support tickets created yet.
                  </div>
                ) : selectedTicket ? (
                  /* Ticket Detail Thread */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h4>
                        <p className="text-[11px] text-slate-500">
                          ID: {selectedTicket.id} • Status: <span className="font-bold uppercase text-blue-600">{selectedTicket.status}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="https://wa.link/l8ef6x"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Chat about this ticket on WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp
                        </a>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          Back to list
                        </button>
                      </div>
                    </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {selectedTicket.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl max-w-lg text-xs space-y-1 ${
                          msg.isAdmin
                            ? 'bg-blue-100 text-blue-900 ml-auto border border-blue-200'
                            : 'bg-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] text-slate-600">
                          <span>{msg.senderName} {msg.isAdmin && '(Support Admin)'}</span>
                          <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ticketReplyMsg}
                        onChange={(e) => setTicketReplyMsg(e.target.value)}
                        placeholder="Type a reply to support..."
                        className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                      <button
                        onClick={() => handleReplyTicket(selectedTicket.id)}
                        className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket List */
                <div className="space-y-3">
                  {tickets.map(tck => (
                    <div
                      key={tck.id}
                      onClick={() => setSelectedTicket(tck)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[11px] font-bold text-slate-500">{tck.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                            {tck.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{tck.subject}</h4>
                        <p className="text-[11px] text-slate-500">{tck.messages.length} message(s) • Last updated {new Date(tck.updatedAt).toLocaleDateString()}</p>
                      </div>

                      <span className="text-xs font-bold text-blue-600 hover:underline">View Thread →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Notification & Email Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage in-app updates and view automated email order receipts</p>
              </div>

              {/* Sub tab buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setNotifSubTab('notifications')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    notifSubTab === 'notifications' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  In-App Alerts
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </button>

                <button
                  onClick={() => setNotifSubTab('emails')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    notifSubTab === 'emails' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Receipts
                  {mockEmails.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                      {mockEmails.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {notifSubTab === 'notifications' ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark All As Read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl">
                    No in-app notifications received yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          n.read ? 'bg-white border-slate-200' : 'bg-blue-50/60 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-600">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Below are automated mock purchase receipt emails dispatched by the platform. Click any email to preview its HTML formatted layout or copy receipt details.
                  </span>
                </div>

                {mockEmails.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl space-y-1">
                    <p className="font-bold text-slate-700">No Email Receipts Yet</p>
                    <p className="text-[11px] text-slate-400">
                      When you purchase a website or complete an order, confirmation emails will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockEmails.map(email => (
                      <div
                        key={email.id}
                        onClick={() => setActiveEmailModal(email)}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {email.subject}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ₦{email.amount?.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              To: <strong className="text-slate-700">{email.toName}</strong> &lt;{email.toEmail}&gt;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(email.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                            View Receipt →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Account Profile & Security</h2>

            {profileMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-bold ${
                profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Profile Image URL</label>
                <input
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900">Change Password (Optional)</h4>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Current Password</label>
                  <input
                    type="password"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <DepositModal
          onClose={() => setDepositModalOpen(false)}
          onSuccess={async () => {
            await refreshUser();
            await fetchDashboardData();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedWebsite && (
        <WebsiteDetailModal
          website={selectedWebsite}
          isPurchased={purchasedWebsiteIds.includes(selectedWebsite.id)}
          onClose={() => setSelectedWebsite(null)}
          onPurchase={handlePurchaseWebsite}
          onDownload={handleDownloadWebsite}
          onDepositRequired={() => setDepositModalOpen(true)}
        />
      )}

      {/* Website Delivery Credentials Modal */}
      {deliveryModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Purchased & Verified Access
                </span>
                <h3 className="text-xl font-bold text-slate-900">{deliveryModalData.website.title}</h3>
                <p className="text-xs text-slate-500">Private delivery details and admin credentials</p>
              </div>

              <button
                onClick={() => setDeliveryModalData(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Admin Panel URL */}
              {(deliveryModalData.delivery?.adminPanelUrl || deliveryModalData.delivery?.loginUrl) && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2">
                  <span className="font-bold text-blue-900 block text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" /> Admin Panel URL
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={deliveryModalData.delivery?.adminPanelUrl || deliveryModalData.delivery?.loginUrl || ''}
                      className="flex-1 p-2.5 rounded-xl bg-white border border-blue-200 font-mono text-slate-800 font-bold"
                    />
                    <a
                      href={deliveryModalData.delivery?.adminPanelUrl || deliveryModalData.delivery?.loginUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Admin Panel
                    </a>
                  </div>
                </div>
              )}

              {/* Login URL if separate */}
              {deliveryModalData.delivery?.loginUrl && deliveryModalData.delivery?.loginUrl !== deliveryModalData.delivery?.adminPanelUrl && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Website Login URL</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={deliveryModalData.delivery.loginUrl}
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 font-bold"
                    />
                    <a
                      href={deliveryModalData.delivery.loginUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" /> Visit Login
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email / Username */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Admin Email / Username</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={deliveryModalData.delivery?.adminEmail || 'Not specified'}
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 font-bold"
                    />
                    {deliveryModalData.delivery?.adminEmail && (
                      <button
                        onClick={() => handleCopyText(deliveryModalData.delivery?.adminEmail || '', 'username')}
                        className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Copy Username"
                      >
                        {copiedField === 'username' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Admin Password</span>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      readOnly
                      value={deliveryModalData.delivery?.adminPassword || 'Not specified'}
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 font-bold"
                    />
                    {deliveryModalData.delivery?.adminPassword && (
                      <>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title={showPassword ? 'Hide Password' : 'Show Password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleCopyText(deliveryModalData.delivery?.adminPassword || '', 'password')}
                          className="p-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedField === 'password' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {deliveryModalData.delivery?.instructions && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Additional Access Instructions</span>
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {deliveryModalData.delivery.instructions}
                  </div>
                </div>
              )}

              {/* Source Package Download Section */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Source Code & Files Package</span>

                {deliveryModalData.delivery?.downloadFileUrl || deliveryModalData.website?.fileUrl ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-left w-full sm:w-auto">
                      <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-emerald-600" /> Downloadable Package Available
                      </span>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {deliveryModalData.delivery?.packageFileName || deliveryModalData.website?.packageFileName || 'source-code.zip'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadWebsite(deliveryModalData.website.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Files Package
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
                    <p className="font-bold text-slate-800">No Downloadable Source Package Uploaded</p>
                    <p className="text-[11px]">
                      The seller/admin did not attach a downloadable ZIP package file for this listing. Access and manage your website directly via the Admin Panel credentials above.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeliveryModalData(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
            >
              Close Access Credentials
            </button>
          </div>
        </div>
      )}

      {activeEmailModal && (
        <MockEmailModal
          email={activeEmailModal}
          onClose={() => setActiveEmailModal(null)}
          onNavigatePurchases={() => handleTabClick('purchases')}
        />
      )}

    </div>
  );
};
