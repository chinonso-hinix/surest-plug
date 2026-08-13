import React from 'react';
import { ShieldCheck, Target, Award, Users, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            About SUREST PLUG
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Empowering Digital Creators & Business Owners
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            SUREST PLUG is a premier marketplace for pre-built, production-ready, fully functional websites and web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We eliminate the months of costly custom development needed to launch a digital project. We provide high quality, bug-free, mobile-first website templates and scripts that you can own and deploy in minutes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Quality Standard</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every website listed on SUREST PLUG undergoes strict manual testing, code review, responsiveness checks, and security audits to guarantee premium standards for our buyers.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-xl font-bold text-slate-900 text-center">What Sets Us Apart</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <span className="text-3xl font-black text-blue-600">100%</span>
              <p className="text-xs font-bold text-slate-800">Verified Quality</p>
              <p className="text-xs text-slate-500">Every script is thoroughly verified by expert developers.</p>
            </div>
            <div className="text-center space-y-2">
              <span className="text-3xl font-black text-blue-600">24/7</span>
              <p className="text-xs font-bold text-slate-800">Dedicated Support Desk</p>
              <p className="text-xs text-slate-500">Submit support tickets anytime for technical help.</p>
            </div>
            <div className="text-center space-y-2">
              <span className="text-3xl font-black text-blue-600">Instant</span>
              <p className="text-xs font-bold text-slate-800">Source File Access</p>
              <p className="text-xs text-slate-500">Download complete ZIP packages immediately upon payment.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
