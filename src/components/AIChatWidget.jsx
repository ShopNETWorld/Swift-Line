import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mail, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../utils/api.js';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I am Swift Line AI Assistant. How can I help you today? You can ask me about live package tracking (e.g. `SL-9842104-US`), shipping rates, or courier partners!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "I'm having trouble processing that request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Server connection issue. Please check your network.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailTranscript = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      const res = await apiFetch('/api/ai/email-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: emailInput.trim(),
          messages
        })
      });
      if (res.ok) {
        setEmailSentSuccess(true);
        setTimeout(() => {
          setEmailSentSuccess(false);
          setEmailModalOpen(false);
          setEmailInput('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-4 rounded-2xl bg-[#0F2C59] text-white shadow-2xl hover:bg-[#1E40AF] transition-all transform hover:scale-105 active:scale-95 border-2 border-[#FF6B00] glow-orange flex items-center gap-2 group"
          title="Swift Line AI Assistant"
        >
          <Bot className="w-6 h-6 text-[#FF6B00]" />
          <span className="hidden sm:inline font-bold text-xs pr-1">AI Assistant</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </button>
      </div>

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-slide">
          
          {/* Header */}
          <div className="bg-[#0F2C59] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                  Swift Line AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <span className="text-[10px] text-slate-300">Live GPS & SMTP Integrated</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEmailModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                title="Email Chat Transcript"
              >
                <Mail className="w-4 h-4 text-[#FF6B00]" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email Transcript Modal Overlay */}
          {emailModalOpen && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 p-4 flex flex-col justify-center text-white">
              {emailSentSuccess ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm">Transcript Emailed Successfully via SMTP!</p>
                </div>
              ) : (
                <form onSubmit={handleSendEmailTranscript} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm">Send Chat to Email</h5>
                    <button type="button" onClick={() => setEmailModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs text-slate-300">Enter your email address to receive this complete support transcript.</p>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-xs shadow"
                  >
                    Send Email Transcript
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#FF6B00] text-white font-medium rounded-br-none shadow'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-orange-100 text-right' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Bot className="w-4 h-4 animate-spin text-[#FF6B00]" />
                <span>AI processing response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI or type SL-9842104-US..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#FF6B00] text-white hover:bg-[#E05D00] disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
