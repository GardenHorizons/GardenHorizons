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
      {/* Deep Jungle Gradient Base */}
      <div className="fixed inset-0 z-[-2] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-900/40 via-slate-950 to-blue-950" />
      
      {/* Intense Glow Spots */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[128px] mix-blend-screen pointer-events-none" />
      
      {/* Subtle Glowing Dots (Static Spores) */}
      <div className="fixed inset-0 z-[-2] opacity-20" 
           style={{
             backgroundImage: 'radial-gradient(rgba(52, 211, 153, 0.5) 1px, transparent 1px), radial-gradient(rgba(96, 165, 250, 0.5) 1px, transparent 1px)',
             backgroundSize: '60px 60px, 40px 40px',
             backgroundPosition: '0 0, 20px 20px'
           }} 
      />

      {/* Glossy Overlay */}
      <div className="fixed inset-0 z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
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
