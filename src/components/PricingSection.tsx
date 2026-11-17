import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [billingAnnual, setBillingAnnual] = useState(false);

  return (
    <section id="pricing-section" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <Zap className="w-4 h-4" />
            <span>Fair & Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Simple Plans for Individuals and Teams
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            All core tools are free forever with no registration required. Upgrade when you need massive batch automation and cloud OCR scalability.
          </p>

          {/* Billing Switcher (in Workspace / Section, strictly outside TopBar) */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setBillingAnnual(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !billingAnnual
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingAnnual(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingAnnual
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] text-emerald-600 font-bold">Save 25%</span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* 1. Free Community Plan */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                For Individuals & Daily Tasks
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free Starter</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Complete browser-native access to every utility with zero server retention.
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">$0</span>
                <span className="text-xs text-slate-500">/ forever free</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited standard PDF & Image tools</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% private in-browser execution</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No login or account registration needed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 250MB single file RAM processing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero ads and no watermarks</span>
                </li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors cursor-pointer">
              Active by Default
            </button>
          </div>

          {/* 2. Pro Pass Plan (Highlighted) */}
          <div className="p-8 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[11px] font-bold tracking-wide uppercase">
              Most Popular
            </div>

            <div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                For Power Users & Professionals
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pro Power Pass</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Ultra-high-speed batch queuing and server-assisted high-res transcoding.
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {billingAnnual ? '$3.75' : '$4.99'}
                </span>
                <span className="text-xs text-slate-500">/ month, billed {billingAnnual ? 'annually ($45)' : 'monthly'}</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">Batch process 100+ files simultaneously</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Advanced OCR scan-to-searchable text</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Uncapped file sizes (up to 4GB media clips)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Permanent ad-free experience</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Priority email support & early feature rollouts</span>
                </li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-md">
              Upgrade to Pro
            </button>
          </div>

          {/* 3. Team & Enterprise Plan */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                For Workspaces & Agencies
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team & Enterprise</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Custom branded domain portal, REST API tokens, and SOC2/HIPAA compliance logs.
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {billingAnnual ? '$11.99' : '$14.99'}
                </span>
                <span className="text-xs text-slate-500">/ seat / month</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All Pro Power Pass features for every seat</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Developer REST API tokens (50k requests/mo)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom white-label branding & domain</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enterprise SLA & dedicated support engineer</span>
                </li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors cursor-pointer">
              Contact Enterprise
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
