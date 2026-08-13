import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { LoadingGear } from '../components/common/LoadingGear';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (view: string) => void;
  onSuccess: (role: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onSuccess }) => {
  const { user, isLoading, signup, loginWithGoogle, settings } = useAuth();
  const logoUrl = settings?.logoUrl || "/logo.png";

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg(err.message || 'Google sign-up failed');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password input.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service to create an account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await signup(fullName.trim(), email.trim(), password, confirmPassword);
      const role = (newUser.role === 'admin' || newUser.email?.trim().toLowerCase() === 'chinonsochinix@gmail.com') ? 'admin' : 'user';
      onSuccess(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Branding */}
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
            Create Your SUREST PLUG Account
          </h2>
          <p className="text-xs text-slate-500">Join thousands of website buyers and developers</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Google Sign Up Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isGoogleSubmitting ? 'Signing up with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider absolute">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chinonso Okeke"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

            {/* Password strength bar */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className="font-bold text-slate-800">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded-xs text-blue-600 focus:ring-blue-500"
                required
              />
              <span>
                I agree to the <span className="font-bold text-blue-600">Terms of Service</span> and <span className="font-bold text-blue-600">Privacy Policy</span> of SUREST PLUG.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoadingGear size="sm" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-600">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-blue-600 hover:underline"
          >
            Log In
          </button>
        </div>

      </div>
    </div>
  );
};
