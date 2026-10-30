import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, ShieldCheck, Menu, X, ArrowRight, UserCheck, LogOut } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../i18n/translations';

export default function Header({ theme, toggleTheme, lang, setLang, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.navHome, path: '/' },
    { name: t.navTracking, path: '/tracking' },
    { name: t.navServices, path: '/services' },
    { name: t.navAbout, path: '/about' },
    { name: t.navRates, path: '/rates' },
    { name: t.navContact, path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md py-3 border-b border-slate-200/80 dark:border-slate-800' 
        : 'bg-white dark:bg-slate-900 py-4 border-b border-slate-100 dark:border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive 
                    ? 'text-[#FF6B00] font-bold' 
                    : 'text-slate-700 hover:text-[#FF6B00] dark:text-slate-200 dark:hover:text-[#FF6B00]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & CTA Button */}
        <div className="hidden lg:flex items-center space-x-4">
          
          {/* Language Selector */}
          <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="ar">AR</option>
              <option value="zh">ZH</option>
            </select>
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Auth Portal Link */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2C59] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span className="capitalize">{user.role} Portal</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="text-xs font-bold text-[#0F2C59] dark:text-slate-200 hover:text-[#FF6B00] transition-colors"
            >
              Portal Login
            </Link>
          )}

          {/* TOP RIGHT CTA BUTTON - Required by user */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{t.ctaButton}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 rounded-xl bg-[#0F2C59] text-white font-bold text-sm"
            >
              Portal Login / Dashboard
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 rounded-xl bg-[#FF6B00] text-white font-bold text-sm shadow-md"
            >
              {t.ctaButton}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
