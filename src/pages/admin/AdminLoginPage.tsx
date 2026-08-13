import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string, tab?: string) => void;
  onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, onSuccess }) => {
  const { user, isLoading, login, loginWithGoogle, logout, settings } = useAuth();
  const logoUrl = settings?.logoUrl || "/logo.png";

  const [email, setEmail] = useState<string>('chinonsochinix@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') {
        onSuccess();
      }
    }
  }, [user, isLoading, onSuccess]);

  const verifyAndProceed = (userEmail?: string | null) => {
    const formatted = (userEmail || '').trim().toLowerCase();
    if (formatted === 'chinonsochinix@gmail.com') {
      onSuccess();
    } else {
      logout();
      setErrorMsg(`Access Denied: The account (${userEmail || 'unknown'}) is not authorized for administrator access. Only chinonsochinix@gmail.com is permitted.`);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        verifyAndProceed(user.email);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google administrator authentication failed.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      verifyAndProceed(user.email);
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrator authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Subtle Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500" />

        {/* Header & Logo */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Administrator Portal
          </div>

          <div 
            onClick={() => onNavigate('home')}
            className="w-14 h-14 rounded-2xl bg-slate-700/60 p-2 border border-slate-600 mx-auto flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
          >
            <img src={logoUrl} alt="SUREST PLUG" className="w-full h-full object-contain" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Administrator Login
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with authorized administrator credentials (<strong className="text-amber-300 font-mono">chinonsochinix@gmail.com</strong>)
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-red-400 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Authorization Error</span>
            </div>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Google Sign In Option */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-slate-600 bg-slate-700/80 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGoogleSubmitting ? 'Authenticating Admin...' : 'Sign In as Admin with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700 w-full" />
            <span className="bg-slate-800 px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute">
              or enter admin password
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Admin Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chinonsochinix@gmail.com"
                aria-label="Admin Email Address"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                aria-label="Admin Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Authenticating Admin...' : 'Authenticate & Access Admin Panel'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 flex items-center justify-between border-t border-slate-700/60 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Website
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            User Login
          </button>
        </div>

      </div>
    </div>
  );
};
