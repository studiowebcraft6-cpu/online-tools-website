import React, { useState } from 'react';
import { Search, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { ToolItem, ToolCategory } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface HeroProps {
  onSelectTool: (tool: ToolItem) => void;
  tools: ToolItem[];
  activeCategory: ToolCategory | 'all';
  onSelectCategory: (cat: ToolCategory | 'all') => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSelectTool,
  tools,
  activeCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Suggestions filtered by query
  const suggestions = searchQuery.trim()
    ? tools
        .filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const categoryTags: Array<{ id: ToolCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'All Tools', icon: 'Layers' },
    { id: 'pdf', label: 'PDF', icon: 'FileText' },
    { id: 'image', label: 'Image', icon: 'Image' },
    { id: 'video', label: 'Video', icon: 'Video' },
    { id: 'audio', label: 'Audio', icon: 'Music' },
    { id: 'document', label: 'Documents', icon: 'BookOpen' },
    { id: 'spreadsheet', label: 'Spreadsheets', icon: 'Table' },
    { id: 'developer', label: 'Developer', icon: 'Code' },
  ];

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Background ambient lighting subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Anti-pill clean kicker */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Local-First Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Zero Server Uploads</span>
          <span aria-hidden="true">·</span>
          <span>100% Client-Side Privacy</span>
        </div>

        {/* Master headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 text-balance max-w-3xl mx-auto">
          Free Online Tools for Every Task.
        </h1>

        {/* Tagline / Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          All your online tools in one simple place. Convert files, merge PDFs, compress photos, process audio, and generate developer utilities directly in your browser.
        </p>

        {/* Search Bar with instant autocomplete suggestions */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <div className="pl-3.5 pr-2 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search 100+ tools (e.g. merge pdf, compress image, qr code, mp3 to wav)..."
              className="w-full py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-left divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={() => onSelectTool(item)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <DynamicIcon name={item.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.shortDescription}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400 capitalize hidden sm:inline">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 p-1.5 max-w-3xl mx-auto rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/50">
          {categoryTags.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DynamicIcon name={tab.icon} className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global audience trust strip */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>GDPR & HIPAA Friendly</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>No Account Required</span>
          </div>
        </div>
      </div>
    </section>
  );
};
