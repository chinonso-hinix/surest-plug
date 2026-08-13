import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Wallet,
  ShieldAlert,
  ChevronDown,
  ShoppingBag,
  Bell
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, settings } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const logoUrl = settings?.logoUrl || "/logo.png";

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navItems = user
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'how-it-works', label: 'How It Works' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'marketplace', label: 'Marketplace' },
        { id: 'how-it-works', label: 'How It Works' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
      ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick(user ? 'dashboard' : 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 p-1 flex items-center justify-center border border-blue-100 group-hover:border-blue-300 transition-colors">
              <img 
                src={logoUrl} 
                alt="SUREST PLUG" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 flex items-center gap-1">
                SUREST<span className="text-blue-600">PLUG</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider -mt-1">
                Digital Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* User Auth / Dashboard Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Admin Badge link if admin */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Panel
                  </button>
                )}

                {/* Account Balance Badge */}
                <button
                  onClick={() => handleNavClick('dashboard-balance')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-500 font-medium">Balance:</span>
                  <span className="text-sm font-bold text-slate-900">{settings?.currency || '₦'}{user.balance.toLocaleString()}</span>
                </button>

                {/* Dashboard Button */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                  >
                    <img
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1d4ed8&color=fff`}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </button>

                      <button
                        onClick={() => handleNavClick('dashboard-purchases')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        My Purchases
                      </button>

                      <button
                        onClick={() => handleNavClick('dashboard-profile')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-4.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-1">
            {navItems.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  currentView === link.id
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-slate-500 font-medium">Balance</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{settings?.currency || '₦'}{user.balance.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  User Dashboard
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-semibold text-sm"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Console
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-center text-sm font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
