import React, { useState } from 'react';
import { Mail, CheckCircle2, Copy, Check, Download, ExternalLink, X, ShieldCheck, Clock } from 'lucide-react';
import { MockEmail } from '../../types';

interface MockEmailModalProps {
  email: MockEmail | null;
  onClose: () => void;
  onNavigatePurchases?: () => void;
}

export const MockEmailModal: React.FC<MockEmailModalProps> = ({ email, onClose, onNavigatePurchases }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'formatted' | 'plain'>('formatted');

  if (!email) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(email.textBody || email.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${email.subject}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${email.subject}</h2>
              <p><strong>From:</strong> ${email.from}</p>
              <p><strong>To:</strong> ${email.toName} &lt;${email.toEmail}&gt;</p>
              <p><strong>Date:</strong> ${new Date(email.createdAt).toLocaleString()}</p>
            </div>
            <div>${email.htmlBody}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <Mail className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">Email Receipt Dispatched</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Simulated Dispatch
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                A purchase confirmation email was sent to <strong className="text-white">{email.toEmail}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Email Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Client Header Box */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 w-12 shrink-0">From:</span>
              <span className="font-semibold text-slate-800">{email.from}</span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(email.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 w-12 shrink-0">To:</span>
            <span className="font-medium text-slate-700">{email.toName} &lt;{email.toEmail}&gt;</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
            <span className="font-bold text-slate-500 w-12 shrink-0">Subject:</span>
            <span className="font-bold text-slate-900 text-sm">{email.subject}</span>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="bg-white px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('formatted')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeView === 'formatted' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formatted HTML
            </button>
            <button
              onClick={() => setActiveView('plain')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeView === 'plain' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plain Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>

        {/* Email Body Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto grow max-h-[50vh] bg-slate-50/50">
          {activeView === 'formatted' ? (
            <div 
              className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs"
              dangerouslySetInnerHTML={{ __html: email.htmlBody }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 bg-white p-4 rounded-2xl border border-slate-200">
              {email.textBody}
            </pre>
          )}
        </div>

        {/* Footer Quick Action Bar */}
        <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Purchase Receipt • SUREST PLUG Automated System</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigatePurchases && (
              <button
                onClick={() => {
                  onClose();
                  onNavigatePurchases();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                Go to My Purchases
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
