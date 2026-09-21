import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api.js';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/ai/email-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: formData.email,
          messages: [{ sender: 'user', text: `Subject: ${formData.subject}\n\n${formData.message}` }]
        })
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest bg-amber-100 dark:bg-amber-950/40 px-3 py-1 rounded-full">
            24/7 Global Support
          </span>
          <h1 className="text-4xl font-extrabold text-[#0F2C59] dark:text-white font-display">Contact Swift Line Worldwide</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Have questions about your international parcel? Send an inquiry directly to our dispatch team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-[#0F2C59] text-white p-8 rounded-3xl shadow-xl space-y-8">
            <h3 className="text-xl font-bold font-display">Global Headquarters</h3>
            
            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FF6B00] text-white"><MapPin className="w-5 h-5" /></div>
                <div>
                  <span className="font-bold block text-slate-200">Address</span>
                  <p className="text-slate-300">742 Fifth Avenue, Suite 12, New York, NY 10019, USA</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FF6B00] text-white"><Phone className="w-5 h-5" /></div>
                <div>
                  <span className="font-bold block text-slate-200">24/7 Support Hotline</span>
                  <p className="text-slate-300">+1 (800) 555-SWIFT (79438)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FF6B00] text-white"><Mail className="w-5 h-5" /></div>
                <div>
                  <span className="font-bold block text-slate-200">Email Address</span>
                  <p className="text-slate-300">support@myswiftline.com</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/60 text-xs text-slate-300">
              URL: <a href="https://myswiftline.com" className="text-[#FF6B00] underline font-bold">https://myswiftline.com</a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            {success ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-2xl font-bold text-[#0F2C59] dark:text-white">Message Dispatched via SMTP!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Our customer service team has received your ticket and dispatched a confirmation to your email.</p>
                <button onClick={() => setSuccess(false)} className="px-6 py-2.5 rounded-xl bg-[#FF6B00] text-white font-bold text-xs">Send Another Ticket</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-[#0F2C59] dark:text-white font-display mb-4">Send Us a Direct Message</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Tracking Inquiry / Custom Quote"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write details of your shipment query here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmitting SMTP Message...' : 'Submit Support Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
