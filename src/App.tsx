import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { AdminPanel } from './pages/admin/AdminPanel';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { WebsiteDetailModal } from './components/common/WebsiteDetailModal';
import { DepositModal } from './components/common/DepositModal';
import { MockEmailModal } from './components/common/MockEmailModal';
import { Website, MockEmail } from './types';
import { api } from './api/client';
import { LoadingGear } from './components/common/LoadingGear';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface ParsedRoute {
  view: string;
  tab?: string;
  websiteId?: string;
  depositModal?: boolean;
}

const buildHash = (view: string, tab?: string, websiteId?: string, depositModal?: boolean): string => {
  if (websiteId) {
    return `#/website/${websiteId}`;
  }
  if (depositModal) {
    return `#/deposit`;
  }
  if (view === 'dashboard') {
    return `#/dashboard/${tab || 'overview'}`;
  }
  if (view === 'admin') {
    return `?admin#/admin/${tab || 'dashboard'}`;
  }
  return `#/${view}`;
};

const parseLocation = (): ParsedRoute => {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  const search = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname;

  if (hash) {
    const parts = hash.split('/').filter(Boolean);
    const viewName = parts[0]?.toLowerCase();

    if (viewName === 'website' && parts[1]) {
      return { view: 'marketplace', websiteId: parts[1] };
    }
    if (viewName === 'marketplace' && parts[1] === 'website' && parts[2]) {
      return { view: 'marketplace', websiteId: parts[2] };
    }
    if (viewName === 'deposit') {
      return { view: 'dashboard', tab: 'deposits', depositModal: true };
    }
    if (viewName === 'dashboard') {
      const tabName = parts[1] || 'overview';
      if (tabName === 'deposit' || tabName === 'deposits') {
        return { view: 'dashboard', tab: 'deposits', depositModal: parts[2] === 'open' || parts[1] === 'deposit' };
      }
      return { view: 'dashboard', tab: tabName };
    }
    if (viewName === 'admin') {
      return { view: 'admin', tab: parts[1] || 'dashboard' };
    }
    if (
      ['home', 'marketplace', 'how-it-works', 'about', 'contact', 'login', 'signup'].includes(viewName)
    ) {
      return { view: viewName };
    }
  }

  if (
    search.has('admin') ||
    search.get('view') === 'admin' ||
    search.get('page') === 'admin' ||
    pathname.endsWith('/admin')
  ) {
    return { view: 'admin', tab: search.get('tab') || 'dashboard' };
  }

  const queryView = search.get('view') || search.get('page');
  if (queryView && ['home', 'marketplace', 'how-it-works', 'about', 'contact', 'login', 'signup', 'dashboard', 'admin'].includes(queryView)) {
    return { view: queryView, tab: search.get('tab') || undefined };
  }

  return { view: 'home' };
};

function AppContent() {
  const { user, logout, isLoading, refreshUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [currentView, setCurrentView] = useState<string>('home');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<{ view: string; tab?: string; websiteId?: string } | null>(null);

  // Compute active view ensuring authenticated users never render public home, login, or signup
  const activeView = React.useMemo(() => {
    if (isLoading) return currentView;
    if (user) {
      if (['home', 'login', 'signup'].includes(currentView)) {
        return 'dashboard';
      }
    } else {
      if (currentView === 'dashboard') {
        return 'login';
      }
    }
    return currentView;
  }, [isLoading, user, currentView]);

  // Modals
  const [activeWebsiteModal, setActiveWebsiteModal] = useState<Website | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [emailModalData, setEmailModalData] = useState<MockEmail | null>(null);

  // Purchased IDs tracking
  const [purchasedWebsiteIds, setPurchasedWebsiteIds] = useState<string[]>([]);

  const fetchPurchases = async () => {
    if (user) {
      try {
        const res = await api.getPurchases();
        setPurchasedWebsiteIds(res.purchases.map((p: any) => p.website?.id).filter(Boolean));
      } catch (err) {
        console.error(err);
      }
    } else {
      setPurchasedWebsiteIds([]);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const applyRoute = useCallback(async (route: ParsedRoute) => {
    setCurrentView(route.view);

    if (route.view === 'dashboard') {
      setDashboardTab(route.tab || 'overview');
    } else if (route.view === 'admin') {
      setAdminTab(route.tab || 'dashboard');
    }

    if (route.websiteId) {
      if (!activeWebsiteModal || activeWebsiteModal.id !== route.websiteId) {
        try {
          const res = await api.getWebsiteById(route.websiteId);
          if (res?.website) {
            setActiveWebsiteModal(res.website);
          }
        } catch (err) {
          console.error('Error fetching website by ID for route:', err);
        }
      }
    } else {
      setActiveWebsiteModal(null);
    }

    if (route.depositModal) {
      setDepositModalOpen(true);
    } else {
      setDepositModalOpen(false);
    }
  }, [activeWebsiteModal]);

  useEffect(() => {
    const initialRoute = parseLocation();
    const targetHash = buildHash(initialRoute.view, initialRoute.tab, initialRoute.websiteId, initialRoute.depositModal);

    if (!window.location.hash || window.location.hash !== targetHash) {
      window.history.replaceState(
        { view: initialRoute.view, tab: initialRoute.tab, websiteId: initialRoute.websiteId, depositModal: initialRoute.depositModal },
        '',
        targetHash
      );
    }

    applyRoute(initialRoute);

    const handlePopState = () => {
      const route = parseLocation();
      applyRoute(route);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigate = useCallback((
    view: string,
    tab?: string,
    options?: { websiteId?: string; depositModal?: boolean; replace?: boolean }
  ) => {
    const targetHash = buildHash(view, tab, options?.websiteId, options?.depositModal);

    if (window.location.hash !== targetHash) {
      if (options?.replace) {
        window.history.replaceState({ view, tab, websiteId: options?.websiteId, depositModal: options?.depositModal }, '', targetHash);
      } else {
        window.history.pushState({ view, tab, websiteId: options?.websiteId, depositModal: options?.depositModal }, '', targetHash);
      }
    }

    applyRoute({ view, tab, websiteId: options?.websiteId, depositModal: options?.depositModal });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [applyRoute]);

  // Automatically enforce route protections and redirects
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (['home', 'login', 'signup'].includes(currentView)) {
          const isAdmin = user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com';
          if (isAdmin && (currentView === 'login' || currentView === 'signup') && (window.location.search.includes('admin') || window.location.hash.includes('admin'))) {
            handleNavigate('admin', 'dashboard', { replace: true });
          } else {
            handleNavigate('dashboard', dashboardTab || 'overview', { replace: true });
          }
        }
      } else {
        if (currentView === 'dashboard') {
          setRedirectAfterLogin({ view: 'dashboard', tab: dashboardTab || 'overview' });
          handleNavigate('login', undefined, { replace: true });
        }
      }
    }
  }, [user, isLoading, currentView, dashboardTab, handleNavigate]);

  const handleOpenWebsiteModal = (website: Website) => {
    handleNavigate(
      activeView === 'dashboard' ? 'dashboard' : activeView === 'admin' ? 'admin' : 'marketplace',
      activeView === 'dashboard' ? dashboardTab : activeView === 'admin' ? adminTab : undefined,
      { websiteId: website.id }
    );
  };

  const handleCloseWebsiteModal = () => {
    if (window.location.hash.includes('website')) {
      window.history.back();
    } else {
      setActiveWebsiteModal(null);
    }
  };

  const handleOpenDepositModal = () => {
    handleNavigate(
      activeView === 'admin' ? 'admin' : 'dashboard',
      activeView === 'admin' ? adminTab : 'deposits',
      { depositModal: true }
    );
  };

  const handleCloseDepositModal = () => {
    if (window.location.hash.includes('deposit')) {
      window.history.back();
    } else {
      setDepositModalOpen(false);
    }
  };

  const handleBuyNowClick = (website: Website) => {
    if (!user) {
      setRedirectAfterLogin({ view: 'marketplace', websiteId: website.id });
      showInfo('Please log in or create an account to purchase websites.', 'Login Required');
      handleNavigate('login');
      return;
    }

    if (purchasedWebsiteIds.includes(website.id)) {
      handleNavigate('dashboard', 'purchases');
      return;
    }

    handleOpenWebsiteModal(website);
  };

  const handleExecutePurchase = async (website: Website) => {
    try {
      const res = await api.purchaseWebsite(website.id);
      await refreshUser();
      await fetchPurchases();
      showSuccess(`Congratulations! You have successfully purchased "${website.title}". Source files are available in your User Dashboard.`, 'Purchase Successful');
      setActiveWebsiteModal(null);
      if (res.emailNotification) {
        setEmailModalData(res.emailNotification);
      } else {
        handleNavigate('dashboard', 'purchases');
      }
    } catch (err: any) {
      showError(err.message || 'Purchase transaction failed.', 'Purchase Failed');
      throw err;
    }
  };

  const handleDownloadWebsite = async (websiteId: string) => {
    try {
      const pkg = await api.downloadWebsite(websiteId);
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pkg.fileName || 'surest-plug-website-source.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Source code download package generated successfully!', 'Download Started');
    } catch (err: any) {
      showError(err.message || 'Download failed', 'Download Error');
    }
  };

  if (isLoading) {
    return <LoadingGear fullPage size="lg" text="Connecting to SUREST PLUG..." />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar onNavigate={handleNavigate} currentView={activeView} />

      {/* Main Page Routing */}
      <div className="flex-1">
        {activeView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenWebsiteDetail={handleOpenWebsiteModal}
            onBuyNow={handleBuyNowClick}
          />
        )}

        {activeView === 'marketplace' && (
          <MarketplacePage
            onOpenWebsiteDetail={handleOpenWebsiteModal}
            onBuyNow={handleBuyNowClick}
            userPurchasedIds={purchasedWebsiteIds}
          />
        )}

        {activeView === 'how-it-works' && (
          <HowItWorksPage onNavigate={handleNavigate} />
        )}

        {activeView === 'about' && (
          <AboutPage />
        )}

        {activeView === 'contact' && (
          <ContactPage />
        )}

        {activeView === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onSuccess={(role) => {
              if (role === 'admin') {
                handleNavigate('admin', 'dashboard');
              } else if (redirectAfterLogin) {
                const target = redirectAfterLogin;
                setRedirectAfterLogin(null);
                handleNavigate(target.view, target.tab, { websiteId: target.websiteId });
              } else {
                handleNavigate('dashboard', 'overview');
              }
            }}
          />
        )}

        {activeView === 'signup' && (
          <SignUpPage
            onNavigate={handleNavigate}
            onSuccess={(role) => {
              if (role === 'admin') {
                handleNavigate('admin', 'dashboard');
              } else if (redirectAfterLogin) {
                const target = redirectAfterLogin;
                setRedirectAfterLogin(null);
                handleNavigate(target.view, target.tab, { websiteId: target.websiteId });
              } else {
                handleNavigate('dashboard', 'overview');
              }
            }}
          />
        )}

        {activeView === 'dashboard' && (
          user ? (
            <UserDashboard
              initialTab={dashboardTab}
              onNavigatePage={handleNavigate}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
              <p className="text-xs text-slate-600">Please sign in to access your SUREST PLUG user dashboard, orders, and wallet balance.</p>
              <button
                onClick={() => handleNavigate('login')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )
        )}

        {activeView === 'admin' && (
          isLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
              <LoadingGear size="lg" text="Verifying Administrator Authorization..." />
            </div>
          ) : user && (user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') ? (
            <AdminPanel initialTab={adminTab} onNavigatePage={handleNavigate} />
          ) : user ? (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
              <h2 className="text-xl font-extrabold text-slate-900">Administrator Access Required</h2>
              <p className="text-xs text-slate-600">
                You are currently signed in as <strong className="text-slate-900">{user.email}</strong>. This account does not have administrator authorization. Only <strong className="text-slate-900">chinonsochinix@gmail.com</strong> is permitted to access the SUREST PLUG Admin Panel.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={async () => {
                    await logout();
                    handleNavigate('admin', 'dashboard');
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  Sign Out & Log In as Admin
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigate('dashboard', 'overview')}
                  className="w-full py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <AdminLoginPage
              onNavigate={handleNavigate}
              onSuccess={() => handleNavigate('admin', adminTab || 'dashboard')}
            />
          )
        )}
      </div>

      {/* Footer */}
      {activeView !== 'dashboard' && activeView !== 'admin' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Global Modals */}
      {activeWebsiteModal && (
        <WebsiteDetailModal
          website={activeWebsiteModal}
          isPurchased={purchasedWebsiteIds.includes(activeWebsiteModal.id)}
          onClose={handleCloseWebsiteModal}
          onPurchase={handleExecutePurchase}
          onDownload={handleDownloadWebsite}
          onDepositRequired={() => {
            handleCloseWebsiteModal();
            handleOpenDepositModal();
          }}
        />
      )}

      {depositModalOpen && (
        <DepositModal
          onClose={handleCloseDepositModal}
          onSuccess={async () => {
            await refreshUser();
          }}
        />
      )}

      {emailModalData && (
        <MockEmailModal
          email={emailModalData}
          onClose={() => {
            setEmailModalData(null);
            handleNavigate('dashboard', 'purchases');
          }}
          onNavigatePurchases={() => {
            setEmailModalData(null);
            handleNavigate('dashboard', 'purchases');
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
