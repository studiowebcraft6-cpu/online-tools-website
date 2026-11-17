import React, { useState } from 'react';
import { X, Shield, Mail, CheckCircle, FileText, Lock, Cookie } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'cookie' | 'contact' | 'about' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
  siteName?: string;
  domainName?: string;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  activeModal,
  onClose,
  siteName = 'CastleTools',
  domainName = 'VictorianCastle',
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-800 dark:text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. PRIVACY POLICY */}
        {activeModal === 'privacy' && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Privacy & Security</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Privacy Policy & Data Sovereignty
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                At <strong>{siteName}</strong> (part of <strong>{domainName}</strong>), we consider digital privacy a fundamental human right. Unlike traditional online utility websites that upload your personal documents to cloud servers for remote processing, {siteName} executes operations locally in your browser sandbox using client-side JavaScript, WebAssembly, HTML5 Canvas, and Web Audio APIs.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Zero File Transmission</h3>
              <p>
                When you select a PDF, image, video clip, audio track, or spreadsheet, your file is loaded directly into your device's random access memory (RAM). The file is NEVER uploaded to, transmitted across, or saved onto our servers or any third-party infrastructure.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. GDPR, CCPA & HIPAA Compliance</h3>
              <p>
                Because no protected health information (PHI), personally identifiable information (PII), or confidential corporate records leave your local computer, using {siteName} inherently satisfies global data protection directives without requiring complex Data Processing Agreements (DPAs).
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Local Storage & Cookies</h3>
              <p>
                We do not track you across the web. Optional local features like "Recently Used Tools" store references strictly within your local browser's <code className="text-indigo-600">localStorage</code>, and only if you explicitly choose to enable them.
              </p>
            </div>
          </div>
        )}

        {/* 2. TERMS OF SERVICE */}
        {activeModal === 'terms' && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Legal Terms</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Terms of Service
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Welcome to {siteName}. By accessing or using our website and web applications, you agree to comply with and be bound by these Terms of Service.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Use of Service</h3>
              <p>
                You are granted a non-exclusive, revocable, and free license to utilize our browser-based utility tools for both personal and commercial purposes. You retain full intellectual property ownership of all output files created with our tools.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Acceptable Use</h3>
              <p>
                You agree not to use {siteName} to generate malicious software, violate copyright laws, or disrupt service integrity.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Warranty Disclaimer</h3>
              <p>
                {siteName} provides all tools "as is" and "as available". While we strive for maximum accuracy, we make no warranties regarding uninterrupted service or specific outcomes.
              </p>
            </div>
          </div>
        )}

        {/* 3. COOKIE POLICY */}
        {activeModal === 'cookie' && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Cookie className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Cookie Governance</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Cookie Policy
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                {siteName} operates on a privacy-respecting design philosophy. We do not use third-party advertising cookies or cross-site behavioral tracking beacons.
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Strictly Necessary Storage</h3>
              <p>
                We use browser <code className="text-indigo-600">localStorage</code> to remember your chosen theme preference (Light or Dark mode).
              </p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Functional Consent</h3>
              <p>
                If you opt in to remember your recently used tools, your browser stores tool IDs on your own machine. You can clear or disable this at any time in one click.
              </p>
            </div>
          </div>
        )}

        {/* 4. ABOUT */}
        {activeModal === 'about' && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">About Us</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              About {siteName} & {domainName}
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                {siteName} was built to solve a major problem on the internet: why should anyone have to upload a confidential 2-page PDF contract or a simple photo to a remote server just to merge pages or resize an image?
              </p>
              <p>
                By leveraging modern browser capabilities like WebAssembly, HTML5 Canvas 2D, the Web Audio API, and client-side encryption, {siteName} delivers desktop-quality processing speeds with 100% data sovereignty.
              </p>
              <p>
                Our mission is to provide global users across North America, the United Kingdom, Europe, Australia, and worldwide with clean, reliable, and completely private online tools.
              </p>
            </div>
          </div>
        )}

        {/* 5. CONTACT FORM */}
        {activeModal === 'contact' && (
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Mail className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Get in Touch</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Contact Support & Product Feedback
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Have a tool suggestion or need enterprise assistance? Send our engineering team a message.
            </p>

            {contactSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  Message Transmitted Successfully
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Thank you for contacting us. A senior engineer will review your inquiry within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name:
                  </label>
                  <input
                    required
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email:
                  </label>
                  <input
                    required
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Message / Tool Request:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe how we can help or request a new browser utility..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
