import React from 'react';
import HeroSlider from '../components/HeroSlider';
import CourierPartners from '../components/CourierPartners';
import ShippingCalculator from '../components/ShippingCalculator';
import TestimonialSection from '../components/TestimonialSection';
import FAQSection from '../components/FAQSection';
import { Plane, Ship, ShieldCheck, Clock, Award, Globe, ArrowRight, CheckCircle2, PackageCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../i18n/translations';

export default function Home({ lang = 'en' }) {
  const t = translations[lang] || translations.en;

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SLIDER (NO GRADIENTS PER REQUIREMENT) */}
      <HeroSlider lang={lang} />

      {/* 2. CORE STATS BAR (TRANSLATED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F2C59] text-white rounded-3xl p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-b-4 border-[#FF6B00]">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#FF6B00]">220+</p>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">{t.statCountries}</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">4.8M+</p>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">{t.statParcels}</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#FF6B00]">99.8%</p>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">{t.statOnTime}</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">24/7</p>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">{t.statTelemetry}</p>
          </div>
        </div>
      </section>

      {/* 3. LOGISTICS SERVICES GRID (TRANSLATED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-amber-100 dark:bg-amber-950/40 px-3 py-1 rounded-full">
            {t.servicesTag}
          </span>
          <h2 className="text-3xl font-extrabold text-[#0F2C59] dark:text-white font-display">
            {t.servicesTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 hover:border-[#FF6B00] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold shadow-md">
              <Plane className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t.airTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.airDesc}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.airPoint1}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.airPoint2}</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 hover:border-[#FF6B00] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold shadow-md">
              <Ship className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t.oceanTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.oceanDesc}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.oceanPoint1}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.oceanPoint2}</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 hover:border-[#FF6B00] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold shadow-md">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t.customsTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.customsDesc}
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.customsPoint1}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.customsPoint2}</li>
            </ul>
          </div>

        </div>
      </section>

      {/* 4. LEADING WORLD COURIERS SHOWCASE */}
      <CourierPartners lang={lang} />

      {/* 5. INTERACTIVE SHIPPING CALCULATOR */}
      <ShippingCalculator lang={lang} />

      {/* 6. TESTIMONIAL & CORPORATE REVIEWS SECTION */}
      <TestimonialSection lang={lang} />

      {/* 7. FREQUENTLY ASKED QUESTIONS (Q&A) ACCORDION */}
      <FAQSection lang={lang} />

      {/* 8. FOOTER */}
      <footer className="bg-[#0F2C59] text-white pt-16 pb-8 border-t-4 border-[#FF6B00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <div className="font-extrabold text-2xl font-display">
              SWIFT <span className="text-[#FF6B00]">LINE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.footerDesc}
            </p>
            <p className="text-xs text-slate-400">
              742 Fifth Avenue, New York, NY 10019
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-3">{t.quickLinks}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link to="/tracking" className="hover:text-[#FF6B00]">{t.navTracking}</Link></li>
              <li><Link to="/services" className="hover:text-[#FF6B00]">{t.navServices}</Link></li>
              <li><Link to="/about" className="hover:text-[#FF6B00]">{t.navAbout}</Link></li>
              <li><Link to="/rates" className="hover:text-[#FF6B00]">{t.navRates}</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF6B00]">{t.navContact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-3">{t.integratedCarriers}</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>DHL Express</li>
              <li>FedEx World</li>
              <li>UPS Worldwide Saver</li>
              <li>Aramex Global</li>
              <li>Maersk Line</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-700/60 text-center text-xs text-slate-400">
          © 2026 Swift Line Worldwide Courier Inc. (https://myswiftline.com). {t.rightsReserved}
        </div>
      </footer>

    </div>
  );
}
