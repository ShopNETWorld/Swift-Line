import React from 'react';
import { 
  Building, Calendar, ShieldCheck, Globe, Award, TrendingUp, Users, 
  CheckCircle2, Clock, Plane, Ship, ShieldAlert, ArrowRight, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../i18n/translations';
import CourierPartners from '../components/CourierPartners';

export default function AboutUs({ lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const milestones = [
    { year: "2011", title: "Foundation in New York", desc: t.timeline2011, icon: Building },
    { year: "2015", title: "European Hubs Expansion", desc: t.timeline2015, icon: Plane },
    { year: "2019", title: "Ocean Freight & E-Commerce", desc: t.timeline2019, icon: Ship },
    { year: "2023", title: "AI Telemetry & GPS Fleet", desc: t.timeline2023, icon: Globe },
    { year: "2026", title: "Global Logistics Leader", desc: t.timeline2026, icon: Award },
  ];

  return (
    <div className="pt-20 pb-16 space-y-16">
      
      {/* 1. HERO SECTION (SOLID CORPORATE COLORS, NO GRADIENTS) */}
      <section className="bg-[#0F2C59] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#FF6B00]">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
            <Calendar className="w-3.5 h-3.5" />
            {t.aboutTag}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight">
            {t.aboutTitle}
          </h1>
          <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.aboutSubtitle}
          </p>
        </div>
      </section>

      {/* 2. COMPANY HISTORY & FOUNDING STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                15 Years of Proven Excellence
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F2C59] dark:text-white font-display">
                Built on Trust, Precision, and Global Connectivity
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="border-l-4 border-[#FF6B00] pl-4 font-semibold text-slate-800 dark:text-slate-200">
                {t.aboutHistoryP1}
              </p>
              <p>
                {t.aboutHistoryP2}
              </p>
            </div>

            {/* Certifications & Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">IATA Certified</p>
                  <p className="text-[10px] text-slate-500">Air Cargo License</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">ISO 9001:2015</p>
                  <p className="text-[10px] text-slate-500">Quality Assurance</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Award className="w-5 h-5 text-[#FF6B00] shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">WCO Compliant</p>
                  <p className="text-[10px] text-slate-500">Customs Protocol</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/rates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-xs shadow-md transition-all"
              >
                <span>{t.calcTitle}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Card: 2011 Founding Milestone Banner */}
          <div className="bg-[#0F2C59] text-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden border-2 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block">Official Inception</span>
                <p className="text-4xl font-black text-white font-display">2011</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                15+
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "When we founded Swift Line in 2011, international shipping was opaque, slow, and fragmented. Our breakthrough was unifying direct airline cargo agreements with automated GPS telemetry, giving customers complete clarity over every mile."
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/80">
              <div>
                <p className="text-2xl font-black text-[#FF6B00]">220+</p>
                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">{t.statCountries}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.8M+</p>
                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">{t.statParcels}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">99.8%</p>
                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">{t.statOnTime}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FF6B00]">24/7</p>
                <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">{t.statTelemetry}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HISTORICAL TIMELINE: 2011 TO PRESENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-amber-100 dark:bg-amber-950/40 px-3 py-1 rounded-full">
            Journey Through Time
          </span>
          <h2 className="text-3xl font-extrabold text-[#0F2C59] dark:text-white font-display">
            Milestones of Innovation
          </h2>
        </div>

        <div className="relative border-l-2 border-[#FF6B00] ml-4 sm:ml-32 space-y-10 pl-6 sm:pl-8">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="relative group">
                {/* Year tag placed on the left on desktop */}
                <div className="sm:absolute sm:-left-36 sm:top-1 sm:text-right hidden sm:block w-24">
                  <span className="text-lg font-black text-[#0F2C59] dark:text-[#FF6B00]">
                    {m.year}
                  </span>
                </div>

                {/* Node icon on line */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-[#0F2C59] border-2 border-[#FF6B00] text-[#FF6B00] flex items-center justify-center shadow">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md group-hover:border-[#FF6B00] transition-colors space-y-1.5">
                  <span className="sm:hidden inline-block text-xs font-black text-[#FF6B00] mb-1">
                    {m.year}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CORE VALUES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F2C59] dark:text-white font-display">
            {t.aboutValuesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 space-y-3 hover:border-[#FF6B00] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.valSpeed}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.valSpeedDesc}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 space-y-3 hover:border-[#FF6B00] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.valSecurity}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.valSecurityDesc}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800 space-y-3 hover:border-[#FF6B00] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.valCompliance}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.valComplianceDesc}</p>
          </div>
        </div>
      </section>

      {/* 5. MULTI-CARRIER NETWORK INTEGRATION */}
      <CourierPartners />

    </div>
  );
}
