import React, { useState, useEffect } from 'react';
import { ToolItem, ToolCategory } from './types';
import { TOOLS, CATEGORIES } from './data/tools';
import { ARTICLES } from './data/articles';
import { FAQS } from './data/faqs';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RecentTools } from './components/RecentTools';
import { PopularTools } from './components/PopularTools';
import { ToolsGrid } from './components/ToolsGrid';
import { EducationalArticles } from './components/EducationalArticles';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ToolWorkspace } from './components/ToolWorkspace';
import { SearchModal } from './components/SearchModal';
import { LegalModals, LegalModalType } from './components/LegalModals';

export default function App() {
  // Brand Configuration (Configurable site name and domain)
  const siteName = 'CastleTools';
  const domainName = 'VictorianCastle';

  // Navigation and active states
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('castletools_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('castletools_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('castletools_theme', 'light');
    }
  }, [darkMode]);

  // URL Hash routing for deep linking into tools
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = TOOLS.find((t) => t.slug === hash || t.id === hash);
        if (found) {
          setActiveTool(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectTool = (tool: ToolItem) => {
    setActiveTool(tool);
    window.location.hash = tool.slug;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setActiveTool(null);
    history.pushState('', document.title, window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    if (activeTool) {
      setActiveTool(null);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar
        siteName={siteName}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onNavigateHome={handleNavigateHome}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTool ? (
          /* Active Tool Workspace */
          <ToolWorkspace
            tool={activeTool}
            onBack={handleNavigateHome}
            onSelectTool={handleSelectTool}
            allTools={TOOLS}
          />
        ) : (
          /* Master Directory & Landing Page */
          <>
            {/* Hero Section */}
            <Hero
              tools={TOOLS}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onSelectTool={handleSelectTool}
            />

            {/* Consent-based Recent Tools */}
            <RecentTools
              allTools={TOOLS}
              onSelectTool={handleSelectTool}
            />

            {/* Popular Tools Grid */}
            <PopularTools
              tools={TOOLS}
              onSelectTool={handleSelectTool}
            />

            {/* Complete Category-Based Master Directory */}
            <ToolsGrid
              tools={TOOLS}
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onSelectTool={handleSelectTool}
            />

            {/* SEO-Friendly Educational Articles */}
            <EducationalArticles articles={ARTICLES} />

            {/* Pricing Section */}
            <PricingSection />

            {/* FAQ Section */}
            <FaqSection faqs={FAQS} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        siteName={siteName}
        domainName={domainName}
        onSelectCategory={(cat) => {
          if (activeTool) setActiveTool(null);
          setActiveCategory(cat);
          handleScrollToSection('directory-section');
        }}
        onOpenLegalModal={(modal) => setLegalModal(modal)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Quick Search Palette (Ctrl+K) */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        tools={TOOLS}
        onSelectTool={handleSelectTool}
      />

      {/* Legal & Compliance Modals */}
      <LegalModals
        activeModal={legalModal}
        onClose={() => setLegalModal(null)}
        siteName={siteName}
        domainName={domainName}
      />
    </div>
  );
}
