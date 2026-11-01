import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, ArrowLeft, Phone, Mail, Calendar, ShieldCheck, 
  Award, Globe2, Star, Quote, Share2, Check, ExternalLink 
} from 'lucide-react';
import PropertyCard from './PropertyCard';

export default function AgentDetailPage({ 
  agent, 
  properties = [], 
  favorites = [], 
  onToggleFavorite, 
  onSelectProperty, 
  onNavigate,
  onScheduleShowing,
  onContactAgent
}) {
  const [copied, setCopied] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [isTestimonialsPaused, setIsTestimonialsPaused] = useState(false);
  const testimonialsScrollRef = useRef(null);

  const testimonialsCount = agent?.testimonials?.length || 0;

  // Auto-advance client testimonials every 4 seconds when not paused
  useEffect(() => {
    if (isTestimonialsPaused || testimonialsCount <= 1) return;

    const timer = setInterval(() => {
      setActiveTestimonialIdx((prev) => {
        const next = (prev + 1) % testimonialsCount;
        scrollToTestimonial(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isTestimonialsPaused, testimonialsCount]);

  const scrollToTestimonial = (index) => {
    if (testimonialsScrollRef.current) {
      const container = testimonialsScrollRef.current;
      const targetCard = container.children[index];
      if (targetCard) {
        const targetLeft = targetCard.offsetLeft - container.offsetLeft;
        container.scrollTo({
          left: targetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const handlePrevTestimonial = () => {
    const next = (activeTestimonialIdx - 1 + testimonialsCount) % testimonialsCount;
    setActiveTestimonialIdx(next);
    scrollToTestimonial(next);
  };

  const handleNextTestimonial = () => {
    const next = (activeTestimonialIdx + 1) % testimonialsCount;
    setActiveTestimonialIdx(next);
    scrollToTestimonial(next);
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-36 pb-20 px-6 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#111827]">Advisor Profile Not Found</h2>
        <p className="text-sm text-[#6B7280]">The requested advisor portfolio may have been updated or moved.</p>
        <button
          onClick={() => onNavigate && onNavigate('/agents')}
          className="px-6 py-2.5 rounded-lg bg-black text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
        >
          View All Advisors
        </button>
      </div>
    );
  }

  // Find properties belonging to this agent
  const agentProperties = properties.filter((p) => 
    p.agentId === agent.id || p.agentId === agent.slug || (agent.listingIds && agent.listingIds.includes(p.id))
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#111827] pt-28 sm:pt-36 pb-24">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12 sm:space-y-16">
        
        {/* 1. BREADCRUMBS & NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.08] pb-6">
          <nav className="flex items-center gap-2 text-[13px] font-mono text-[#6B7280]">
            <button 
              onClick={() => onNavigate && onNavigate('/')}
              className="hover:text-black transition-colors cursor-pointer font-sans"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-[#9CA3AF]" />
            <button 
              onClick={() => onNavigate && onNavigate('/agents')}
              className="hover:text-black transition-colors cursor-pointer font-sans"
            >
              Agents
            </button>
            <ChevronRight size={13} className="text-[#9CA3AF]" />
            <span className="text-[#111827] font-semibold font-sans">{agent.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-black/[0.08] text-xs font-medium text-[#111827] hover:border-black transition-colors shadow-sm cursor-pointer"
              title="Share Profile Link"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share Dossier</span>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate && onNavigate('/agents')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-black/[0.08] text-xs font-medium text-[#111827] hover:border-black transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>All Advisors</span>
            </button>
          </div>
        </div>

        {/* 2. PROFILE HEADER (SPLIT 50/50 SECTION) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Portrait & Direct Contact Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative aspect-[4/5] w-full rounded-[16px] overflow-hidden bg-stone-200 border border-black/[0.08] shadow-2xl">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Career Volume Badge */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white z-10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 block">
                    Career Realization
                  </span>
                  <span className="text-[26px] font-bold font-sans tracking-tight">
                    {agent.careerVolume}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-mono">
                  {agent.experience}
                </div>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white border border-black/[0.08] text-[#111827] text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 hover:border-black transition-all shadow-sm"
              >
                <Phone size={14} className="text-bronze shrink-0" />
                <span className="truncate">Call Agent</span>
              </a>

              <a
                href={`mailto:${agent.email}`}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white border border-black/[0.08] text-[#111827] text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 hover:border-black transition-all shadow-sm"
              >
                <Mail size={14} className="text-bronze shrink-0" />
                <span className="truncate">Email Agent</span>
              </a>
            </div>

            {/* Primary Schedule Consultation Button */}
            <button
              onClick={() => onContactAgent && onContactAgent(agent)}
              className="w-full py-4 px-6 rounded-xl bg-[#000000] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#1E1E1E] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar size={15} />
              <span>Schedule Private Consultation</span>
            </button>
          </div>

          {/* Right Column: Details, Biography, Key Metrics & Social */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Title & Specialization Header */}
            <div className="space-y-3 pb-6 border-b border-black/[0.08]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
                <ShieldCheck size={13} className="text-bronze" />
                <span className="text-[11px] font-semibold tracking-luxury uppercase text-[#111827]">
                  {agent.specialization}
                </span>
              </div>

              <h1 className="text-[38px] sm:text-[48px] font-bold text-[#111827] tracking-tight font-sans leading-[1.1]">
                {agent.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#6B7280]">
                <span className="font-medium text-[#111827]">{agent.title}</span>
                <span>•</span>
                <span>{agent.region}</span>
              </div>
            </div>

            {/* 4-Item Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-black/[0.08] shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] block font-mono">Experience</span>
                <span className="text-xl font-bold text-[#111827] font-sans">{agent.experience}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] block font-mono">License ID</span>
                <span className="text-xs font-mono font-bold text-bronze block pt-1">{agent.licenseId}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] block font-mono">Languages</span>
                <span className="text-sm font-semibold text-[#111827] block truncate">
                  {agent.languages ? agent.languages.join(', ') : 'English, Arabic'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] block font-mono">Career Volume</span>
                <span className="text-xl font-bold text-[#111827] font-sans">{agent.careerVolume}</span>
              </div>
            </div>

            {/* Detailed Biography */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-luxury text-[#111827] font-semibold">
                Executive Biography &amp; Practice
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8] font-normal">
                {agent.bio}
              </p>
            </div>

            {/* Direct Line & Confidential Desk */}
            <div className="p-5 rounded-xl bg-white border border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#111827] block">Confidential Desk</span>
                <span className="text-xs text-[#6B7280]">Immediate liaison under mutual NDA</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <a href={`tel:${agent.phone}`} className="text-bronze font-bold hover:underline">
                  {agent.phone}
                </a>
                <span>•</span>
                <a href={`mailto:${agent.email}`} className="text-[#111827] hover:underline">
                  {agent.email}
                </a>
              </div>
            </div>

            {/* Social Connectivity */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF]">Official Channels:</span>
              <div className="flex items-center gap-2">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-[#111827] hover:border-black transition-colors flex items-center gap-1.5"
                >
                  <span>LinkedIn</span>
                  <ExternalLink size={12} className="text-[#9CA3AF]" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-[#111827] hover:border-black transition-colors flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ExternalLink size={12} className="text-[#9CA3AF]" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 3. AGENT'S ACTIVE LISTINGS GRID */}
        <div className="pt-8 space-y-8 border-t border-black/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black inline-block" />
                <span className="text-[12px] font-medium tracking-[0.12em] uppercase text-[#111827]">
                  EXCLUSIVE PORTFOLIO
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-semibold text-[#111827] tracking-tight">
                Active Listings by {agent.name}
              </h2>
            </div>

            <span className="text-xs font-mono text-[#6B7280]">
              {agentProperties.length} Current Trophy Residences
            </span>
          </div>

          {agentProperties.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-black/[0.06] space-y-2">
              <p className="text-base text-[#111827] font-medium">All active residences under private NDA</p>
              <p className="text-xs text-[#6B7280]">
                Contact {agent.name} directly to request access to off-market properties in this portfolio.
              </p>
              <button
                onClick={() => onContactAgent && onContactAgent(agent)}
                className="mt-3 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Inquire Off-Market
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProperty={onSelectProperty}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. CLIENT TESTIMONIALS (AUTOMATIC SCROLLABLE ROW) */}
        {agent.testimonials && agent.testimonials.length > 0 && (
          <div className="pt-8 space-y-6 sm:space-y-8 border-t border-black/[0.08]">
            
            {/* Section Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#C5A059] inline-block" />
                  <span className="text-[12px] font-medium tracking-[0.12em] uppercase text-[#C5A059]">
                    PATRON REFLECTIONS
                  </span>
                </div>
                <h2 className="text-[26px] xs:text-[28px] sm:text-[34px] font-semibold text-[#111827] tracking-tight">
                  Client Testimonials for {agent.name}
                </h2>
              </div>

              {/* Navigation Controls & Auto-scroll status */}
              <div className="flex items-center gap-3">
                {/* Subtle auto indicator */}
                <div className="hidden xs:flex items-center gap-1.5 text-xs text-[#6B7280] font-mono pr-2">
                  <span className={`w-2 h-2 rounded-full ${isTestimonialsPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isTestimonialsPaused ? 'Paused' : 'Auto-Playing'}</span>
                </div>

                {/* Previous / Next buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevTestimonial}
                    aria-label="Previous testimonial"
                    className="w-9 h-9 rounded-lg border border-black/15 bg-white text-[#111827] flex items-center justify-center hover:bg-black hover:text-white transition-colors active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextTestimonial}
                    aria-label="Next testimonial"
                    className="w-9 h-9 rounded-lg border border-black/15 bg-white text-[#111827] flex items-center justify-center hover:bg-black hover:text-white transition-colors active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Row Container */}
            <div
              ref={testimonialsScrollRef}
              onMouseEnter={() => setIsTestimonialsPaused(true)}
              onMouseLeave={() => setIsTestimonialsPaused(false)}
              onTouchStart={() => setIsTestimonialsPaused(true)}
              onTouchEnd={() => setIsTestimonialsPaused(false)}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 touch-pan-x"
            >
              {agent.testimonials.map((test, idx) => (
                <div
                  key={idx}
                  className="w-[85vw] max-w-[340px] xs:w-[80vw] xs:max-w-[390px] sm:w-[460px] md:w-[490px] lg:w-[520px] shrink-0 snap-start bg-white p-6 sm:p-8 rounded-2xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between space-y-6 select-none"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Quote size={28} className="text-[#C5A059] opacity-80 rotate-180" />
                      <div className="flex items-center gap-0.5 text-[#C5A059]">
                        {[...Array(test.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-[#C5A059]" />
                        ))}
                      </div>
                    </div>

                    <p className="font-serif text-base sm:text-lg lg:text-[19px] text-[#111827] leading-[1.6] italic">
                      "{test.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-[#111827] truncate">
                        {test.clientName}
                      </h4>
                      <p className="text-xs text-[#6B7280] truncate">
                        {test.clientTitle}
                      </p>
                      <p className="text-[11px] font-mono text-bronze mt-1 font-medium truncate">
                        {test.transaction}
                      </p>
                    </div>

                    {test.verifiedYear && (
                      <span className="text-[10px] font-mono text-[#6B7280] bg-stone-50 border border-stone-200 px-2 py-0.5 rounded shrink-0">
                        {test.verifiedYear.replace('Verified Transaction • ', '')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {agent.testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setActiveTestimonialIdx(dotIdx);
                    scrollToTestimonial(dotIdx);
                  }}
                  aria-label={`Jump to review ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeTestimonialIdx === dotIdx
                      ? 'w-7 bg-[#C5A059]'
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
