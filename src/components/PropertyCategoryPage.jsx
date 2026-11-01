import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, X, ArrowUpDown, MapPin, 
  Building2, Home, Key, Sparkles, Filter, ChevronRight,
  RotateCcw, Check, PhoneCall, ShieldCheck
} from 'lucide-react';
import PropertyCard from './PropertyCard';
import { PROPERTY_MARKET_CATEGORIES } from '../data/properties';

export default function PropertyCategoryPage({
  category = 'buy',
  properties = [],
  favorites = [],
  onToggleFavorite,
  onSelectProperty,
  onNavigate,
  onContactClick
}) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedBeds, setSelectedBeds] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset filters on category switch for fresh context
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedType('All');
    setSelectedPriceRange('All');
    setSelectedBeds('All');
    setSortBy('featured');
    setVisibleCount(6);
  }, [category]);

  // Reset pagination when active filter inputs change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedLocation, selectedType, selectedPriceRange, selectedBeds, sortBy]);

  // Current category metadata
  const currentCategoryMeta = useMemo(() => {
    return PROPERTY_MARKET_CATEGORIES.find(c => c.id === category) || PROPERTY_MARKET_CATEGORIES[0];
  }, [category]);

  // Base properties belonging to this category
  const baseCategoryProperties = useMemo(() => {
    return properties.filter(p => {
      if (category === 'buy') {
        return p.marketCategory === 'buy' || p.listingType === 'FOR SALE';
      }
      if (category === 'rent') {
        return p.marketCategory === 'rent' || p.listingType === 'FOR RENT';
      }
      if (category === 'off-plan') {
        return p.marketCategory === 'off-plan' || p.listingType === 'OFF-PLAN';
      }
      if (category === 'commercial') {
        return p.marketCategory === 'commercial' || p.listingType === 'COMMERCIAL';
      }
      return true;
    });
  }, [properties, category]);

  // Available unique locations for current category
  const availableLocations = useMemo(() => {
    const locs = new Set();
    baseCategoryProperties.forEach(p => {
      if (p.neighborhood) locs.add(p.neighborhood);
      else if (p.cityState) locs.add(p.cityState.split(',')[0].trim());
    });
    return ['All', ...Array.from(locs).sort()];
  }, [baseCategoryProperties]);

  // Available unique types for current category
  const availableTypes = useMemo(() => {
    const types = new Set();
    baseCategoryProperties.forEach(p => {
      if (p.category) types.add(p.category);
      if (p.commercialType) types.add(p.commercialType);
    });
    return ['All', ...Array.from(types).sort()];
  }, [baseCategoryProperties]);

  // Dynamic price ranges based on category
  const priceRangeOptions = useMemo(() => {
    if (category === 'rent') {
      return [
        { label: 'All Rates', value: 'All' },
        { label: 'Under $20,000 / mo', value: 'under-20k' },
        { label: '$20,000 – $35,000 / mo', value: '20k-35k' },
        { label: '$35,000+ / mo', value: 'above-35k' }
      ];
    }
    return [
      { label: 'All Prices', value: 'All' },
      { label: 'Under $15 Million', value: 'under-15m' },
      { label: '$15M – $25 Million', value: '15m-25m' },
      { label: '$25 Million & Above', value: 'above-25m' }
    ];
  }, [category]);

  // Filter application
  const filteredProperties = useMemo(() => {
    return baseCategoryProperties.filter(p => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesLoc = p.location?.toLowerCase().includes(q);
        const matchesCity = p.cityState?.toLowerCase().includes(q);
        const matchesType = p.propertyType?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
        const matchesHeadline = p.headline?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesCity && !matchesType && !matchesHeadline) {
          return false;
        }
      }

      // 2. Location
      if (selectedLocation !== 'All') {
        const pLoc = p.neighborhood || p.cityState || '';
        if (!pLoc.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 3. Property Sub-Type
      if (selectedType !== 'All') {
        const matchesCat = p.category === selectedType;
        const matchesComm = p.commercialType === selectedType;
        const matchesPropType = p.propertyType?.toLowerCase().includes(selectedType.toLowerCase());
        if (!matchesCat && !matchesComm && !matchesPropType) {
          return false;
        }
      }

      // 4. Price Range
      if (selectedPriceRange !== 'All') {
        if (category === 'rent') {
          if (selectedPriceRange === 'under-20k' && p.price >= 20000) return false;
          if (selectedPriceRange === '20k-35k' && (p.price < 20000 || p.price > 35000)) return false;
          if (selectedPriceRange === 'above-35k' && p.price < 35000) return false;
        } else {
          if (selectedPriceRange === 'under-15m' && p.price >= 15000000) return false;
          if (selectedPriceRange === '15m-25m' && (p.price < 15000000 || p.price > 25000000)) return false;
          if (selectedPriceRange === 'above-25m' && p.price < 25000000) return false;
        }
      }

      // 5. Bedrooms
      if (selectedBeds !== 'All' && category !== 'commercial') {
        const minBeds = parseInt(selectedBeds, 10);
        if (p.beds < minBeds) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'sqft-desc') return b.sqft - a.sqft;
      if (sortBy === 'beds-desc') return b.beds - a.beds;
      // Default: featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [baseCategoryProperties, searchQuery, selectedLocation, selectedType, selectedPriceRange, selectedBeds, sortBy, category]);

  // Check if any filter is active
  const hasActiveFilters = searchQuery !== '' || 
    selectedLocation !== 'All' || 
    selectedType !== 'All' || 
    selectedPriceRange !== 'All' || 
    selectedBeds !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedType('All');
    setSelectedPriceRange('All');
    setSelectedBeds('All');
    setSortBy('featured');
  };

  const getCategoryCount = (catId) => {
    return properties.filter(p => {
      if (catId === 'buy') return p.marketCategory === 'buy' || p.listingType === 'FOR SALE';
      if (catId === 'rent') return p.marketCategory === 'rent' || p.listingType === 'FOR RENT';
      if (catId === 'off-plan') return p.marketCategory === 'off-plan' || p.listingType === 'OFF-PLAN';
      if (catId === 'commercial') return p.marketCategory === 'commercial' || p.listingType === 'COMMERCIAL';
      return false;
    }).length;
  };

  return (
    <div className="w-full bg-[#FDFDFD] min-h-screen text-[#0A0A0C]">
      
      {/* 1. HERO & CATEGORY INTRO SECTION */}
      <section className="relative w-full bg-[#0A0A0C] text-white pt-36 pb-20 sm:pt-40 sm:pb-24 overflow-hidden border-b border-white/10">
        {/* Subtle architectural grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-white/50 mb-6 font-mono">
            <button 
              onClick={() => onNavigate('/')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-white/30" />
            <span className="text-white/70">Properties</span>
            <ChevronRight size={13} className="text-white/30" />
            <span className="text-white font-semibold capitalize">{category}</span>
          </div>

          {/* Eyebrow & Headline */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-widest text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Novalux Curated Portfolio</span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[54px] font-semibold text-white tracking-tight leading-[1.12] font-sans">
              {currentCategoryMeta.headline}
            </h1>

            <p className="text-[15px] sm:text-[17px] text-white/70 leading-[1.6] max-w-2xl font-normal">
              {currentCategoryMeta.description}
            </p>
          </div>

          {/* 4 CATEGORY SWITCHER TABS (Buy, Rent, Off-Plan, Commercial) */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-2 sm:gap-3 p-1.5 bg-white/10 backdrop-blur-md rounded-[12px] border border-white/10 w-fit">
            {PROPERTY_MARKET_CATEGORIES.map((tab) => {
              const isActive = tab.id === category;
              const count = getCategoryCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.path)}
                  className={`px-4 sm:px-5 py-2.5 rounded-[9px] text-[13px] sm:text-[14px] font-medium transition-all duration-200 flex items-center gap-2.5 select-none cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-md font-semibold scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black text-white' : 'bg-white/20 text-white'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. FILTER BAR & PROPERTY LISTINGS SECTION */}
      <section id="listings" className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-16 space-y-10">
        
        {/* ====================================================
            FILTER COMPONENT ON TOP OF THE LISTING SECTION
            ==================================================== */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-sm p-4 sm:p-6 space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${category} properties by name, area, or keywords...`}
                className="w-full pl-10 pr-10 py-3 bg-[#F9F9FB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#0A0A0C] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black p-1"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Location Filter */}
              <div className="relative min-w-[150px] flex-1 sm:flex-initial">
                <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1 tracking-wider">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-[#F9F9FB] border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[13px] text-[#0A0A0C] font-medium focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  {availableLocations.filter(loc => loc !== 'All').map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="relative min-w-[150px] flex-1 sm:flex-initial">
                <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1 tracking-wider">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-[#F9F9FB] border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[13px] text-[#0A0A0C] font-medium focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="All">All Types</option>
                  {availableTypes.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="relative min-w-[160px] flex-1 sm:flex-initial">
                <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1 tracking-wider">
                  Price Bracket
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full bg-[#F9F9FB] border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[13px] text-[#0A0A0C] font-medium focus:outline-none focus:border-black cursor-pointer"
                >
                  {priceRangeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms Filter (Only for Residential categories) */}
              {category !== 'commercial' && (
                <div className="relative min-w-[120px] flex-1 sm:flex-initial">
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1 tracking-wider">
                    Bedrooms
                  </label>
                  <select
                    value={selectedBeds}
                    onChange={(e) => setSelectedBeds(e.target.value)}
                    className="w-full bg-[#F9F9FB] border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[13px] text-[#0A0A0C] font-medium focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="All">Any Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                    <option value="5">5+ Beds</option>
                    <option value="6">6+ Beds</option>
                  </select>
                </div>
              )}

              {/* Sort Filter */}
              <div className="relative min-w-[160px] flex-1 sm:flex-initial">
                <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1 tracking-wider">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#F9F9FB] border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[13px] text-[#0A0A0C] font-medium focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="sqft-desc">Largest Sqft</option>
                  {category !== 'commercial' && <option value="beds-desc">Most Bedrooms</option>}
                </select>
              </div>

            </div>

          </div>

          {/* Active Filters Bar & Counter */}
          <div className="pt-3 border-t border-[#F1F3F5] flex flex-wrap items-center justify-between gap-3 text-[13px]">
            
            <div className="flex items-center gap-2 text-stone-600">
              <span className="font-semibold text-black">{filteredProperties.length}</span>
              <span>
                {filteredProperties.length === 1 ? 'residence' : 'properties'} found in {currentCategoryMeta.label}
              </span>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-[12px]">
                    Keyword: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-black">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-[12px]">
                    {selectedLocation}
                    <button onClick={() => setSelectedLocation('All')} className="hover:text-black">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedType !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-[12px]">
                    {selectedType}
                    <button onClick={() => setSelectedType('All')} className="hover:text-black">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedPriceRange !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-[12px]">
                    Price Filter Active
                    <button onClick={() => setSelectedPriceRange('All')} className="hover:text-black">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedBeds !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-[12px]">
                    {selectedBeds}+ Beds
                    <button onClick={() => setSelectedBeds('All')} className="hover:text-black">
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600 hover:text-red-700 ml-1 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              </div>
            )}

          </div>

        </div>

        {/* 3. PROPERTY GRID */}
        {filteredProperties.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.slice(0, visibleCount).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProperty={onSelectProperty}
                />
              ))}
            </div>

            {/* Load More Button Block */}
            {visibleCount < filteredProperties.length ? (
              <div className="pt-4 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  onClick={() => {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount((prev) => prev + 6);
                      setIsLoadingMore(false);
                    }, 350);
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#111827] hover:bg-[#27272A] active:scale-[0.98] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading Residences...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Properties</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                        +{Math.min(6, filteredProperties.length - visibleCount)}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-xs text-stone-500 font-mono">
                  Showing {Math.min(visibleCount, filteredProperties.length)} of {filteredProperties.length} residences
                </p>
              </div>
            ) : filteredProperties.length > 6 ? (
              <div className="pt-4 text-center">
                <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                  All {filteredProperties.length} residences displayed
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] py-16 px-6 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <Filter size={24} />
            </div>
            <h3 className="text-[20px] font-semibold text-[#0A0A0C]">
              No properties match your filter selection
            </h3>
            <p className="text-[14px] text-stone-500 max-w-md mx-auto">
              We couldn't find any {category} properties matching your specific criteria. Try adjusting your search keyword, location, or price filters.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-black text-white rounded-[8px] text-[14px] font-medium hover:bg-stone-800 transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* 4. PRIVATE CONSULTATION ADVISORY BANNER */}
        <div className="mt-16 bg-[#000000] text-white rounded-[20px] p-8 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/10">
          <div className="space-y-2.5 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 text-white/60 text-[12px] uppercase font-mono tracking-wider">
              <ShieldCheck size={16} className="text-white" />
              <span>Off-Market Acquisitions & Advisory</span>
            </div>
            <h3 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-white">
              Seeking Exclusive or Off-Market {currentCategoryMeta.label} Inventory?
            </h3>
            <p className="text-[14px] sm:text-[15px] text-white/70 leading-[1.6]">
              Due to owner confidentiality, a significant portion of our ultra-luxury residences and commercial assets remain strictly off-market. Connect with our senior advisory desk for discreet access.
            </p>
          </div>

          <div className="shrink-0 z-10">
            <button
              type="button"
              onClick={onContactClick}
              className="px-8 py-3.5 bg-white text-black text-[14px] font-semibold rounded-[8px] hover:bg-stone-200 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <PhoneCall size={16} />
              Speak with an Advisor
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
