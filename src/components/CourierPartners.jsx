import React, { useState } from 'react';
import { Plane, Ship, Truck, Check, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';

export default function CourierPartners({ lang = 'en' }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const partners = [
    {
      name: "Swift Line Express",
      badge: "OUR OWN NETWORK",
      tagline: "Ultra-Fast Priority Global Air Courier",
      logoBg: "bg-[#0F2C59] text-[#FF6B00]",
      category: "EXPRESS",
      speed: "1 - 3 Days",
      coverage: "220+ Countries",
      basePrice: "$25.00",
      perKg: "$4.50",
      features: ["Customs Fast-Track", "Door-to-Door Pickup", "Live GPS Telemetry", "100% Value Insurance"]
    },
    {
      name: "DHL Express",
      badge: "INTEGRATED PARTNER",
      tagline: "Worldwide Air Express Delivery",
      logoBg: "bg-amber-400 text-red-700",
      category: "EXPRESS",
      speed: "2 - 4 Days",
      coverage: "220 Countries",
      basePrice: "$35.00",
      perKg: "$6.00",
      features: ["Time-Definite Delivery", "On-Demand Delivery", "Global Trade Management"]
    },
    {
      name: "FedEx World Express",
      badge: "INTEGRATED PARTNER",
      tagline: "International Priority Logistics",
      logoBg: "bg-purple-900 text-orange-400",
      category: "EXPRESS",
      speed: "2 - 4 Days",
      coverage: "220 Countries",
      basePrice: "$34.00",
      perKg: "$5.80",
      features: ["FedEx International Priority", "Customs Brokerage", "Temperature Control"]
    },
    {
      name: "UPS Worldwide Saver",
      badge: "INTEGRATED PARTNER",
      tagline: "Guaranteed Day-Definite Delivery",
      logoBg: "bg-amber-900 text-amber-300",
      category: "EXPRESS",
      speed: "3 - 5 Days",
      coverage: "200+ Countries",
      basePrice: "$32.00",
      perKg: "$5.50",
      features: ["UPS My Choice Alert", "Supply Chain Solutions", "Duty Pre-Payment"]
    },
    {
      name: "Aramex Global",
      badge: "MIDDLE EAST & ASIA LEAD",
      tagline: "Regional & Cross-Border Courier",
      logoBg: "bg-red-600 text-white",
      category: "REGIONAL",
      speed: "4 - 7 Days",
      coverage: "180+ Countries",
      basePrice: "$22.00",
      perKg: "$4.00",
      features: ["GCC Fast Line", "E-Commerce Logistics", "Cash on Delivery Support"]
    },
    {
      name: "Maersk Container Line",
      badge: "OCEAN CARGO LEAD",
      tagline: "Integrated Ocean Container Freight",
      logoBg: "bg-cyan-700 text-white",
      category: "OCEAN",
      speed: "10 - 15 Days",
      coverage: "300+ Ports",
      basePrice: "$15.00",
      perKg: "$2.00",
      features: ["FCL & LCL Containers", "Port-to-Port Hubs", "Heavy Industrial Cargo"]
    }
  ];

  const filtered = selectedCategory === 'ALL' 
    ? partners 
    : partners.filter(p => p.category === selectedCategory);

  return (
    <section className="py-16 bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F2C59] text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>Top World Leading Couriers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] dark:text-white font-display">
            Multi-Carrier Consolidated Logistics
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Book, ship, and manage labels across the world's most trusted courier networks in one single unified dashboard.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center space-x-2">
          {['ALL', 'EXPRESS', 'REGIONAL', 'OCEAN'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Networks' : `${cat} Freight`}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((partner, idx) => (
            <div 
              key={idx}
              className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${
                partner.name === 'Swift Line Express'
                  ? 'border-2 border-[#FF6B00] shadow-xl relative'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {partner.name === 'Swift Line Express' && (
                <span className="absolute -top-3 right-6 bg-[#FF6B00] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Recommended Choice
                </span>
              )}

              <div className="space-y-4">
                {/* Logo Pill & Badge */}
                <div className="flex items-center justify-between">
                  <div className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider ${partner.logoBg}`}>
                    {partner.name}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {partner.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {partner.tagline}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Transit Speed</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{partner.speed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Global Reach</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{partner.coverage}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 pt-1 text-xs">
                  {partner.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Starting From</span>
                  <p className="text-xl font-black text-[#0F2C59] dark:text-[#FF6B00]">
                    {partner.basePrice} <span className="text-xs text-slate-400 font-normal">/ pkg (+{partner.perKg}/kg)</span>
                  </p>
                </div>
                <a
                  href="/rates"
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-700 dark:text-slate-200 transition-colors"
                  title="Compare Rates"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
