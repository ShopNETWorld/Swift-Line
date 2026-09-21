import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function FAQSection({ lang = 'en' }) {
  const t = translations[lang] || translations.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({ 0: true }); // First open by default

  const faqList = useMemo(() => [
    {
      id: 0,
      q: t.q1,
      a: t.a1,
      category: "Telemetry & GPS"
    },
    {
      id: 1,
      q: t.q2,
      a: t.a2,
      category: "Delivery Times"
    },
    {
      id: 2,
      q: t.q3,
      a: t.a3,
      category: "Customs Clearance"
    },
    {
      id: 3,
      q: t.q4,
      a: t.a4,
      category: "Prohibited Goods"
    },
    {
      id: 4,
      q: t.q5,
      a: t.a5,
      category: "Insurance & Safety"
    },
    {
      id: 5,
      q: t.q6,
      a: t.a6,
      category: "Documents & Labels"
    }
  ], [t]);

  const toggleItem = (idx) => {
    setOpenItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const filteredFaqs = faqList.filter(item => 
    item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title & Badge */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-orange-100 dark:bg-orange-950/50 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/60">
          <HelpCircle className="w-4 h-4" />
          {t.faqTag}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] dark:text-white font-display">
          {t.faqTitle}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.faqSubtitle}
        </p>

        {/* Live Search Bar */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.faqSearchPlaceholder}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching questions found for "{searchTerm}".
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ask our 24/7 AI Support Chat Widget in the bottom-right corner for immediate assistance.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen
                    ? 'bg-white dark:bg-slate-900 border-[#FF6B00]/60 shadow-lg ring-1 ring-[#FF6B00]/20'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F2C59] dark:text-slate-300 shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {faq.q}
                    </h3>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#FF6B00]" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed space-y-2">
                    <p>{faq.a}</p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Official Swift Line Global Policy</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating prompt box */}
      <div className="max-w-2xl mx-auto text-center bg-slate-100 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Still have questions?</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Our live AI Assistant is trained on global customs regulations and flight schedules.</p>
          </div>
        </div>
        <button
          onClick={() => {
            const aiBtn = document.querySelector('[data-ai-chat-btn]');
            if (aiBtn) aiBtn.click();
          }}
          className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow whitespace-nowrap"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>Ask AI Assistant</span>
        </button>
      </div>
    </section>
  );
}
