import React from 'react';
import { Link } from 'react-router-dom';
import { translations } from '../i18n/translations';

export default function Footer({ lang = 'en' }) {
  const t = translations[lang] || translations.en;

  return (
    <footer className="bg-[#0F2C59] text-white pt-16 pb-8 border-t-4 border-[#FF6B00] no-print">
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
            <li><Link to="/tracking" className="hover:text-[#FF6B00] transition-colors">{t.navTracking}</Link></li>
            <li><Link to="/services" className="hover:text-[#FF6B00] transition-colors">{t.navServices}</Link></li>
            <li><Link to="/about" className="hover:text-[#FF6B00] transition-colors">{t.navAbout}</Link></li>
            <li><Link to="/rates" className="hover:text-[#FF6B00] transition-colors">{t.navRates}</Link></li>
            <li><Link to="/contact" className="hover:text-[#FF6B00] transition-colors">{t.navContact}</Link></li>
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
  );
}
