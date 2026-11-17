import React from 'react';
import { Wrench, Shield, Globe, Heart } from 'lucide-react';
import { ToolCategory } from '../types';
import { LegalModalType } from './LegalModals';

interface FooterProps {
  siteName?: string;
  domainName?: string;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onOpenLegalModal: (modal: LegalModalType) => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteName = 'CastleTools',
  domainName = 'VictorianCastle',
  onSelectCategory,
  onOpenLegalModal,
  onScrollToTop,
}) => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
      {/* Top Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={onScrollToTop}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {siteName}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              All Your Online Tools. One Simple Place. Free browser utilities for PDF editing, image conversion, video trimming, audio normalization, and developer workflows.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Client-Side RAM Processing · Zero Cloud Uploads</span>
            </div>

            <div className="text-[11px] text-slate-500">
              Operating on <span className="font-semibold text-slate-700 dark:text-slate-300">{domainName}</span> domain architecture.
            </div>
          </div>

          {/* Column 1: PDF Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              PDF Utilities
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Merge PDF Documents
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Split PDF Pages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Compress PDF Size
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  JPG & PNG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Rotate & Watermark PDF
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Media Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Media & Image
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('image')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Compressor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('image')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  JPG / PNG / WebP Converter
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('video')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Extract Audio from Video
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('audio')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Voice & Microphone Memo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('audio')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Audio Volume Booster
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Company & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenLegalModal('about')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About {siteName}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('contact')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('privacy')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy (GDPR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('terms')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('cookie')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {siteName} ({domainName}). All rights reserved. Fast, private, browser-native tools.
          </div>
          <div className="flex items-center gap-4">
            <span>Built for US, UK, CA, AU & EU users</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:underline"
            >
              Privacy Safe
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegalModal('terms')}
              className="hover:underline"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
