import React, { useState } from 'react';
import { SEOArticle } from '../types';
import { BookOpen, ArrowRight, X, Clock, Calendar } from 'lucide-react';

interface EducationalArticlesProps {
  articles: SEOArticle[];
}

export const EducationalArticles: React.FC<EducationalArticlesProps> = ({ articles }) => {
  const [activeArticle, setActiveArticle] = useState<SEOArticle | null>(null);

  return (
    <section id="guides-section" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base & Tutorials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practical Guides & Optimization Articles
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Learn technical best practices for digital file formatting, privacy compliance, and browser-native processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Clean unboxed metadata with typographic separators */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span>{art.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ARTICLE READER MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <span>{activeArticle.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.readTime}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.publishedDate}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
              {activeArticle.title}
            </h2>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {activeArticle.excerpt}
            </p>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
