import React, { useEffect, useState } from 'react';
import { Website, Category } from '../types';
import { api } from '../api/client';
import { WebsiteCard } from '../components/common/WebsiteCard';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Sparkles,
  X,
  Tag,
  ArrowUpDown
} from 'lucide-react';

interface MarketplacePageProps {
  onOpenWebsiteDetail: (website: Website) => void;
  onBuyNow: (website: Website) => void;
  userPurchasedIds?: string[];
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onOpenWebsiteDetail,
  onBuyNow,
  userPurchasedIds = []
}) => {
  const { user, settings } = useAuth();
  const currency = settings?.currency || '₦';
  const [websites, setWebsites] = useState<Website[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (onlyFeatured) params.featured = 'true';
      if (sortOption) params.sort = sortOption;

      const res = await api.getWebsites(params);
      setWebsites(res.websites);
    } catch (err) {
      console.error('Error fetching marketplace websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWebsites();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, onlyFeatured, sortOption]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setOnlyFeatured(false);
    setSortOption('newest');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Digital Website Marketplace
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore {websites.length} verified ready-to-launch website packages and scripts.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <Tag className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">
              Showing {websites.length} Results
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          {/* Top Row: Search + Category + View Mode */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, technology (e.g. React, Node), description..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Toggle Grid/List */}
            <div className="md:col-span-1 flex items-center justify-end gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl border transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Row: Price Range & Featured Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs w-full max-w-full min-w-0">
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full min-w-0">
              <span className="font-bold text-slate-700 whitespace-nowrap">Price ($):</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-16 sm:w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-16 sm:w-20 px-2 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 whitespace-nowrap bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="rounded-xs text-blue-600 focus:ring-blue-500"
                />
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Featured Only</span>
              </label>
            </div>

            {(searchQuery || selectedCategory !== 'All' || minPrice || maxPrice || onlyFeatured) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 shrink-0 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

        </div>

        {/* Website Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : websites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No websites found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any website listings matching your search or filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((web) => (
              <WebsiteCard
                key={web.id}
                website={web}
                isPurchased={userPurchasedIds.includes(web.id)}
                onViewDetails={onOpenWebsiteDetail}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {websites.map((web) => (
              <div
                key={web.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6"
              >
                <img
                  src={web.previewImage}
                  alt={web.title}
                  className="w-full sm:w-48 h-32 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {web.category}
                    </span>
                    {web.featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{web.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{web.description}</p>
                </div>

                <div className="text-right shrink-0 space-y-3 w-full sm:w-auto">
                  <span className="text-2xl font-black text-blue-600 block">{currency}{web.price.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenWebsiteDetail(web)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onBuyNow(web)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
