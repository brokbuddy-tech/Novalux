import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  Send,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

/* Global Salon Locations Data */
const SALONS = [
  {
    id: 'dubai',
    city: 'Dubai',
    region: 'Middle East Flagship',
    title: 'DIFC Private Client Lounge',
    address: 'Gate Village Building 04, Level 5, DIFC, Dubai, UAE',
    phone: '+971 4 820 9100',
    email: 'dubai@novalux.com',
    hours: 'Sun – Thu: 09:00 – 20:00 GST (24/7 Concierge On-Call)',
    leadPartner: 'Marcus Vance',
    partnerRole: 'Senior Managing Partner',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.972304859068!2d55.2798!3d25.2038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a67e24b%3A0x7e8f52ef0e74b35!2sDIFC%20Gate%20Village!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s'
  },
  {
    id: 'beverly-hills',
    city: 'Beverly Hills',
    region: 'North America West',
    title: 'Wilshire Architectural Gallery',
    address: '9600 Wilshire Boulevard, Suite 800, Beverly Hills, CA 90212',
    phone: '+1 (310) 844-9200',
    email: 'beverlyhills@novalux.com',
    hours: 'Mon – Fri: 08:30 – 19:00 PST (Valet & Private Salon by Appt)',
    leadPartner: 'Camilla Duprès',
    partnerRole: 'Director of Curatorial Architecture',
    partnerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.123456789!2d-118.4050!3d34.0670!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c123456789!2s9600%20Wilshire%20Blvd%2C%20Beverly%20Hills%2C%20CA!5e0!3m2!1sen!2s!4v1700000000001!5m2!1sen!2s'
  },
  {
    id: 'london',
    city: 'London',
    region: 'United Kingdom & Europe',
    title: 'Mayfair Townhouse Salon',
    address: '14 Berkeley Square, Mayfair, London W1J 6BL, United Kingdom',
    phone: '+44 20 7946 0912',
    email: 'london@novalux.com',
    hours: 'Mon – Fri: 09:00 – 18:30 GMT (Private Dining & Salon Room)',
    leadPartner: 'Sebastian Sterling',
    partnerRole: 'Managing Partner, Viticultural & Heritage Assets',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.23456789!2d-0.1460!3d51.5090!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d555555555%3A0x1234567890abcdef!2sBerkeley%20Square%2C%20London!5e0!3m2!1sen!2s!4v1700000000002!5m2!1sen!2s'
  },
  {
    id: 'new-york',
    city: 'New York',
    region: 'North America East',
    title: 'Manhattan Sky Suite',
    address: '767 Fifth Avenue, 42nd Floor, New York, NY 10153',
    phone: '+1 (212) 555-0198',
    email: 'newyork@novalux.com',
    hours: 'Mon – Fri: 09:00 – 19:00 EST (Helipad Transfers via 34th St)',
    leadPartner: 'Elena Rostova',
    partnerRole: 'Partner, Ultra-Prime Acquisitions',
    partnerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.987654321!2d-73.9730!3d40.7635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258f123456789%3A0xabcdef0123456789!2s767%205th%20Ave%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2s!4v1700000000003!5m2!1sen!2s'
  }
];

export default function ContactPage({ onNavigate, showToast }) {
  const [selectedSalon, setSelectedSalon] = useState(SALONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Trigger celebratory luxury confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#D4AF37', '#FAFAFA', '#111827']
        });
      } catch (err) {
        // fallback
      }

      if (showToast) {
        showToast(`Private inquiry transmitted to ${selectedSalon.city} advisory desk.`, 'success');
      }
    }, 900);
  };

  return (
    <div className="w-full bg-[#FAF7F2] text-[#111827] min-h-screen">
      
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE */}
      <section className="relative w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-[#0A0A0C]">
        
        {/* Background Photo */}
        <img
          src="/hero-dusk-villa.jpg"
          alt="Novalux Private Client Advisory Lounge"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/75 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(197,160,89,0.08)_0%,_transparent_70%)] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 2xl:px-20 mx-auto text-center pt-28 pb-16 max-w-4xl space-y-5">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/70 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 mb-2">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-white font-medium">Contact Us</span>
          </nav>

          {/* Category Badge */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-luxury uppercase text-[#C5A059]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>CONFIDENTIAL PRIVATE CLIENT DESK</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.12]">
            Connect With Our <br className="hidden sm:inline" />
            Private Client Advisory
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Whether seeking an off-market acquisition, discreetly listing a generational estate, or structuring an institutional property dossier, our senior partners are at your service.
          </p>

          {/* Quick Contact Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/90">
            <a
              href="tel:+18004928172"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-colors"
            >
              <Phone size={13} className="text-[#C5A059]" />
              <span>+1 (800) 492-8172</span>
            </a>
            <a
              href="mailto:concierge@novalux.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-colors"
            >
              <Mail size={13} className="text-[#C5A059]" />
              <span>concierge@novalux.com</span>
            </a>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Clock size={13} className="text-[#C5A059]" />
              <span>Under 2-Hour Partner Response</span>
            </div>
          </div>

        </div>
      </section>


      {/* 2. CONTACT US FORM & DIRECT ADVISORY PANEL */}
      <section className="w-full py-20 lg:py-28 relative">
        <div className="w-full px-6 sm:px-12 lg:px-16 2xl:px-20 mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Discretion Protocol & Global Contacts (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-luxury uppercase text-[#C5A059]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                  <span>FIDUCIARY STEWARDSHIP</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#111827]">
                  The Discretion Protocol
                </h2>
                <p className="text-[#64748B] text-sm sm:text-base font-light leading-relaxed">
                  Ultra-prime real estate demands institutional non-disclosure. Every inquiry received by Novalux is encrypted and managed under strict attorney-client style confidentiality.
                </p>
              </div>

              {/* Guarantees List */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059]">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Mutual Non-Disclosure (NDA)</h3>
                    <p className="text-xs text-[#64748B] mt-1 font-light leading-relaxed">
                      We execute bilateral confidentiality agreements prior to sharing proprietary floorplans, owner identities, or financial dossiers.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Zero Public Portal Exposure</h3>
                    <p className="text-xs text-[#64748B] mt-1 font-light leading-relaxed">
                      Off-market representations bypass all public MLS syndications and web scrapers, marketing solely to authenticated sovereign buyers.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center shrink-0 text-[#C5A059]">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Multi-Jurisdictional Escrow</h3>
                    <p className="text-xs text-[#64748B] mt-1 font-light leading-relaxed">
                      In-house fiduciary legal partners facilitate currency exchange, offshore trust titles, and cross-border closing procedures.
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Quote Card */}
              <div className="p-6 rounded-2xl bg-white/70 border border-black/5 space-y-3">
                <p className="font-serif italic text-base text-[#1E293B] leading-snug">
                  "Novalux orchestrated our Saadiyat Island beachfront sanctuary acquisition with absolute discretion and flawless legal execution."
                </p>
                <div className="text-xs text-[#64748B] font-mono">
                  — Private Equity Managing Partner, Zurich
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Luxury Contact Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#EAE8E4] rounded-3xl border border-black/10 shadow-xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
                
                {isSuccess ? (
                  /* Success Confirmation Screen */
                  <div className="py-12 text-center space-y-6 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#111827]">
                        Inquiry Transmitted
                      </h3>
                      <p className="text-sm text-[#64748B] font-light leading-relaxed">
                        Thank you, <span className="font-semibold text-[#111827]">{formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Valued Patron'}</span>. Your inquiry regarding "{formData.subject || 'Agency Advisory'}" has been transmitted to our advisory desk. A specialist will contact you shortly.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSuccess(false);
                          setFormData({
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            subject: '',
                            message: ''
                          });
                        }}
                        className="px-6 py-2.5 rounded-full border border-black/15 text-xs font-semibold uppercase tracking-wider text-[#111827] hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Interactive Inquiry Form */
                  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                    {/* FIRST NAME & LAST NAME */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          required
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          className="w-full px-5 py-3.5 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          required
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          className="w-full px-5 py-3.5 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* EMAIL ADDRESS */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all"
                      />
                    </div>

                    {/* PHONE */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        PHONE
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all"
                      />
                    </div>

                    {/* SUBJECT */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        SUBJECT
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can Agency Website help?"
                        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all"
                      />
                    </div>

                    {/* YOUR MESSAGE */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        YOUR MESSAGE
                      </label>
                      <textarea
                        rows={5}
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we assist you?"
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-transparent shadow-xs text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:bg-white transition-all resize-none min-h-[160px]"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl bg-[#111827] hover:bg-[#C5A059] active:scale-[0.99] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Transmitting Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Inquiry</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 3. INTERACTIVE GLOBAL ARCHITECTURAL SALONS & MAP SECTION */}
      <section className="w-full py-20 lg:py-28 bg-white border-t border-black/[0.08] relative">
        <div className="w-full px-6 sm:px-12 lg:px-16 2xl:px-20 mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-luxury uppercase text-[#C5A059]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span>GLOBAL PRESENCE &amp; SALONS</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#111827] tracking-tight">
              Our Architectural Consulting Lounges
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base font-light leading-relaxed">
              We maintain dedicated private consulting salons in the world’s leading financial and architectural capitals. Visits are arranged strictly by appointment.
            </p>
          </div>

          {/* Salon Location Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {SALONS.map((salon) => {
              const isSelected = selectedSalon.id === salon.id;
              return (
                <button
                  key={salon.id}
                  onClick={() => setSelectedSalon(salon)}
                  className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#111827] text-white shadow-md'
                      : 'bg-[#FAF7F2] text-[#4B5563] border border-black/5 hover:border-black/20 hover:text-[#111827]'
                  }`}
                >
                  <MapPin size={14} className={isSelected ? 'text-[#C5A059]' : 'text-[#9CA3AF]'} />
                  <span>{salon.city}</span>
                  <span className="text-[10px] opacity-60 font-mono hidden sm:inline">({salon.region})</span>
                </button>
              );
            })}
          </div>

          {/* Map & Office Detail 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Selected Office Information Dossier (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FAF7F2] rounded-3xl border border-black/10 p-8 sm:p-10 flex flex-col justify-between space-y-8">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#C5A059] font-medium">
                    {selectedSalon.region}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#111827]">
                    {selectedSalon.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed font-light">
                    {selectedSalon.address}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-black/10 text-xs font-mono text-[#374151]">
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-[#C5A059] shrink-0" />
                    <span>{selectedSalon.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={15} className="text-[#C5A059] shrink-0" />
                    <span>{selectedSalon.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={15} className="text-[#C5A059] shrink-0" />
                    <span>{selectedSalon.hours}</span>
                  </div>
                </div>

                {/* Lead Partner On-Site */}
                <div className="p-4 rounded-2xl bg-white border border-black/5 flex items-center gap-3.5">
                  <img
                    src={selectedSalon.partnerAvatar}
                    alt={selectedSalon.leadPartner}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A059]"
                  />
                  <div>
                    <div className="text-xs text-[#9CA3AF] uppercase tracking-wider font-mono">Resident Director</div>
                    <div className="text-sm font-semibold text-[#111827]">{selectedSalon.leadPartner}</div>
                    <div className="text-[11px] text-[#C5A059]">{selectedSalon.partnerRole}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <a
                  href={`mailto:${selectedSalon.email}?subject=Private Consultation Request - ${selectedSalon.city} Salon`}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#111827] hover:bg-[#C5A059] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calendar size={14} />
                  <span>Request In-Person Salon Appointment</span>
                </a>
              </div>

            </div>

            {/* Right: Embedded Interactive Map (7 Cols) */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-black/10 shadow-lg min-h-[380px] lg:min-h-[460px] relative bg-[#E5E7EB]">
              <iframe
                title={`${selectedSalon.city} Office Map`}
                src={selectedSalon.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[40%] contrast-[1.05]"
              />
              {/* Map Floating Location Pill */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-black/10 flex items-center gap-2 text-xs font-semibold text-[#111827]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Novalux {selectedSalon.city} Salon Active</span>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
