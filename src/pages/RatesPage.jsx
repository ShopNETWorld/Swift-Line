import React from 'react';
import ShippingCalculator from '../components/ShippingCalculator';
import { translations } from '../i18n/translations';
import { Calculator, DollarSign, ShieldCheck } from 'lucide-react';

export default function RatesPage({ lang = 'en' }) {
  const t = translations[lang] || translations.en;

  return (
    <div className="pt-24 pb-16 space-y-12">
      <div className="bg-[#0F2C59] text-white py-14 text-center px-4 border-b-4 border-[#FF6B00]">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[#FF6B00] text-xs font-bold uppercase tracking-widest border border-slate-700">
            <Calculator className="w-3.5 h-3.5" />
            {t.calcTag}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display">{t.calcTitle}</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">{t.calcSubtitle}</p>
        </div>
      </div>

      <ShippingCalculator lang={lang} />
    </div>
  );
}
