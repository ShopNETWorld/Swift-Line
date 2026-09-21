import React, { useState } from 'react';
import { Star, Quote, CheckCircle, Building, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function TestimonialSection({ lang = 'en' }) {
  const t = translations[lang] || translations.en;
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: t.testi1Quote,
      author: t.testi1Author,
      role: t.testi1Role,
      company: "BioVance Pharma AG",
      location: "Basel, Switzerland",
      rating: 5,
      parcelsShipped: "14,200+ Express Air Deliveries",
      deliveryRate: "99.9% On-Time",
      avatarInitials: "ER",
      avatarBg: "bg-blue-600",
      tag: "Cold-Chain Medical Cargo"
    },
    {
      id: 2,
      quote: t.testi2Quote,
      author: t.testi2Author,
      role: t.testi2Role,
      company: "ChronoLux Global Group",
      location: "Marina Bay, Singapore",
      rating: 5,
      parcelsShipped: "8,500+ High-Value Shipments",
      deliveryRate: "100% Zero-Loss Record",
      avatarInitials: "MC",
      avatarBg: "bg-amber-600",
      tag: "Secured Luxury Timepieces"
    },
    {
      id: 3,
      quote: t.testi3Quote,
      author: t.testi3Author,
      role: t.testi3Role,
      company: "Apex Industrial Hardware",
      location: "Chicago, IL, USA",
      rating: 5,
      parcelsShipped: "32,000+ Multi-Carrier Freight",
      deliveryRate: "99.7% Transit Accuracy",
      avatarInitials: "SJ",
      avatarBg: "bg-emerald-600",
      tag: "Heavy Machinery & B2B Parts"
    }
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-orange-100 dark:bg-orange-950/50 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/60">
          <ShieldCheck className="w-4 h-4" />
          {t.testiTag}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] dark:text-white font-display">
          {t.testiTitle}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.testiSubtitle}
        </p>
      </div>

      {/* Grid of 3 Testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {testimonials.map((item, idx) => {
          const isFeatured = idx === activeIndex;
          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between border ${
                isFeatured
                  ? 'bg-white dark:bg-slate-900 border-[#FF6B00] shadow-2xl shadow-orange-500/10 scale-[1.02] ring-2 ring-[#FF6B00]/20'
                  : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                {/* Top Row: Stars + Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                </div>

                {/* Cargo Tag Badge */}
                <div>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.tag}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Author & Verification Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${item.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}>
                  {item.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {item.author}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {item.role}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t.verifiedShipment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges Bar */}
      <div className="bg-[#0F2C59] text-white rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-around gap-4 text-center border-l-4 border-[#FF6B00]">
        <div>
          <span className="block text-xl font-black text-[#FF6B00]">99.8%</span>
          <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Client Retention Rate</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-700"></div>
        <div>
          <span className="block text-xl font-black text-white">4.8M+</span>
          <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Zero-Loss Deliveries</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-700"></div>
        <div>
          <span className="block text-xl font-black text-[#FF6B00]">220+</span>
          <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Customs Hubs Connected</span>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-700"></div>
        <div>
          <span className="block text-xl font-black text-white">15 Years</span>
          <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Since Founding in 2011</span>
        </div>
      </div>
    </section>
  );
}
