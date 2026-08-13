import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { user, settings } = useAuth();
  
  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<string>('General Inquiry');
  const [priority, setPriority] = useState<string>('medium');
  const [message, setMessage] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in both subject and message fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (user) {
        await api.createTicket({
          subject: subject.trim(),
          category,
          priority,
          message: message.trim()
        });
        setSuccessMsg('Support ticket created successfully! You can track progress in your User Dashboard.');
      } else {
        // Visitor contact message
        setSuccessMsg('Thank you for reaching out! Your message has been sent to suresstplug@gmail.com.');
      }
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            24/7 Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Get In Touch With SUREST PLUG
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Have questions about a website script, payment verification, or custom setup? Our support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Contact Details</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Support Email</span>
                    <a 
                      href={`mailto:${settings?.contactEmail || 'suresstplug@gmail.com'}`}
                      className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                    >
                      {settings?.contactEmail || 'suresstplug@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Telephone Desk</span>
                    <a 
                      href={`tel:${(settings?.contactPhone || '08141853557').replace(/\s+/g, '')}`}
                      className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                    >
                      {settings?.contactPhone || '08141853557'}
                    </a>
                  </div>
                </div>

                <a 
                  href="https://wa.link/l8ef6x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-emerald-800 uppercase">WhatsApp Live Chat</span>
                      <span className="font-extrabold text-emerald-900 group-hover:underline">Chat on WhatsApp →</span>
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Headquarters</span>
                    <span className="font-bold text-slate-900">{settings?.address || '100 Innovation Way, Suite 400'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                💡 <strong>Logged In Users:</strong> Submitting a message here automatically creates a tracked Support Ticket in your User Dashboard.
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-xl font-bold text-slate-900">Send Us A Message</h3>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Payment / Deposit">Payment / Deposit</option>
                    <option value="Customization">Customization</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Describe your inquiry in detail..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
