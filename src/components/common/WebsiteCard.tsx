import React from 'react';
import { Website } from '../../types';
import { ExternalLink, ShoppingCart, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WebsiteCardProps {
  website: Website;
  isPurchased?: boolean;
  onViewDetails: (website: Website) => void;
  onBuyNow: (website: Website) => void;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  isPurchased = false,
  onViewDetails,
  onBuyNow
}) => {
  const { settings } = useAuth();
  const currency = settings?.currency || '₦';
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Thumbnail & Badges */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
        <img
          src={website.previewImage}
          alt={website.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-medium text-xs tracking-wide shadow-xs flex items-center gap-1">
            <Tag className="w-3 h-3 text-blue-400" />
            {website.category}
          </span>

          {website.featured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white font-bold text-xs tracking-wide shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Live Demo Quick Link on Hover */}
        {website.demoUrl && (
          <a
            href={website.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 font-semibold text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-md"
          >
            Live Demo
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </a>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 
              onClick={() => onViewDetails(website)}
              className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
            >
              {website.title}
            </h3>
            <span className="text-lg font-extrabold text-blue-600 shrink-0">
              {currency}{website.price.toLocaleString()}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {website.description}
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5">
            {website.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {tech}
              </span>
            ))}
            {website.technologies.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                +{website.technologies.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(website)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors text-center"
          >
            View Details
          </button>

          {isPurchased ? (
            <button
              onClick={() => onViewDetails(website)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Purchased
            </button>
          ) : (
            <button
              onClick={() => onBuyNow(website)}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
