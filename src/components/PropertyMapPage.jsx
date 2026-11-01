import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, Layers, ChevronRight, ChevronDown, X, ExternalLink, 
  ArrowLeft, Check, Search, SlidersHorizontal, List, Map as MapIcon,
  Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Compass
} from 'lucide-react';
import { 
  MAP_AREAS, 
  PROPERTY_COORDINATES, 
  CURRENCY_OPTIONS,
  getPropertyCoordinates, 
  formatPriceShort 
} from '../data/mapData';

export default function PropertyMapPage({
  properties = [],
  favorites = [],
  onToggleFavorite,
  onNavigate,
  initialArea = 'all'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const popupsRef = useRef({});
  const currencyDropdownRef = useRef(null);

  // Filter States
  const [selectedAreaId, setSelectedAreaId] = useState(initialArea);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Responsive UI States
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop/tablet sidebar toggle
  const [mobileViewMode, setMobileViewMode] = useState('map'); // 'map' or 'list' on mobile

  // Current active currency object
  const activeCurrency = CURRENCY_OPTIONS.find(c => c.code === currencyCode) || CURRENCY_OPTIONS[0];

  // Selected area object
  const currentArea = MAP_AREAS.find(a => a.id === selectedAreaId) || MAP_AREAS[0];

  // Close currency dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter properties based on area, category, and search query
  const filteredProperties = properties.filter((prop) => {
    // Area filter
    if (selectedAreaId !== 'all') {
      const areaName = currentArea.name.toLowerCase();
      const propNeighborhood = (prop.neighborhood || '').toLowerCase();
      const propLocation = (prop.location || '').toLowerCase();
      const propCity = (prop.cityState || '').toLowerCase();
      
      const matchesArea = propNeighborhood.includes(areaName) || 
                          propLocation.includes(areaName) || 
                          propCity.includes(areaName) ||
                          (selectedAreaId === 'palm-jumeirah' && propLocation.includes('palm')) ||
                          (selectedAreaId === 'saadiyat-island' && propLocation.includes('saadiyat')) ||
                          (selectedAreaId === 'jumeirah-bay' && (propLocation.includes('jumeirah bay') || propLocation.includes('bulgari'))) ||
                          (selectedAreaId === 'difc' && propLocation.includes('difc')) ||
                          (selectedAreaId === 'downtown-dubai' && (propLocation.includes('downtown') || propLocation.includes('za\'abeel') || propLocation.includes('burj'))) ||
                          (selectedAreaId === 'business-bay' && propLocation.includes('business bay')) ||
                          (selectedAreaId === 'al-barari' && propLocation.includes('barari')) ||
                          (selectedAreaId === 'district-one' && propLocation.includes('district one')) ||
                          (selectedAreaId === 'bluewaters-island' && propLocation.includes('bluewaters'));
      if (!matchesArea) return false;
    }

    // Category filter
    if (selectedCategory !== 'All') {
      const market = (prop.marketCategory || '').toLowerCase();
      const cat = (prop.category || '').toLowerCase();
      const filterLower = selectedCategory.toLowerCase();

      if (filterLower === 'buy' && market !== 'buy') return false;
      if (filterLower === 'rent' && market !== 'rent') return false;
      if (filterLower === 'off-plan' && market !== 'off-plan') return false;
      if (filterLower === 'commercial' && market !== 'commercial') return false;
      if (!['buy', 'rent', 'off-plan', 'commercial'].includes(filterLower)) {
        if (!cat.includes(filterLower)) return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = prop.title.toLowerCase().includes(q) ||
                    prop.location.toLowerCase().includes(q) ||
                    prop.neighborhood.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Active property object (for mobile floating card and highlight)
  const activeProperty = properties.find(p => p.id === activePropertyId) || null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: currentArea.center,
      zoom: currentArea.zoom,
      zoomControl: false,
      scrollWheelZoom: true
    });

    // OpenStreetMap standard tile layer (matching the reference image)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom controls at top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size when sidebar opens/closes or mobile view toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [sidebarOpen, mobileViewMode]);

  // Update Markers whenever filteredProperties, currencyCode, or activePropertyId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};
    popupsRef.current = {};

    filteredProperties.forEach((property) => {
      const coords = getPropertyCoordinates(property.id);
      const isRent = property.marketCategory === 'rent' || (property.priceFormatted && property.priceFormatted.includes('/mo'));
      const shortPrice = formatPriceShort(property.price, isRent, currencyCode);
      const isActive = activePropertyId === property.id;

      // Custom HTML Marker matching user reference screenshot
      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div 
            id="marker-pin-${property.id}" 
            class="map-price-pin ${isActive ? 'is-active' : ''}"
          >
            ${shortPrice}
          </div>
        `,
        iconSize: [84, 36],
        iconAnchor: [42, 36]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(map);

      // Popup HTML matching screenshot layout
      const popupHtml = `
        <div class="flex items-center gap-3.5 p-3.5 min-w-[310px] sm:min-w-[340px] max-w-[360px] bg-white rounded-2xl relative select-none font-sans">
          <button 
            id="popup-close-${property.id}"
            type="button"
            class="absolute top-2.5 right-2.5 text-gray-400 hover:text-black w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[18px] leading-none cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
          
          <img 
            src="${property.images && property.images[0] ? property.images[0] : ''}" 
            alt="${property.title}" 
            class="w-24 h-22 sm:w-26 sm:h-24 object-cover rounded-xl shrink-0 border border-black/5 shadow-inner" 
          />
          
          <div class="flex-1 pr-4 min-w-0 text-left">
            <h4 class="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#C5A059] transition-colors cursor-pointer" id="popup-title-${property.id}">
              ${property.title}
            </h4>
            
            <div class="text-[14px] font-extrabold text-[#0F172A] mt-1 tracking-tight">
              Starting ${shortPrice}
            </div>
            
            <div class="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
              <span>${property.sqft ? property.sqft.toLocaleString() + ' ft²' : ''}</span>
              ${property.beds ? `<span>•</span><span>${property.beds} Beds</span>` : ''}
              <span>•</span>
              <span class="truncate max-w-[90px]">${property.neighborhood || ''}</span>
            </div>
            
            <button 
              id="popup-view-btn-${property.id}"
              type="button"
              class="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:text-[#C5A059] transition-colors cursor-pointer group"
            >
              <span>View Residence</span>
              <span class="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>
      `;

      const popup = L.popup({
        className: 'custom-property-popup',
        offset: [0, -32],
        closeButton: false,
        maxWidth: 380
      }).setContent(popupHtml);

      marker.bindPopup(popup);

      // Event listener for opening popup
      marker.on('click', () => {
        setActivePropertyId(property.id);
        marker.openPopup();
      });

      marker.on('popupopen', () => {
        // Wire up close button inside popup
        const closeBtn = document.getElementById(`popup-close-${property.id}`);
        if (closeBtn) {
          closeBtn.onclick = (e) => {
            e.stopPropagation();
            map.closePopup();
            setActivePropertyId(null);
          };
        }

        // Wire up detail navigation buttons
        const viewBtn = document.getElementById(`popup-view-btn-${property.id}`);
        const titleBtn = document.getElementById(`popup-title-${property.id}`);
        const handleOpenDetail = (e) => {
          e.stopPropagation();
          if (onNavigate) {
            onNavigate(`/property/${property.id}`);
          }
        };

        if (viewBtn) viewBtn.onclick = handleOpenDetail;
        if (titleBtn) titleBtn.onclick = handleOpenDetail;
      });

      markersRef.current[property.id] = marker;
      popupsRef.current[property.id] = popup;
    });
  }, [filteredProperties, currencyCode, activePropertyId]);

  // When selected area changes, fly to its coordinates
  const handleSelectArea = (areaId) => {
    setSelectedAreaId(areaId);
    setActivePropertyId(null);
    const targetArea = MAP_AREAS.find(a => a.id === areaId);
    if (targetArea && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(targetArea.center, targetArea.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  // Center on individual property when clicked from side list
  const handlePropertyCardClick = (property) => {
    setActivePropertyId(property.id);
    const coords = getPropertyCoordinates(property.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([coords.lat, coords.lng], 16, { duration: 1 });
      const marker = markersRef.current[property.id];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500);
      }
    }
    // On mobile switch to map view so the user sees the pin immediately
    if (window.innerWidth < 768) {
      setMobileViewMode('map');
    }
  };

  const categories = ['All', 'Buy', 'Rent', 'Off-Plan', 'Commercial'];

  // Filtered currency options for dropdown search
  const filteredCurrencies = CURRENCY_OPTIONS.filter(c => {
    if (!currencySearch.trim()) return true;
    const q = currencySearch.toLowerCase();
    return c.code.toLowerCase().includes(q) || 
           c.name.toLowerCase().includes(q) || 
           c.symbol.toLowerCase().includes(q);
  });

  return (
    <div className="w-full h-screen max-h-screen bg-[#F9F9F8] flex flex-col pt-[96px] sm:pt-[106px] md:pt-[116px] lg:pt-[124px] overflow-hidden select-none">
      
      {/* TOP HEADER CONTROLS BAR (Comfortable Spacing Below Floating Navbar) */}
      <section className="bg-white border-b border-black/10 px-3 sm:px-5 lg:px-6 py-3 sm:py-3.5 shadow-xs z-30 shrink-0">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Back Arrow + Title + Active Area Tag */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shrink-0"
              title="Return to Home"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-[15px] sm:text-[18px] font-bold text-gray-900 tracking-tight flex items-center gap-1.5 truncate">
                  <MapPin size={17} className="text-[#000000] shrink-0" />
                  <span className="hidden sm:inline">Map Residence Explorer</span>
                  <span className="sm:hidden">Map Explorer</span>
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black text-white shrink-0">
                  {filteredProperties.length}
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium truncate hidden md:block">
                {currentArea.name} &bull; {currentArea.tagline}
              </p>
            </div>
          </div>

          {/* Right: Currency Dropdown + Categories + Mobile Mode & Desktop Sidebar Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 1. CURRENCY CONVERTER DROPDOWN */}
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200/80 border border-gray-200 text-gray-900 px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
                title="Change Currency"
              >
                <span className="text-[14px]">{activeCurrency.flag}</span>
                <span className="font-semibold">{activeCurrency.code}</span>
                <span className="text-gray-500 text-[11px] hidden sm:inline">({activeCurrency.symbol})</span>
                <ChevronDown 
                  size={14} 
                  className={`text-gray-500 transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* CURRENCY DROPDOWN MENU */}
              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[260px] sm:w-[280px] bg-white border border-gray-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.22)] py-2 z-[9999] animate-fade-in">
                  <div className="px-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold">
                      Select Currency ({CURRENCY_OPTIONS.length})
                    </span>
                    <span className="text-[10px] text-gray-400">Live Rates</span>
                  </div>

                  {/* Currency Quick Search */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search currency..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-md pl-7 pr-2 py-1 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black"
                      />
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Currencies Scroll List */}
                  <div className="max-h-[260px] overflow-y-auto py-1 divide-y divide-gray-50">
                    {filteredCurrencies.map((curr) => {
                      const isSelected = currencyCode === curr.code;
                      return (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setCurrencyCode(curr.code);
                            setIsCurrencyDropdownOpen(false);
                            setCurrencySearch('');
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-amber-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-[16px]">{curr.flag}</span>
                            <div>
                              <div className="text-[12px] font-bold text-gray-900 flex items-center gap-1.5">
                                <span>{curr.code}</span>
                                <span className="text-gray-500 font-medium">({curr.symbol})</span>
                              </div>
                              <div className="text-[10px] text-gray-500 leading-none mt-0.5">
                                {curr.name}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check size={14} className="text-black font-bold shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. CATEGORY SELECTOR (Desktop/Tablet) */}
            <div className="hidden md:inline-flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-gray-950 shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 3. SIDEBAR COLLAPSE TOGGLE (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all border border-gray-200 cursor-pointer"
              title={sidebarOpen ? "Hide property panel to maximize map" : "Show property panel"}
            >
              {sidebarOpen ? (
                <>
                  <PanelLeftClose size={15} />
                  <span className="hidden lg:inline text-[11px]">Collapse List</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen size={15} />
                  <span className="hidden lg:inline text-[11px]">Show List</span>
                </>
              )}
            </button>

            {/* 4. MOBILE VIEW SWITCHER (Map vs List for screens < 768px) */}
            <div className="flex md:hidden bg-black text-white p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setMobileViewMode('map')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mobileViewMode === 'map' ? 'bg-white text-black shadow-xs' : 'text-white/80'
                }`}
              >
                <MapIcon size={12} />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('list')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mobileViewMode === 'list' ? 'bg-white text-black shadow-xs' : 'text-white/80'
                }`}
              >
                <List size={12} />
                <span>List ({filteredProperties.length})</span>
              </button>
            </div>

          </div>

        </div>

        {/* AREA FILTER HORIZONTAL PILLS SCROLL */}
        <div className="w-full mt-2.5 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
            <Layers size={11} />
            <span className="hidden sm:inline">Select Area:</span>
          </span>
          {MAP_AREAS.map((area) => {
            const isSelected = selectedAreaId === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectArea(area.id)}
                className={`text-[11px] sm:text-[12px] font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white shadow-xs font-bold scale-[1.02]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-gray-400'}`} />
                <span>{area.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN FULL-HEIGHT SPLIT WORKSPACE */}
      <div className="flex-1 min-h-0 w-full flex relative overflow-hidden">

        {/* LEFT PROPERTIES LIST SECTION (Fixed Width, Full Height, ONLY THIS SCROLLS) */}
        <div 
          className={`h-full flex flex-col bg-white border-r border-black/10 shrink-0 z-10 overflow-hidden transition-all duration-300 ${
            // Mobile: conditional on mobileViewMode
            mobileViewMode === 'list' ? 'w-full block' : 'hidden',
            // Tablet & Desktop: conditional on sidebarOpen
            sidebarOpen ? 'md:flex md:w-[340px] lg:w-[400px] xl:w-[440px]' : 'md:hidden'
          }`}
        >
          {/* Sidebar Top: Search & Category Filter (Mobile) */}
          <div className="p-3 border-b border-gray-100 bg-[#FBFBFA] shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-900 uppercase tracking-wider">
                {currentArea.name} Portfolio
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                {filteredProperties.length} available
              </span>
            </div>

            {/* Mobile Category Pills inside sidebar */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border transition-all ${
                    selectedCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search residences or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[12px] bg-white border border-gray-200 rounded-lg pl-8 pr-7 py-1.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* SCROLLABLE PROPERTIES CONTAINER (ONLY THIS SCROLLS) */}
          <div className="flex-1 min-h-0 h-full overflow-y-auto divide-y divide-gray-100 p-2.5 space-y-2.5">
            {filteredProperties.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-3">
                  <MapPin size={22} />
                </div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-1">
                  No residences in {currentArea.name}
                </h4>
                <p className="text-[12px] text-gray-500 mb-4 max-w-xs mx-auto">
                  Try switching area or clearing category filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectArea('all');
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-semibold bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  View All Areas
                </button>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isActive = activePropertyId === property.id;
                const isRent = property.marketCategory === 'rent' || (property.priceFormatted && property.priceFormatted.includes('/mo'));
                const shortPrice = formatPriceShort(property.price, isRent, currencyCode);

                return (
                  <div
                    key={property.id}
                    onClick={() => handlePropertyCardClick(property)}
                    className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 group ${
                      isActive 
                        ? 'bg-amber-50/70 border-black shadow-md ring-1 ring-black' 
                        : 'bg-white hover:bg-gray-50/90 border-gray-200/90 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-24 h-22 sm:w-28 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={property.images && property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-1 left-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-xs uppercase tracking-wider">
                        {property.marketCategory || 'Luxury'}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-black line-clamp-1 leading-snug">
                          {property.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {property.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10.5px] text-gray-600 font-medium my-0.5">
                        <span>{property.beds} Beds</span>
                        <span>&bull;</span>
                        <span>{property.baths} Baths</span>
                        <span>&bull;</span>
                        <span>{property.sqft ? property.sqft.toLocaleString() + ' sqft' : ''}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="text-[13px] font-extrabold text-black">
                          {shortPrice}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePropertyCardClick(property);
                            }}
                            className="text-[10px] font-semibold text-gray-600 hover:text-black px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-0.5"
                          >
                            <Compass size={11} />
                            <span>Locate</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) onNavigate(`/property/${property.id}`);
                            }}
                            className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Details</span>
                            <ExternalLink size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAP SECTION (Full Height & Full Available Width) */}
        <div 
          className={`flex-1 h-full min-h-0 relative z-0 ${
            mobileViewMode === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Leaflet Map DOM Element */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full min-h-full bg-slate-100" 
          />

          {/* Floating Map Hint / Guide at top-right (Desktop & Tablet) */}
          <div className="absolute top-4 right-4 z-[1000] hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-black/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-gray-800">
              Click price pins to view residence info
            </span>
          </div>

          {/* Floating Area Tag at bottom left (Desktop & Tablet) */}
          <div className="absolute bottom-5 left-5 z-[1000] bg-black/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl border border-white/10 hidden md:block">
            <div className="text-[10px] uppercase tracking-wider text-white/60 font-mono">
              Active Area
            </div>
            <div className="text-[13px] font-bold text-white flex items-center gap-2">
              <span>{currentArea.name}</span>
              <span className="text-amber-400 text-[11px]">
                ({filteredProperties.length} residences)
              </span>
            </div>
          </div>

          {/* Floating Mobile Bottom Card when property is selected */}
          {activeProperty && mobileViewMode === 'map' && (
            <div className="md:hidden absolute bottom-16 inset-x-3 z-[1000] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-gray-200 p-3 animate-fade-in">
              <button
                type="button"
                onClick={() => setActivePropertyId(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-black w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                &times;
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={activeProperty.images && activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="w-20 h-18 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-[12px] font-bold text-gray-900 leading-snug truncate">
                    {activeProperty.title}
                  </h4>
                  <div className="text-[13px] font-extrabold text-black mt-0.5">
                    {formatPriceShort(
                      activeProperty.price, 
                      activeProperty.marketCategory === 'rent' || (activeProperty.priceFormatted && activeProperty.priceFormatted.includes('/mo')),
                      currencyCode
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {activeProperty.sqft ? activeProperty.sqft.toLocaleString() + ' ft²' : ''} &bull; {activeProperty.beds} Beds
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(`/property/${activeProperty.id}`)}
                    className="mt-1.5 text-[11px] font-bold text-black underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>View Property Details</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Mobile View Switcher Pill at bottom center */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
            <button
              type="button"
              onClick={() => setMobileViewMode(mobileViewMode === 'map' ? 'list' : 'map')}
              className="bg-black text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-bold border border-white/20 active:scale-95 transition-transform"
            >
              {mobileViewMode === 'map' ? (
                <>
                  <List size={14} />
                  <span>View List ({filteredProperties.length})</span>
                </>
              ) : (
                <>
                  <MapIcon size={14} />
                  <span>View Map</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
