import React from 'react';
import { ToolItem, ToolCategory, CategoryMeta } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ToolsGridProps {
  tools: ToolItem[];
  categories: CategoryMeta[];
  activeCategory: ToolCategory | 'all';
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  tools,
  categories,
  activeCategory,
  onSelectCategory,
  onSelectTool,
}) => {
  // Filtered tools
  const displayedTools =
    activeCategory === 'all'
      ? tools
      : tools.filter((t) => t.category === activeCategory);

  return (
    <section id="directory-section" className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Full Master Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              All Online Tools Directory
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Explore our complete suite of browser-native file converters, media processors, and developer utilities.
            </p>
          </div>

          {/* Category counter indicator */}
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing <span className="font-bold text-slate-900 dark:text-white font-mono">{displayedTools.length}</span> tools
          </div>
        </div>

        {/* Category Pills/Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Categories ({tools.length})
          </button>
          {categories.map((cat) => {
            const count = tools.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5" />
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                  </div>
                  {/* Clean unboxed category metadata with separator */}
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <span className="capitalize">{tool.category}</span>
                    {tool.isPopular && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Popular</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
