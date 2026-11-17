import { FAQItem } from '../types';

export const FAQS: FAQItem[] = [
  {
    id: 'faq-privacy',
    question: 'Are my files uploaded to your servers or stored anywhere?',
    answer: 'No. CastleTools is built with client-side, browser-native processing. Your PDFs, photos, audio clips, and documents are processed entirely in your browser memory using WebAssembly, HTML5 Canvas, and Web Audio APIs. Your files are never sent across the internet to remote servers.',
    category: 'Privacy & Security',
  },
  {
    id: 'faq-free',
    question: 'Is CastleTools truly free to use?',
    answer: 'Yes! All core tools—including PDF merging and splitting, image compression, format converters, audio cutters, QR generation, and developer utilities—are 100% free with no hidden charges, watermarks, or artificial limits on routine tasks.',
    category: 'Pricing & Limits',
  },
  {
    id: 'faq-gdpr',
    question: 'Is CastleTools compliant with GDPR, HIPAA, and CCPA regulations?',
    answer: 'Because documents and sensitive data do not traverse or get stored on remote servers, CastleTools naturally adheres to the strictest global data sovereignty regulations. You maintain 100% custody of your sensitive legal, medical, and financial documents at all times.',
    category: 'Privacy & Security',
  },
  {
    id: 'faq-file-size',
    question: 'What is the maximum file size I can process?',
    answer: 'Because processing occurs in your browser RAM, file size limits depend on your computer or device memory. Most modern desktop computers smoothly handle PDFs and images up to 250MB–500MB without issues.',
    category: 'Technical Specifications',
  },
  {
    id: 'faq-offline',
    question: 'Can I use CastleTools offline or in airplane mode?',
    answer: 'Yes! Once the application is loaded into your browser cache, the client-side conversion and processing algorithms run locally without an active internet connection.',
    category: 'Technical Specifications',
  },
  {
    id: 'faq-batch',
    question: 'Can I convert or merge multiple files in batch?',
    answer: 'Yes, tools such as Merge PDF, JPG to PDF, Favicon Generator, and UUID Generator natively support multi-file selection, batch ordering, and bulk downloads.',
    category: 'Usage & Features',
  },
  {
    id: 'faq-commercial',
    question: 'Can I use files processed with CastleTools for commercial business projects?',
    answer: 'Absolutely. You retain complete ownership of all created and processed output files, including generated QR codes, cropped marketing imagery, and merged client presentations.',
    category: 'Licensing & Rights',
  },
];
