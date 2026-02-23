import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Menu, X, ExternalLink, Gamepad2, Play, Shield } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Determine background based on route
  // Background images removed in favor of gradient

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Mutations', path: '/mutations' },
    { name: 'Plants', path: '/plants' },
    { name: 'Codes', path: '/codes' },
    { name: 'Updates', path: '/updates' },
    { name: 'Hall of Fame', path: '/hall-of-fame' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans bg-black">
      {/* Dynamic Background with Gradient & Glow */}
      <div className="fixed inset-0 z-[-2] bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gh-green-dark/40 via-purple-900/40 to-blue-900/40 opacity-80" />
      <div className="fixed inset-0 z-[-2] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent blur-3xl" />
      <div className="fixed inset-0 z-[-2] bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none" />
      
      {/* Glossy Overlay */}
      <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                {settings?.app_icon_url && (
                  <img src={settings.app_icon_url} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg ring-1 ring-white/10 group-hover:ring-gh-green-light transition-all duration-300" />
                )}
                <div className="absolute -inset-1 bg-gh-green-light/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl tracking-wide text-white group-hover:text-glow-green transition-all">
                Garden Horizons
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-all duration-300 hover:text-gh-green-light relative py-2 tracking-wide",
                    location.pathname === item.path ? "nav-link-active" : "text-gray-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="md:hidden glass-panel border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-all",
                    location.pathname === item.path 
                      ? "bg-gh-green-mid/30 text-gh-green-light border border-gh-green-light/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-8 md:pt-12 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-8 md:py-10 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs md:text-sm text-gray-500 font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} Garden Horizons Official. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
            {settings?.discord_invite_url && (
              <a 
                href={settings.discord_invite_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] hover:text-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all border border-[#5865F2]/20 group"
              >
                <Gamepad2 size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="font-semibold text-xs md:text-sm">Join Discord</span>
              </a>
            )}
            
            {settings?.game_url && (
              <a 
                href={settings.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-gh-green-light/10 hover:bg-gh-green-light/20 text-gh-green-light hover:text-gh-green-light hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all border border-gh-green-light/20 group"
              >
                <Play size={16} className="md:w-[18px] md:h-[18px] fill-current" />
                <span className="font-semibold text-xs md:text-sm">Join Game</span>
              </a>
            )}

            <Link to="/admin/login" className="p-2 text-gray-700 hover:text-gray-500 transition-colors ml-2 opacity-50 hover:opacity-100" aria-label="Moderation Login">
              <Shield size={14} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
