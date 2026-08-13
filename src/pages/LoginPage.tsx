import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { LoadingGear } from '../components/common/LoadingGear';
import { Eye, EyeOff, Lock, Mail, ArrowRight, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  onSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  const { user, isLoading, login, loginWithGoogle, resetPassword, settings } = useAuth();
  const logoUrl = settings?.logoUrl || "/logo.png";

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password modal state
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isLoading) {
      const role = (user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') ? 'admin' : 'user';
      onSuccess(role);
    }
  }, [user, isLoading, onSuccess]);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        const role = (user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') ? 'admin' : 'user';
        onSuccess(role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const role = (user.role === 'admin' || user.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') ? 'admin' : 'user';
      onSuccess(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    setResetSuccessMsg(null);

    if (!resetEmail.trim()) {
      setResetErrorMsg('Please enter your email address.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetSuccessMsg('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setResetErrorMsg(err.message || 'Unable to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => onNavigate('home')}
            className="w-12 h-12 rounded-2xl bg-blue-50 p-1.5 border border-blue-100 mx-auto flex items-center justify-center cursor-pointer"
          >
            <img 
              src={logoUrl} 
              alt="SUREST PLUG" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back to SUREST PLUG
          </h2>
          <p className="text-xs text-slate-500">Sign in to manage your websites, orders, and balance</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGoogleSubmitting ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider absolute">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                aria-label="Email Address"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || '');
                  setResetSuccessMsg(null);
                  setResetErrorMsg(null);
                  setShowResetModal(true);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-xs text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <LoadingGear size="sm" />
                Signing In...
              </>
            ) : (
              <>
                Log In To Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-600">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Sign Up
          </button>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reset Password</h3>
                <p className="text-xs text-slate-500">We will send a password reset link to your email</p>
              </div>
            </div>

            {resetSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {resetErrorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {resetErrorMsg}
              </div>
            )}

            <form onSubmit={handleSendResetEmail} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Account Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
