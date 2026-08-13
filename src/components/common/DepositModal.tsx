import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import {
  X,
  Building2,
  Copy,
  Check,
  Wallet,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
  const { settings, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const currency = settings?.currency || '₦';

  const bank = settings?.bankDetails || {
    bankName: 'Opay Bank',
    accountNumber: '8141853557',
    accountName: 'chinonso monday',
    instructions: 'Transfer your deposit amount to the Opay Bank account above. Enter your transfer reference number below to submit.'
  };

  const [amount, setAmount] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<string>('Manual Bank Transfer');
  const [reference, setReference] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  
  const [copiedAcc, setCopiedAcc] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bank.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg(`Please enter a valid deposit amount greater than ${currency}0.`);
      return;
    }

    if (!reference.trim()) {
      setErrorMsg('Please enter your transaction reference or sender name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitDeposit({
        amount: numericAmount,
        paymentMethod,
        reference: reference.trim(),
        proofNote: proofNote.trim()
      });

      setSuccessMsg('Deposit request submitted! Our admin team will verify and credit your balance shortly.');
      showSuccess(`Deposit request of ${currency}${numericAmount.toLocaleString()} submitted successfully! Admin will verify and credit your wallet.`, 'Deposit Submitted');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Deposit submission failed');
      showError(err.message || 'Deposit submission failed', 'Deposit Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fund Account Balance</h3>
              <p className="text-xs text-slate-500">Available: <span className="font-bold text-slate-800">{currency}{user?.balance.toLocaleString() || '0'}</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Bank Instructions Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-600" />
              Official Bank Deposit Account
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Bank Name</span>
                <span className="text-xs font-bold text-slate-900">{bank.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Account Name</span>
                <span className="text-xs font-bold text-slate-900">{bank.accountName}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-blue-600">{bank.accountNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {bank.instructions}
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Deposit Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
              <input
                type="number"
                step="1"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5000"
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              {['5000', '10000', '25000', '50000'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-slate-700"
                >
                  +{currency}{parseInt(val).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white"
            >
              <option value="Manual Bank Transfer">Manual Bank Transfer</option>
              <option value="Direct Wire / Swift">Direct Wire / Swift</option>
              <option value="Online Bank Deposit">Online Bank Deposit</option>
            </select>
          </div>

          {/* Transaction Reference */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Transaction Reference / Sender Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900"
              placeholder="e.g. TRF-902148 / Account: Chinonso O."
              required
            />
          </div>

          {/* Proof / Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Additional Details / Payment Proof Note (Optional)
            </label>
            <textarea
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
              placeholder="e.g. Transferred from Access Bank around 10:30 AM"
            />
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Deposit Request'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
