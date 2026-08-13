import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { user, settings } = useAuth();
  const logoUrl = settings?.logoUrl || "/logo.png";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate(user ? 'dashboard' : 'home')}
              className="flex items-center gap-3 cursor-pointer inline-flex"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 p-1 flex items-center justify-center border border-blue-500/30">
                <img 
                  src={logoUrl} 
                  alt="SUREST PLUG" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                SUREST<span className="text-blue-500">PLUG</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {settings?.description || 'Your premier marketplace for pre-built, production-grade, ready-to-launch websites and digital web solutions.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>100% Verified Quality & Instant Digital File Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate(user ? 'dashboard' : 'home')} className="hover:text-blue-400 transition-colors">
                  {user ? 'Dashboard' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-blue-400 transition-colors">
                  Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-blue-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Investment', 'SMM', 'Portfolio', 'Real Estate', 'Finance', 'Blog'].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => onNavigate('marketplace')} 
                    className="hover:text-blue-400 transition-colors"
                  >
                    {cat} Websites
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Customer Support</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a 
                  href={`mailto:${settings?.contactEmail || 'suresstplug@gmail.com'}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {settings?.contactEmail || 'suresstplug@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a 
                  href={`tel:${(settings?.contactPhone || '08141853557').replace(/\s+/g, '')}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {settings?.contactPhone || '08141853557'}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings?.address || '100 Innovation Way, Tech Plaza'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SUREST PLUG. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-300">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-300">
              Help Center
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
