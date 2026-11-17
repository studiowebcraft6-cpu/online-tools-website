import React from 'react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { ArrowUpRight, Flame } from 'lucide-react';

interface PopularToolsProps {
  tools: ToolItem[];
  onSelectTool: (tool: ToolItem) => void;
}

export const PopularTools: React.FC<PopularToolsProps> = ({ tools, onSelectTool }) => {
  const popularTools = tools.filter((t) => t.isPopular).slice(0, 8);

  return (
    <section id="popular-tools" className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>Most Used by Millions Worldwide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Popular Online Tools
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Free forever · Instant client-side launch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                  </div>
                  {/* Clean unboxed category metadata with separator */}
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Open Tool</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
