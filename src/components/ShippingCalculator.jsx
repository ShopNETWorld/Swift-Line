import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Package, Globe, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { translations } from '../i18n/translations';
import { apiFetch } from '../utils/api.js';

export default function ShippingCalculator({ lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const [weight, setWeight] = useState(5.0);
  const [origin, setOrigin] = useState('United States');
  const [destination, setDestination] = useState('Germany');
  const [serviceType, setServiceType] = useState('EXPRESS_AIR');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);

  const countries = [
    'United States', 'United Kingdom', 'Germany', 'Japan', 'France',
    'Canada', 'Australia', 'China', 'United Arab Emirates', 'Brazil',
    'India', 'Singapore', 'South Korea', 'South Africa', 'Mexico'
  ];

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/rates/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: weight, service_type: serviceType })
      });
      const data = await res.json();
      if (res.ok) {
        setRates(data.options || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [weight, serviceType]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Inputs Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-[#FF6B00] text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>{t.calcTag}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0F2C59] dark:text-white font-display">
              {t.calcTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.calcSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{t.originCountry}</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">{t.destinationCountry}</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Weight Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.weightKg}</label>
                <span className="text-sm font-black text-[#FF6B00]">{weight} kg</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full accent-[#FF6B00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.5 kg (Document)</span>
                <span>25 kg (Parcels)</span>
                <span>50 kg (Heavy)</span>
              </div>
            </div>

            {/* Service Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">{t.serviceSpeed}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'EXPRESS_AIR', label: t.airTitle },
                  { id: 'PRIORITY_COURIER', label: 'Priority Courier' },
                  { id: 'OVERNIGHT', label: 'Overnight Air' },
                  { id: 'STANDARD_OCEAN', label: t.oceanTitle }
                ].map(srv => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setServiceType(srv.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      serviceType === srv.id
                        ? 'bg-[#0F2C59] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Output Rate Matrix */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-[#0F2C59] dark:text-white">Multi-Carrier Comparison (USD)</h4>
            <span className="text-xs text-slate-400">{origin} ➔ {destination} ({weight}kg)</span>
          </div>

          <div className="space-y-3">
            {rates.map((r, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                  r.courier_name.includes('Swift Line')
                    ? 'bg-white dark:bg-slate-900 border-2 border-[#FF6B00] shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">{r.courier_name}</span>
                    {r.courier_name.includes('Swift Line') && (
                      <span className="bg-[#FF6B00] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">Best Value</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Est. Transit: {r.estimated_days}</span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-[#0F2C59] dark:text-[#FF6B00]">${r.cost_usd.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">USD</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Book & Print Label for ${rates[0]?.cost_usd?.toFixed(2) || '25.00'} USD</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
