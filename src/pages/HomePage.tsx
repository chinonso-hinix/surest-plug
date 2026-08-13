import React, { useEffect, useState } from 'react';
import { Website, Category } from '../types';
import { api } from '../api/client';
import { WebsiteCard } from '../components/common/WebsiteCard';
import { WebsiteDetailModal } from '../components/common/WebsiteDetailModal';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Headphones,
  DollarSign,
  Smartphone,
  Search,
  Globe,
  Star,
  Users
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onOpenWebsiteDetail: (website: Website) => void;
  onBuyNow: (website: Website) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenWebsiteDetail,
  onBuyNow
}) => {
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [webRes, catRes] = await Promise.all([
          api.getWebsites({ featured: 'true' }),
          api.getCategories()
        ]);
        setFeaturedWebsites(webRes.websites);
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white text-slate-800 space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200/80 pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>#1 Premium Digital Website Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Find Your Next <br className="hidden sm:inline" />
                <span className="text-blue-600">Ready-To-Launch</span> Website
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover professionally designed, fully functional websites ready to customize, launch, and own. Instant file downloads with complete source access.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-5 h-5" />
                  Browse Websites
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-base flex items-center justify-center gap-2 transition-all"
                >
                  Create Account
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span className="block text-2xl font-extrabold text-slate-900">100+</span>
                  <span className="text-xs text-slate-500 font-medium">Ready Templates</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-slate-900">Instant</span>
                  <span className="text-xs text-slate-500 font-medium">ZIP Download</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-blue-600">Verified</span>
                  <span className="text-xs text-slate-500 font-medium">Code Quality</span>
                </div>
              </div>
            </div>

            {/* Right hand side image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-none">
                <img
                  src="https://www.image2url.com/r2/default/images/1786331328277-c5023d42-9af9-4b08-944c-32259685a38b.png"
                  alt="Surest Plug Website Marketplace"
                  className="w-full h-auto object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Browse By Category
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Find specialized website templates built specifically for your business niche.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('marketplace')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FEATURED WEBSITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Hand-Picked Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Ready Websites
            </h2>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Explore All Listings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWebsites.slice(0, 6).map((web) => (
              <WebsiteCard
                key={web.id}
                website={web}
                onViewDetails={onOpenWebsiteDetail}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Surest Plug Works
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Get your website up and running in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Browse Marketplace</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore our catalog of verified websites, preview live demos, examine features and technology stacks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Purchase Securely</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fund your account balance and complete your purchase instantly with one click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Get Your Website</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instantly download full source files, database scripts, and deployment guides from your dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE SUREST PLUG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Choose Surest Plug
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Built for developers, agency owners, marketers, and entrepreneurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
              title: 'Quality Websites',
              desc: 'Every listed website is tested, clean, well-documented, and error-free before publishing.'
            },
            {
              icon: <Zap className="w-6 h-6 text-blue-600" />,
              title: 'Instant Access',
              desc: 'No waiting time. Downloads are unlocked immediately upon successful payment verification.'
            },
            {
              icon: <Lock className="w-6 h-6 text-blue-600" />,
              title: 'Secure Payments',
              desc: 'Protected financial system with full transaction logs and balance tracking.'
            },
            {
              icon: <Headphones className="w-6 h-6 text-blue-600" />,
              title: 'Professional Support',
              desc: 'Dedicated support ticket desk to assist you with installation and setup queries.'
            },
            {
              icon: <DollarSign className="w-6 h-6 text-blue-600" />,
              title: 'Affordable Pricing',
              desc: 'Premium quality website scripts priced fairly with single-use and commercial rights.'
            },
            {
              icon: <Smartphone className="w-6 h-6 text-blue-600" />,
              title: 'Mobile-Friendly Websites',
              desc: 'All templates feature responsive layouts that render smoothly on mobile, tablet, and desktop.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-blue-600 text-white p-8 sm:p-14 overflow-hidden shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready To Launch Your Website Today?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Join thousands of satisfied creators and businesses buying pre-built digital assets on SUREST PLUG.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-600 font-extrabold text-sm hover:bg-blue-50 transition-colors shadow-md"
            >
              Get Started Free
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-700 text-white border border-blue-400/50 font-bold text-sm hover:bg-blue-800 transition-colors"
            >
              Explore Catalog
            </button>
          </div>

          {/* Background circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500 rounded-full blur-2xl opacity-50 pointer-events-none" />
        </div>
      </section>

    </div>
  );
};
