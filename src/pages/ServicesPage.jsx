import React from 'react';
import { Plane, Ship, ShieldCheck, Truck, Globe, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import CourierPartners from '../components/CourierPartners';

export default function ServicesPage() {
  return (
    <div className="pt-24 pb-16 space-y-16">
      
      {/* Header Banner */}
      <section className="bg-[#0F2C59] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] bg-white/10 px-4 py-1 rounded-full">
            Worldwide Freight Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display">
            Comprehensive Express Logistics
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            From overnight express parcels to full ocean container lines, Swift Line connects your supply chain globally.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Door-to-Door Air Express</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our priority express flight network operates daily cargo runs connecting North America, Europe, Asia-Pacific, and the Middle East. Includes real-time satellite telemetry and signature confirmation upon delivery.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center font-bold">
              <Ship className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ocean Cargo & Port Clearing</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Consolidated ocean freight (LCL/FCL) with integrated customs clearance at 300+ international maritime ports. Ideal for heavy machinery, raw materials, and high-volume commercial goods.
            </p>
          </div>

        </div>
      </section>

      <CourierPartners />

    </div>
  );
}
