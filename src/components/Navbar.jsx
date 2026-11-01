import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ChevronDown, ChevronRight,
  Home, Key, Building, Building2, MapPin
} from 'lucide-react';

export default function Navbar({
  onContactClick,
  onFavoritesClick,
  favoriteCount = 0,
  currentPath = '/',
  onNavigate
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [mobilePropertiesExpanded, setMobilePropertiesExpanded] = useState(true);

  const lastScrollYRef = useRef(0);
  const dropdownTimerRef = useRef(null);

  // Property Dropdown 4 Categories
  const propertyCategories = [
    {
      title: 'Buy',
      badge: 'For Sale',
      badgeColor: 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30',
      description: 'Private estates, beachfront villas & penthouses',
      href: '/properties/buy',
      icon: Home
    },
    {
      title: 'Rent',
      badge: 'For Lease',
      badgeColor: 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/30',
      description: 'Serviced sky palaces & luxury long-term leases',
      href: '/properties/rent',
      icon: Key
    },
    {
      title: 'Off-Plan',
      badge: 'New Launch',
      badgeColor: 'text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/30',
      description: 'Bugatti, Armani & Cavalli branded towers',
      href: '/properties/off-plan',
      icon: Building
    },
    {
      title: 'Commercial',
      badge: 'Trophy Assets',
      badgeColor: 'text-[#14B8A6] bg-[#14B8A6]/10 border-[#14B8A6]/30',
      description: 'DIFC corporate floors & luxury retail flagships',
      href: '/properties/commercial',
      icon: Building2
    }
  ];

  const handleMouseEnterDropdown = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setPropertyDropdownOpen(true);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setPropertyDropdownOpen(false);
    }, 180);
  };

  // Scroll direction detection logic
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      const threshold = 12; // Scroll tolerance threshold

      if (currentScrollY <= 50) {
        setIsVisible(true);
        setIsScrollingDown(false);
      } else if (Math.abs(delta) >= threshold) {
        if (delta > 0) {
          setIsVisible(false);
          setIsScrollingDown(true);
          setPropertyDropdownOpen(false);
        } else {
          setIsVisible(true);
          setIsScrollingDown(false);
        }
        lastScrollYRef.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setPropertyDropdownOpen(false);

    if (link.isRoute || link.href.startsWith('/')) {
      if (onNavigate) {
        onNavigate(link.href);
      } else {
        window.history.pushState({}, '', link.href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    if (link.href.startsWith('#')) {
      if (currentPath !== '/') {
        if (onNavigate) {
          onNavigate('/', () => {
            setTimeout(() => {
              const target = document.querySelector(link.href);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          });
        }
      } else {
        const target = document.querySelector(link.href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isAgentsActive = currentPath === '/agents' || currentPath.startsWith('/agents/');
  const isPropertiesActive = currentPath.startsWith('/properties') ||
    currentPath === '/buy' || currentPath === '/rent' ||
    currentPath === '/off-plan' || currentPath === '/commercial';
  const isMapActive = currentPath === '/map' || currentPath === '/map/' || currentPath.startsWith('/map');
  const isSellActive = currentPath === '/sell' || currentPath === '/sell/' || currentPath.startsWith('/sell');
  const isAboutActive = currentPath === '/about' || currentPath === '/about/' || currentPath.startsWith('/about');
  const isContactActive = currentPath === '/contact' || currentPath === '/contact/';

  return (
    <>
      {/* FLOATING TOP NAVIGATION BAR CONTAINER */}
      <header
        className="fixed top-4 sm:top-5 md:top-6 left-0 right-0 z-[9999] pointer-events-none"
        style={{
          transform: isVisible || mobileMenuOpen ? 'translateY(0%)' : 'translateY(-120%)',
          opacity: isVisible || mobileMenuOpen ? 1 : 0,
          transition: isVisible || mobileMenuOpen
            ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out',
          willChange: 'transform, opacity'
        }}
      >
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-48px)] lg:w-[calc(100%-64px)] xl:w-[calc(100%-80px)] 2xl:w-[calc(100%-96px)] mx-auto pointer-events-auto">
          <div className="bg-[#000000] border border-white/10 rounded-[14px] sm:rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.45)] px-6 sm:px-8 lg:px-10 py-[14px] sm:py-[16px] relative flex items-center justify-between transition-all duration-300">

            {/* Left Alignment: Brand Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/');
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[22px] sm:text-[24px] font-sans font-medium text-[#FFFFFF] tracking-tight hover:opacity-90 transition-opacity select-none cursor-pointer z-10"
            >
              Novalux
            </a>

            {/* Center Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-[24px] xl:gap-[32px] absolute left-1/2 -translate-x-1/2">

              {/* 1. Agents */}
              <a
                href="/agents"
                onClick={(e) => handleNavClick(e, { label: 'Agents', href: '/agents', isRoute: true })}
                className={`group relative text-[14px] xl:text-[15px] font-normal transition-opacity duration-200 py-1 ${isAgentsActive ? 'text-white font-medium' : 'text-white/85 hover:text-white'
                  }`}
              >
                <span>Agents</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-200 ${isAgentsActive ? 'w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  }`} />
              </a>

              {/* 2. Properties (WITH LUXURY DROPDOWN FOR BUY, RENT, OFF-PLAN, COMMERCIAL) */}
              <div
                className="relative py-1"
                onMouseEnter={handleMouseEnterDropdown}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
                  className={`group relative text-[14px] xl:text-[15px] font-normal transition-opacity duration-200 flex items-center gap-1.5 cursor-pointer select-none ${isPropertiesActive ? 'text-white font-medium' : 'text-white/85 hover:text-white'
                    }`}
                  aria-expanded={propertyDropdownOpen}
                >
                  <span>Properties</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-white/70 group-hover:text-white ${propertyDropdownOpen ? 'rotate-180 text-white' : ''
                      }`}
                  />
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-200 ${isPropertiesActive ? 'w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    }`} />
                </button>

                {/* DROPDOWN MENU PANEL */}
                {propertyDropdownOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-50 animate-fade-in"
                  >
                    <div
                      style={{ backgroundColor: '#000000' }}
                      className="w-[360px] border border-white/20 rounded-[16px] shadow-[0_30px_70px_rgba(0,0,0,0.95)] p-2.5 flex flex-col gap-1"
                    >
                      <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center justify-between border-b border-white/10 mb-1">
                        <span>Curated Portfolios</span>
                        <span>4 Categories</span>
                      </div>

                      {propertyCategories.map((opt) => {
                        const IconComponent = opt.icon;
                        const isCurrentActive = currentPath === opt.href;
                        return (
                          <a
                            key={opt.title}
                            href={opt.href}
                            onClick={(e) => {
                              handleNavClick(e, { href: opt.href, isRoute: true });
                            }}
                            className={`group/item flex items-center justify-between p-3 rounded-[10px] transition-all duration-200 cursor-pointer ${isCurrentActive
                              ? 'bg-white/15 border border-white/20'
                              : 'hover:bg-white/10 hover:border-white/10 border border-transparent'
                              }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover/item:scale-105 group-hover/item:bg-white group-hover/item:text-black transition-all">
                                <IconComponent size={18} />
                              </div>
                              <div className="space-y-0.5 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-[14px] font-semibold text-white">
                                    {opt.title}
                                  </span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                                    {opt.badge}
                                  </span>
                                </div>
                                <p className="text-[12px] text-white/60 group-hover/item:text-white/80 transition-colors line-clamp-1">
                                  {opt.description}
                                </p>
                              </div>
                            </div>

                            <ChevronRight size={15} className="text-white/30 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Map (Area Explorer) */}
              <a
                href="/map"
                onClick={(e) => handleNavClick(e, { label: 'Map', href: '/map', isRoute: true })}
                className={`group relative text-[14px] xl:text-[15px] font-normal transition-opacity duration-200 py-1 flex items-center gap-1.5 ${isMapActive ? 'text-white font-medium' : 'text-white/85 hover:text-white'
                  }`}
              >
                <MapPin
                  size={14}
                  className={`transition-colors ${isMapActive ? 'text-amber-400' : 'text-white/70 group-hover:text-white'}`}
                />
                <span>Map</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-200 ${isMapActive ? 'w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  }`} />
              </a>

              {/* 4. Sell With Us */}
              <a
                href="/sell"
                onClick={(e) => handleNavClick(e, { label: 'Sell with Us', href: '/sell', isRoute: true })}
                className={`group relative text-[14px] xl:text-[15px] font-normal transition-opacity duration-200 py-1 ${isSellActive ? 'text-white font-medium' : 'text-white/85 hover:text-white'
                  }`}
              >
                <span>Sell with Us</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-200 ${isSellActive ? 'w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  }`} />
              </a>

              {/* 4. About Us */}
              <a
                href="/about"
                onClick={(e) => handleNavClick(e, { label: 'About Us', href: '/about', isRoute: true })}
                className={`group relative text-[14px] xl:text-[15px] font-normal transition-opacity duration-200 py-1 ${isAboutActive ? 'text-white font-medium' : 'text-white/85 hover:text-white'
                  }`}
              >
                <span>About Us</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-200 ${isAboutActive ? 'w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  }`} />
              </a>
            </nav>

            {/* Right Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 z-10">
              {/* Map Button */}
              {/* Primary Call-to-Action (Rightmost Button) */}
              <button
                type="button"
                onClick={onContactClick}
                className="bg-[#FFFFFF] text-[#000000] text-[14px] font-semibold rounded-[8px] px-[22px] py-[10px] transition-all duration-200 hover:bg-[#F3F4F6] hover:scale-[1.03] active:scale-[0.98] select-none shadow-sm cursor-pointer"
              >
                Contact Us
              </button>
            </div>

            {/* Mobile / Tablet (< 1024px) Controls */}
            <div className="flex lg:hidden items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:text-white/80 focus:outline-none transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with Pitch-Black Solid Theme */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] lg:hidden bg-[#000000]/98 backdrop-blur-2xl flex flex-col pt-28 px-8 pb-10 justify-between animate-fade-in overflow-y-auto">
          <nav className="flex flex-col gap-4 pt-4">
            <span className="text-[11px] uppercase tracking-widest text-white/50 font-semibold font-mono">
              Directory
            </span>

            {/* 1. Agents */}
            <a
              href="/agents"
              onClick={(e) => handleNavClick(e, { label: 'Agents', href: '/agents', isRoute: true })}
              className="text-[19px] font-normal text-white/90 hover:text-white transition-colors border-b border-white/10 pb-3 flex items-center justify-between"
            >
              <span>Agents</span>
              <ChevronRight size={18} className="text-white/40" />
            </a>

            {/* 2. Properties (Expandable with 4 Categories: Buy, Rent, Off-Plan, Commercial) */}
            <div className="border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setMobilePropertiesExpanded(!mobilePropertiesExpanded)}
                className="w-full text-[19px] font-normal text-white/90 hover:text-white transition-colors flex items-center justify-between text-left py-1 cursor-pointer"
              >
                <span>Properties</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 text-white/60 ${mobilePropertiesExpanded ? 'rotate-180 text-white' : ''}`}
                />
              </button>

              {mobilePropertiesExpanded && (
                <div className="mt-3 pl-2 flex flex-col gap-2 border-l-2 border-white/20">
                  {propertyCategories.map((opt) => {
                    const IconComponent = opt.icon;
                    return (
                      <a
                        key={opt.title}
                        href={opt.href}
                        onClick={(e) => {
                          handleNavClick(e, { href: opt.href, isRoute: true });
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent size={16} className="text-white/70" />
                          <span className="text-[15px] font-medium">{opt.title}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2.5 Map Explorer */}
            <a
              href="/map"
              onClick={(e) => {
                handleNavClick(e, { label: 'Map', href: '/map', isRoute: true });
                setMobileMenuOpen(false);
              }}
              className="text-[19px] font-normal text-white/90 hover:text-white transition-colors border-b border-white/10 pb-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-amber-400" />
                <span>Map Explorer</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Area Map
                </span>
              </div>
              <ChevronRight size={18} className="text-white/40" />
            </a>

            {/* 3. Sell with Us */}
            <a
              href="/sell"
              onClick={(e) => {
                handleNavClick(e, { label: 'Sell with Us', href: '/sell', isRoute: true });
                setMobileMenuOpen(false);
              }}
              className="text-[19px] font-normal text-white/90 hover:text-white transition-colors border-b border-white/10 pb-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span>Sell with Us</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  Free Valuation
                </span>
              </div>
              <ChevronRight size={18} className="text-white/40" />
            </a>

            {/* 4. About Us */}
            <a
              href="/about"
              onClick={(e) => {
                handleNavClick(e, { label: 'About Us', href: '/about', isRoute: true });
                setMobileMenuOpen(false);
              }}
              className="text-[19px] font-normal text-white/90 hover:text-white transition-colors border-b border-white/10 pb-3 flex items-center justify-between"
            >
              <span>About Us</span>
              <ChevronRight size={18} className="text-white/40" />
            </a>

            {/* 5. Contact */}
            <a
              href="/contact"
              onClick={(e) => handleNavClick(e, { label: 'Contact', href: '/contact', isRoute: true })}
              className="text-[19px] font-normal text-white/90 hover:text-white transition-colors border-b border-white/10 pb-3 flex items-center justify-between"
            >
              <span>Contact</span>
              <ChevronRight size={18} className="text-white/40" />
            </a>

          </nav>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigate) onNavigate('/sell');
                else window.location.href = '/sell';
              }}
              className="w-full bg-white/10 border border-white/20 text-white text-[15px] font-semibold rounded-[8px] py-[13px] text-center transition-all hover:bg-white/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building size={16} />
              <span>Sell Your Property</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onContactClick) onContactClick();
              }}
              className="w-full bg-[#FFFFFF] text-[#000000] text-[15px] font-semibold rounded-[8px] py-[13px] text-center transition-all hover:bg-[#F3F4F6] active:scale-[0.98] cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </>
  );
}
