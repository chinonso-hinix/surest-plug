import React, { useState } from 'react';
import { Website } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ExternalLink,
  ShoppingCart,
  CheckCircle2,
  Download,
  Sparkles,
  ShieldCheck,
  Code2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface WebsiteDetailModalProps {
  website: Website | null;
  isPurchased?: boolean;
  onClose: () => void;
  onPurchase: (website: Website) => Promise<void>;
  onDownload: (websiteId: string) => Promise<void>;
  onDepositRequired?: () => void;
}

export const WebsiteDetailModal: React.FC<WebsiteDetailModalProps> = ({
  website,
  isPurchased = false,
  onClose,
  onPurchase,
  onDownload,
  onDepositRequired
}) => {
  if (!website) return null;

  const { user, settings } = useAuth();
  const currency = settings?.currency || '₦';
  const [selectedImg, setSelectedImg] = useState<string>(website.previewImage);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const images = [website.previewImage, ...(website.gallery || [])].filter((v, i, a) => a.indexOf(v) === i);

  const handleBuyClick = async () => {
    setErrorMsg(null);
    if (!user) {
      setErrorMsg('Please log in or create an account to purchase websites.');
      return;
    }

    if (user.balance < website.price) {
      setErrorMsg(`Insufficient balance (${currency}${user.balance.toLocaleString()} available). Please fund your balance.`);
      if (onDepositRequired) {
        setTimeout(onDepositRequired, 1500);
      }
      return;
    }

    setIsBuying(true);
    try {
      await onPurchase(website);
    } catch (err: any) {
      setErrorMsg(err.message || 'Purchase failed');
    } finally {
      setIsBuying(false);
    }
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownload(website.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              {website.category}
            </span>
            {website.featured && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured Listing
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
              <span>{errorMsg}</span>
              {user && user.balance < website.price && onDepositRequired && (
                <button
                  onClick={onDepositRequired}
                  className="ml-3 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-red-700"
                >
                  Deposit Now
                </button>
              )}
            </div>
          )}

          {/* Top Title & Price Grid */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {website.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ID: <span className="font-mono text-slate-700">{website.id}</span> • Instant Source Package Delivery
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-xs font-medium text-slate-500 uppercase">One-Time License</span>
                <span className="text-3xl font-black text-blue-600">{currency}{website.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Image Gallery Viewer */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-200">
              <img
                src={selectedImg}
                alt={website.title}
                className="w-full h-full object-cover"
              />
              {website.demoUrl && (
                <a
                  href={website.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  View Live Website Demo
                </a>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImg === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Website Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {website.description}
            </p>
          </div>

          {/* Key Features & Tech Stack Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Features Included
              </h3>
              <ul className="space-y-2">
                {website.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                Technologies & Architecture
              </h3>
              <div className="flex flex-wrap gap-2">
                {website.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                    {tech}
                  </span>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  What You Receive Upon Purchase
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Full source code & static assets bundle</li>
                  <li>Database schema / setup migration scripts</li>
                  <li>Installation guide (INSTALL.md)</li>
                  <li>Direct download link in My Purchases</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Secure Instant Purchase via Your Account Balance</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {website.demoUrl && (
              <a
                href={website.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 text-center flex items-center justify-center gap-2"
              >
                Live Preview
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {isPurchased ? (
              <button
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Preparing Download...' : 'Download Website Files'}
              </button>
            ) : (
              <button
                onClick={handleBuyClick}
                disabled={isBuying}
                className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                {isBuying ? 'Processing Purchase...' : `Purchase Now (${currency}${website.price.toLocaleString()})`}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
