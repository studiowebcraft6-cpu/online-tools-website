import React, { useState, useEffect } from 'react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Clock, Trash2, ShieldCheck } from 'lucide-react';

interface RecentToolsProps {
  allTools: ToolItem[];
  onSelectTool: (tool: ToolItem) => void;
  currentToolId?: string;
}

const STORAGE_KEY_RECENT = 'castletools_recent_tools';
const STORAGE_KEY_CONSENT = 'castletools_history_consent';

export const RecentTools: React.FC<RecentToolsProps> = ({ allTools, onSelectTool, currentToolId }) => {
  const [consentGiven, setConsentGiven] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_CONSENT) === 'true';
  });
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  // Load from local storage
  useEffect(() => {
    if (consentGiven) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_RECENT);
        if (stored) {
          setRecentToolIds(JSON.parse(stored));
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [consentGiven]);

  // Track current tool if consent given
  useEffect(() => {
    if (consentGiven && currentToolId) {
      setRecentToolIds((prev) => {
        const filtered = prev.filter((id) => id !== currentToolId);
        const updated = [currentToolId, ...filtered].slice(0, 5);
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentToolId, consentGiven]);

  const handleToggleConsent = () => {
    const next = !consentGiven;
    setConsentGiven(next);
    localStorage.setItem(STORAGE_KEY_CONSENT, String(next));
    if (!next) {
      // Clear data on revoke
      localStorage.removeItem(STORAGE_KEY_RECENT);
      setRecentToolIds([]);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY_RECENT);
    setRecentToolIds([]);
  };

  const recentTools = recentToolIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is ToolItem => Boolean(t));

  if (!consentGiven) {
    return (
      <section className="py-6 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Enable "Recently Used Tools" for faster workflow? Stored exclusively on your local device.</span>
          </div>
          <button
            onClick={handleToggleConsent}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold transition-colors cursor-pointer"
          >
            Enable Local History
          </button>
        </div>
      </section>
    );
  }

  if (recentTools.length === 0) return null;

  return (
    <section className="py-6 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Recently Used Tools (Stored locally with your consent)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearHistory}
              className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
            <button
              onClick={handleToggleConsent}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Disable
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {recentTools.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTool(t)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm transition-all cursor-pointer group"
            >
              <DynamicIcon name={t.iconName} className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
