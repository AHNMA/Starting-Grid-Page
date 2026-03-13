import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PodcastInfo } from '../types';

interface HeaderProps {
  info: PodcastInfo;
}

export default function Header({ info }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-f1dark/95 border-b-2 border-f1red shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4 group cursor-pointer">
          {info?.logo_image ? (
            <>
              <img src={info.logo_image} alt="Starting Grid Logo" className="h-6 sm:h-8 md:h-10 object-contain group-hover:scale-105 transition-transform duration-300" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black tracking-wide uppercase italic mt-1">Starting Grid</h1>
            </>
          ) : (
            <>
              {info?.cover_image ? (
                <img src={info.cover_image} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-f1red group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full border-2 border-f1red bg-white/10" />
              )}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black tracking-wide uppercase italic mt-1">Starting Grid</h1>
            </>
          )}
        </a>
        <nav className="hidden md:flex gap-8 text-sm font-display font-bold uppercase tracking-widest text-gray-400">
          <a href="/#hero" className="hover:text-white hover:text-shadow-glow transition-all">Aktuelle Ausgabe</a>
          <a href="/#about" className="hover:text-white hover:text-shadow-glow transition-all">Der Podcast</a>
          <a href="/#hosts" className="hover:text-white hover:text-shadow-glow transition-all">Unsere Hosts</a>
          <a href="/#episodes" className="hover:text-white hover:text-shadow-glow transition-all">Archiv</a>
        </nav>
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-f1dark border-b border-white/10 px-4 py-4 flex flex-col gap-4 font-display font-bold uppercase tracking-widest text-lg">
          <a href="/#hero" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Aktuelle Ausgabe</a>
          <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Der Podcast</a>
          <a href="/#hosts" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Unsere Hosts</a>
          <a href="/#episodes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Archiv</a>
        </div>
      )}
    </header>
  );
}
