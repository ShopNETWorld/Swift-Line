import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import TrackingPage from './pages/TrackingPage';
import ServicesPage from './pages/ServicesPage';
import RatesPage from './pages/RatesPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import LabelGenerator from './components/LabelGenerator';
import ReceiptGenerator from './components/ReceiptGenerator';

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('swift_theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('swift_lang') || 'en');
  const [user, setUser] = useState(null);
  
  const [activeLabel, setActiveLabel] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('swift_theme', theme);
  }, [theme]);

  // Sync language & RTL support for Arabic
  useEffect(() => {
    localStorage.setItem('swift_lang', lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [lang]);

  // Check stored user token on mount
  useEffect(() => {
    const token = localStorage.getItem('swift_token');
    const storedUser = localStorage.getItem('swift_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    localStorage.setItem('swift_token', tokenData);
    localStorage.setItem('swift_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('swift_token');
    localStorage.removeItem('swift_user');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        
        {/* Navigation Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          lang={lang}
          setLang={setLang}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Views Router */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/about" element={<AboutUs lang={lang} />} />
            <Route 
              path="/tracking" 
              element={
                <TrackingPage 
                  lang={lang}
                  onSelectLabel={(shp) => setActiveLabel(shp)}
                  onSelectReceipt={(shp) => setActiveReceipt(shp)}
                />
              } 
            />
            <Route path="/services" element={<ServicesPage lang={lang} />} />
            <Route path="/couriers" element={<AboutUs lang={lang} />} />
            <Route path="/rates" element={<RatesPage lang={lang} />} />
            <Route path="/contact" element={<ContactPage lang={lang} />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  lang={lang}
                  user={user} 
                  onLogin={handleLogin} 
                  onLogout={handleLogout} 
                />
              } 
            />
          </Routes>
        </main>

        {/* Global Footer (shown on all pages) */}
        <Footer lang={lang} />

        {/* Floating AI Chat Assistant */}
        <AIChatWidget />

        {/* Global Print Modal Overlays */}
        {activeLabel && (
          <LabelGenerator shipment={activeLabel} onClose={() => setActiveLabel(null)} />
        )}
        {activeReceipt && (
          <ReceiptGenerator shipment={activeReceipt} onClose={() => setActiveReceipt(null)} />
        )}

      </div>
    </Router>
  );
}
