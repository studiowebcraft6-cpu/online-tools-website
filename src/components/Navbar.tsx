import React, { useState } from 'react';
import { Sun, Moon, Search, Wrench, Menu, X } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  siteName?: string;
  onNavigateHome: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  siteName = 'CastleTools',
  onNavigateHome,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with castle motif */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {siteName}
            </span>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onScrollToSection('popular-tools')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Popular
            </button>
            <button
              onClick={() => onScrollToSection('directory-section')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              All Categories
            </button>
            <button
              onClick={() => onScrollToSection('guides-section')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Guides
            </button>
            <button
              onClick={() => onScrollToSection('pricing-section')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => onScrollToSection('faq-section')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Zone 3: Search + Dark mode + 1 Primary action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Search tools"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search (Ctrl+K)</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle color theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={() => onScrollToSection('directory-section')}
              className="hidden lg:inline-flex px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Directory
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-2 bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              onScrollToSection('popular-tools');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Popular Tools
          </button>
          <button
            onClick={() => {
              onScrollToSection('directory-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            All Categories
          </button>
          <button
            onClick={() => {
              onScrollToSection('guides-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Guides & Articles
          </button>
          <button
            onClick={() => {
              onScrollToSection('pricing-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Pricing
          </button>
          <button
            onClick={() => {
              onScrollToSection('faq-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
};
