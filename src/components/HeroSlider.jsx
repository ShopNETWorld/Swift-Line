import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Plane, Ship, ShieldCheck, Clock, Award, Globe, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function HeroSlider({ lang }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trackingInput, setTrackingInput] = useState('');
  const navigate = useNavigate();

  const t = translations[lang] || translations.en;

  // SOLID SLIDES - NO GRADIENT COLORS per explicit user directive
  const slides = [
    {
      id: 1,
      bgClass: "bg-[#0F2C59]", // Solid Deep Navy Blue
      accentBadge: "GLOBAL AIR & EXPRESS",
      title: "Ultra-Fast Air Express Freight Across 220+ Countries",
      subtitle: "Door-to-door guaranteed delivery with real-time GPS tracking and instant customs clearance.",
      icon: Plane,
      stat: "99.8% On-Time Arrival Rate",
      cta: "Book Air Express",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 2,
      bgClass: "bg-[#0B132B]", // Solid Dark Midnight
      accentBadge: "OCEAN & CONTAINER FREIGHT",
      title: "Cost-Effective Global Cargo & Ocean Shipping",
      subtitle: "Full container load (FCL) and less-than-container load (LCL) solutions for global trade.",
      icon: Ship,
      stat: "2.4 Million Tons Moved Annually",
      cta: "Get Ocean Quote",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 3,
      bgClass: "bg-[#1C2541]", // Solid Deep Slate Blue
      accentBadge: "ENTERPRISE LOGISTICS",
      title: "Integrated Courier & Multi-Carrier Solutions",
      subtitle: "Consolidated dispatch featuring DHL, FedEx, UPS, Aramex, and Swift Line Global Express.",
      icon: Globe,
      stat: "Trusted by 45,000+ Enterprises",
      cta: "Explore Multi-Carrier",
      image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/tracking?number=${encodeURIComponent(trackingInput.trim())}`);
    }
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Active Solid Slide Background */}
      <div className={`absolute inset-0 transition-colors duration-700 ${slide.bgClass}`}></div>

      {/* Decorative Solid Grid Layout Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-[#FFFFFF]_[1px],transparent_1px] [background-size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-white animate-slide">
            
            {/* Top Accent Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold uppercase tracking-wider shadow-md">
              <IconComponent className="w-4 h-4 text-white" />
              <span>{slide.accentBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-white">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-200 font-normal max-w-2xl leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Quick Live Tracking Search Bar (Embedded in Hero) */}
            <div className="pt-2">
              <form onSubmit={handleTrackSubmit} className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-2xl border-2 border-[#FF6B00]/40">
                <div className="flex items-center gap-3 px-3 py-2 w-full text-slate-800">
                  <Search className="w-5 h-5 text-[#FF6B00] shrink-0" />
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder={t.trackPlaceholder}
                    className="w-full text-sm font-semibold bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white text-sm font-bold shadow-lg shadow-orange-500/30 whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{t.trackBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-300 font-medium px-2">
                <span>Sample Tracking:</span>
                <button onClick={() => setTrackingInput('SL-9842104-US')} className="underline hover:text-[#FF6B00] transition-colors">SL-9842104-US</button>
                <span>•</span>
                <button onClick={() => setTrackingInput('SL-7734192-EU')} className="underline hover:text-[#FF6B00] transition-colors">SL-7734192-EU</button>
              </div>
            </div>

            {/* Highlights Bar */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-semibold text-slate-200">Insurance Included</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-semibold text-slate-200">24/7 Live GPS</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-semibold text-slate-200">Customs Cleared</span>
              </div>
            </div>

          </div>

          {/* Right Image Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-[380px] sm:h-[450px] object-cover transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Overlay Stat Pill */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0F2C59]/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Performance Verified</p>
                  <p className="text-sm font-bold text-white mt-0.5">{slide.stat}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Slide Controls & Dots */}
        <div className="mt-12 flex items-center justify-between">
          
          {/* Slide Indicators */}
          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-10 bg-[#FF6B00]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
