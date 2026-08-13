import React from 'react';
import { Search, ShoppingBag, Download, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How SUREST PLUG Works
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Acquiring, customizing, and launching your dream website has never been easier or faster.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-lg">
              01
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Browse & Preview Websites
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore our extensive marketplace catalog. Filter by business category, technology stack (React, Node, Vue, PHP, Tailwind), or price range. View interactive live demos to test functionality before purchasing.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-lg">
              02
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Fund Balance & Purchase
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create a free account and fund your wallet balance via our secure Manual Bank Funding gateway. Click "Buy Now" on your desired website listing for instant server-verified purchase authorization.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-lg">
              03
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download Files & Deploy
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your purchased website anytime under "My Purchases". Download full source packages (ZIP), database schemas, environment variable templates, and step-by-step setup guides to deploy to your hosting server.
              </p>
            </div>
          </div>

        </div>

        {/* CTA Banner */}
        <div className="bg-blue-600 text-white p-8 rounded-3xl text-center space-y-4">
          <h2 className="text-2xl font-extrabold">Ready to find your website?</h2>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-8 py-3.5 rounded-xl bg-white text-blue-600 font-extrabold text-sm hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Go To Marketplace
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
