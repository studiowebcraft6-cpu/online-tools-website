import React, { useState, useRef, useEffect } from 'react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { mergePDFs, splitPDF, rotatePDF, imagesToPDF, watermarkPDF, addPageNumbersPDF, getPDFInfo } from '../utils/pdfTools';
import { convertImageFormat, compressImage, resizeImage, applyImageFilter, addWatermarkToImage, generateFavicons, loadImageFromFile } from '../utils/imageTools';
import { extractAudioFromVideo } from '../utils/videoTools';
import { trimAudio, boostAudioVolume, changeAudioSpeed } from '../utils/audioTools';
import { generateQRCodeCanvas, calculateHash, simpleMD5, generatePassword, analyzeText, convertCase, csvToJson, jsonToCsv } from '../utils/devTools';
import {
  Upload, Download, RefreshCw, Check, Copy, ArrowLeft,
  Sliders, Shield, AlertCircle, FileCheck, Play, Pause, Square
} from 'lucide-react';

interface ToolWorkspaceProps {
  tool: ToolItem;
  onBack: () => void;
  onSelectTool: (tool: ToolItem) => void;
  allTools: ToolItem[];
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  onBack,
  onSelectTool,
  allTools,
}) => {
  // Common states
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('output');
  const [resultMeta, setResultMeta] = useState<{ originalSize?: number; newSize?: number; details?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Tool specific states
  const [pdfPageRanges, setPdfPageRanges] = useState('1-3');
  const [rotateAngle, setRotateAngle] = useState(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number; title: string; author: string; pageSize: string } | null>(null);

  // Image states
  const [imgQuality, setImgQuality] = useState(75);
  const [imgMaxWidth, setImgMaxWidth] = useState(1920);
  const [targetImageFormat, setTargetImageFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
  const [imgFilter, setImgFilter] = useState<'grayscale' | 'sepia' | 'invert' | 'blur' | 'sharpen' | 'sketch'>('grayscale');
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [favicons, setFavicons] = useState<Array<{ size: number; url: string; blob: Blob }>>([]);

  // Video / Audio states
  const [audioStart, setAudioStart] = useState(0);
  const [audioEnd, setAudioEnd] = useState(30);
  const [volumeBoost, setVolumeBoost] = useState(1.5);
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Dev & Text states
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [qrSize, setQrSize] = useState(260);
  const [qrFg, setQrFg] = useState('#0f172a');
  const [qrBg, setQrBg] = useState('#ffffff');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorPickerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Password generator
  const [pwdLen, setPwdLen] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNums, setUseNums] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [pwdResult, setPwdResult] = useState<{ password: string; entropyBits: number; strength: string } | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset states when tool changes
  useEffect(() => {
    setFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setErrorMsg(null);
    setResultUrl(null);
    setResultMeta(null);
    setPdfInfo(null);
    setFavicons([]);
    setPickedColor(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-setup for text-based dev tools
    if (tool.id === 'password-generator') {
      const initial = generatePassword({
        length: 16,
        useUpper: true,
        useLower: true,
        useNumbers: true,
        useSymbols: true,
        avoidAmbiguous: false,
      });
      setPwdResult(initial);
    } else if (tool.id === 'qr-code-generator') {
      setTextInput('https://castletools.io');
    } else if (tool.id === 'json-formatter') {
      setTextInput('{"name":"CastleTools","type":"suite","fast":true,"toolsCount":100}');
    } else if (tool.id === 'markdown-to-html') {
      setTextInput('# Hello from CastleTools\n\nAll your online tools in **one simple place**.\n\n- Zero server uploads\n- 100% private in-browser processing\n- Fast client-side performance');
    } else if (tool.id === 'csv-to-json') {
      setTextInput('Name,Role,Department,Location\nAlice Smith,Product Lead,Design,London\nDavid Miller,Senior Engineer,Platform,San Francisco\nElena Rossi,Data Architect,Analytics,Berlin');
    }
  }, [tool.id]);

  // Handle QR redraw
  useEffect(() => {
    if (tool.id === 'qr-code-generator' && qrCanvasRef.current) {
      generateQRCodeCanvas(qrCanvasRef.current, textInput || 'https://castletools.io', {
        size: qrSize,
        fgColor: qrFg,
        bgColor: qrBg,
      });
    }
  }, [tool.id, textInput, qrSize, qrFg, qrBg]);

  // Handle File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setErrorMsg(null);
      setResultUrl(null);

      // Auto inspect PDF if page counter tool
      if (tool.id === 'pdf-page-counter' && selected[0]) {
        getPDFInfo(selected[0])
          .then((info) => setPdfInfo(info))
          .catch((err) => setErrorMsg(err.message));
      }

      // Auto draw color picker image
      if (tool.id === 'image-color-picker' && selected[0]) {
        loadImageFromFile(selected[0]).then((img) => {
          if (colorPickerCanvasRef.current) {
            const canvas = colorPickerCanvasRef.current;
            canvas.width = Math.min(600, img.naturalWidth);
            canvas.height = Math.round((canvas.width / img.naturalWidth) * img.naturalHeight);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
          }
        });
      }
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setErrorMsg(null);
      setResultUrl(null);
    }
  };

  // Helper download trigger
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper copy text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // VOICE RECORDER HANDLERS
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setResultUrl(url);
        setResultFileName(`recording_${Date.now()}.wav`);
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg('Microphone access denied or not available. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // EXECUTE PROCESS
  const executeProcess = async () => {
    setIsProcessing(true);
    setProgress(15);
    setErrorMsg(null);

    try {
      // 1. PDF Tools
      if (tool.id === 'merge-pdf') {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge.');
        setProgress(45);
        const mergedBytes = await mergePDFs(files);
        setProgress(90);
        const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName('merged_document.pdf');
        setResultMeta({
          details: `Successfully combined ${files.length} PDF files into 1 document.`,
          newSize: blob.size,
        });
      } else if (tool.id === 'split-pdf') {
        if (!files[0]) throw new Error('Please select a PDF file to split.');
        setProgress(50);
        const splitBytes = await splitPDF(files[0], pdfPageRanges);
        const blob = new Blob([splitBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName(`split_pages_${pdfPageRanges.replace(/\s+/g, '')}.pdf`);
        setResultMeta({ details: `Extracted pages: ${pdfPageRanges}`, newSize: blob.size });
      } else if (tool.id === 'rotate-pdf') {
        if (!files[0]) throw new Error('Please select a PDF file to rotate.');
        setProgress(50);
        const rotatedBytes = await rotatePDF(files[0], rotateAngle);
        const blob = new Blob([rotatedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName(`rotated_${rotateAngle}deg_${files[0].name}`);
        setResultMeta({ details: `Rotated by ${rotateAngle}° clockwise`, newSize: blob.size });
      } else if (tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf' || tool.id === 'webp-to-pdf') {
        if (files.length === 0) throw new Error('Please select at least one image file.');
        setProgress(50);
        const pdfBytes = await imagesToPDF(files);
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName('converted_images.pdf');
        setResultMeta({ details: `Converted ${files.length} images to PDF.`, newSize: blob.size });
      } else if (tool.id === 'watermark-pdf') {
        if (!files[0]) throw new Error('Please select a PDF file.');
        setProgress(50);
        const markedBytes = await watermarkPDF(files[0], watermarkText);
        const blob = new Blob([markedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName(`watermarked_${files[0].name}`);
        setResultMeta({ details: `Applied watermark "${watermarkText}" across all pages.`, newSize: blob.size });
      } else if (tool.id === 'page-numbers-pdf') {
        if (!files[0]) throw new Error('Please select a PDF file.');
        setProgress(50);
        const numberedBytes = await addPageNumbersPDF(files[0]);
        const blob = new Blob([numberedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultFileName(`numbered_${files[0].name}`);
        setResultMeta({ details: 'Dynamic page numbering stamped on every page footer.', newSize: blob.size });
      }

      // 2. Image Tools
      else if (tool.id === 'image-compressor') {
        if (!files[0]) throw new Error('Please upload an image to compress.');
        setProgress(40);
        const res = await compressImage(files[0], imgQuality / 100, imgMaxWidth);
        setResultUrl(res.url);
        setResultFileName(`compressed_${files[0].name}`);
        setResultMeta({
          originalSize: res.originalSize,
          newSize: res.newSize,
          details: `Reduced by ${Math.round(((res.originalSize - res.newSize) / res.originalSize) * 100)}% (${formatBytes(res.originalSize)} → ${formatBytes(res.newSize)})`,
        });
      } else if (
        tool.id === 'jpg-to-png' ||
        tool.id === 'png-to-jpg' ||
        tool.id === 'webp-to-jpg' ||
        tool.id === 'jpg-to-webp' ||
        tool.id === 'svg-to-png'
      ) {
        if (!files[0]) throw new Error('Please upload an image file.');
        const target =
          tool.id === 'jpg-to-png' || tool.id === 'svg-to-png'
            ? 'image/png'
            : tool.id === 'jpg-to-webp'
            ? 'image/webp'
            : 'image/jpeg';
        const ext = target === 'image/png' ? 'png' : target === 'image/webp' ? 'webp' : 'jpg';
        setProgress(40);
        const res = await convertImageFormat(files[0], target, 0.92);
        setResultUrl(res.url);
        setResultFileName(`${files[0].name.split('.')[0]}.${ext}`);
        setResultMeta({
          originalSize: res.originalSize,
          newSize: res.newSize,
          details: `Converted format successfully to ${ext.toUpperCase()}`,
        });
      } else if (tool.id === 'image-filters') {
        if (!files[0]) throw new Error('Please upload an image to apply filters.');
        setProgress(50);
        const res = await applyImageFilter(files[0], imgFilter);
        setResultUrl(res.url);
        setResultFileName(`filtered_${imgFilter}_${files[0].name}`);
        setResultMeta({ details: `Applied ${imgFilter} visual effect.` });
      } else if (tool.id === 'image-watermark') {
        if (!files[0]) throw new Error('Please upload an image.');
        setProgress(50);
        const res = await addWatermarkToImage(files[0], watermarkText, 32, '#ffffff', 0.85, 'bottom-right');
        setResultUrl(res.url);
        setResultFileName(`watermarked_${files[0].name}`);
        setResultMeta({ details: `Watermark "${watermarkText}" added.` });
      } else if (tool.id === 'favicon-generator') {
        if (!files[0]) throw new Error('Please upload an image or logo.');
        setProgress(50);
        const icons = await generateFavicons(files[0]);
        setFavicons(icons);
        setResultUrl(icons[1].url); // 32x32
        setResultFileName('favicon-32x32.png');
        setResultMeta({ details: 'Generated full favicon suite: 16px, 32px, 48px, 64px, 128px.' });
      }

      // 3. Audio & Video Tools
      else if (tool.id === 'extract-audio-video') {
        if (!files[0]) throw new Error('Please upload a video file.');
        setProgress(40);
        const res = await extractAudioFromVideo(files[0]);
        setResultUrl(res.url);
        setResultFileName(`${files[0].name.split('.')[0]}_audio.wav`);
        setResultMeta({
          details: `Extracted uncompressed 44.1kHz audio track (${Math.round(res.duration)} seconds).`,
          newSize: res.blob.size,
        });
      } else if (tool.id === 'audio-cutter') {
        if (!files[0]) throw new Error('Please upload an audio file.');
        setProgress(40);
        const res = await trimAudio(files[0], audioStart, audioEnd);
        setResultUrl(res.url);
        setResultFileName(`trimmed_${files[0].name.split('.')[0]}.wav`);
        setResultMeta({
          details: `Trimmed from ${audioStart}s to ${audioEnd}s (${Math.round(res.duration)}s total).`,
          newSize: res.blob.size,
        });
      } else if (tool.id === 'audio-volume-booster') {
        if (!files[0]) throw new Error('Please upload an audio file.');
        setProgress(45);
        const res = await boostAudioVolume(files[0], volumeBoost);
        setResultUrl(res.url);
        setResultFileName(`boosted_${Math.round(volumeBoost * 100)}pct_${files[0].name.split('.')[0]}.wav`);
        setResultMeta({ details: `Boosted audio volume by ${Math.round(volumeBoost * 100)}%.` });
      } else if (tool.id === 'audio-speed-pitch') {
        if (!files[0]) throw new Error('Please upload an audio file.');
        setProgress(45);
        const res = await changeAudioSpeed(files[0], audioSpeed);
        setResultUrl(res.url);
        setResultFileName(`speed_${audioSpeed}x_${files[0].name.split('.')[0]}.wav`);
        setResultMeta({ details: `Adjusted playback speed to ${audioSpeed}x.` });
      }

      // 4. Developer & Data Tools
      else if (tool.id === 'json-formatter') {
        try {
          const parsed = JSON.parse(textInput);
          const formatted = JSON.stringify(parsed, null, 2);
          setTextOutput(formatted);
          setResultMeta({ details: 'JSON syntax is 100% valid. Cleanly formatted with 2-space indentation.' });
        } catch (err: unknown) {
          throw new Error('Invalid JSON syntax: ' + (err as Error).message);
        }
      } else if (tool.id === 'base64-converter') {
        if (textInput) {
          const encoded = btoa(unescape(encodeURIComponent(textInput)));
          setTextOutput(encoded);
          setResultMeta({ details: 'UTF-8 text safely encoded to Base64 string.' });
        }
      } else if (tool.id === 'hash-generator') {
        if (!textInput) throw new Error('Please enter text to calculate cryptographic hashes.');
        setProgress(30);
        const sha256 = await calculateHash(textInput, 'SHA-256');
        const sha512 = await calculateHash(textInput, 'SHA-512');
        const sha1 = await calculateHash(textInput, 'SHA-1');
        const md5 = simpleMD5(textInput);
        const resultString = `SHA-256:\n${sha256}\n\nMD5:\n${md5}\n\nSHA-1:\n${sha1}\n\nSHA-512:\n${sha512}`;
        setTextOutput(resultString);
        setResultMeta({ details: 'Computed cryptographic digests via browser Web Crypto API.' });
      } else if (tool.id === 'password-generator') {
        const res = generatePassword({
          length: pwdLen,
          useUpper,
          useLower,
          useNumbers: useNums,
          useSymbols,
          avoidAmbiguous,
        });
        setPwdResult(res);
        setTextOutput(res.password);
        setResultMeta({ details: `Generated ${res.entropyBits} bits of entropy (${res.strength} strength).` });
      } else if (tool.id === 'word-counter') {
        const stats = analyzeText(textInput);
        const out = `Words: ${stats.words}\nCharacters (with spaces): ${stats.charsWithSpaces}\nCharacters (no spaces): ${stats.charsNoSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nEstimated Silent Reading Time: ${stats.readingTime}\nEstimated Speaking Presentation Time: ${stats.speakingTime}`;
        setTextOutput(out);
        setResultMeta({ details: 'Complete text linguistic analysis computed.' });
      } else if (tool.id === 'case-converter') {
        const out = convertCase(textInput, 'title');
        setTextOutput(out);
        setResultMeta({ details: 'Converted case successfully.' });
      } else if (tool.id === 'csv-to-json') {
        const res = csvToJson(textInput);
        setTextOutput(res.jsonString);
        setResultMeta({ details: `Parsed ${res.data.length} records into JSON array.` });
      } else if (tool.id === 'json-to-csv') {
        try {
          const csv = jsonToCsv(textInput);
          setTextOutput(csv);
          setResultMeta({ details: 'Exported JSON array to CSV format.' });
        } catch {
          throw new Error('Please provide a valid JSON array of objects.');
        }
      }

      setProgress(100);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Color picker canvas click
  const handleColorPickerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorPickerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase();
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    setPickedColor({ hex, rgb });
  };

  // Related tools
  const relatedTools = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header / Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span>Tools</span>
              <span>/</span>
              <span className="capitalize">{tool.category}</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{tool.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% In-Browser & Private</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tool Title Block */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900">
            <DynamicIcon name={tool.iconName} className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            {tool.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {tool.shortDescription}
          </p>
        </div>

        {/* Workspace Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
          {/* FILE UPLOAD ZONE (for file-driven tools) */}
          {tool.acceptedFileTypes && tool.id !== 'image-color-picker' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl p-8 text-center cursor-pointer transition-colors group mb-6"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf'}
                accept={tool.acceptedFileTypes}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                {tool.actionLabel || 'Click to select or drop files here'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Processed locally in your device RAM · Never uploaded to external servers
              </p>

              {/* Uploaded files count badge */}
              {files.length > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
                  <FileCheck className="w-4 h-4" />
                  <span className="font-semibold">{files.length} file(s) selected:</span>
                  <span className="truncate max-w-xs">{files.map((f) => f.name).join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* CUSTOM WORKSPACE INTERFACES PER TOOL */}

          {/* 1. PDF Split options */}
          {tool.id === 'split-pdf' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Page Ranges to Extract:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={pdfPageRanges}
                  onChange={(e) => setPdfPageRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">Example: 1-5 or 2,4,6</span>
              </div>
            </div>
          )}

          {/* 2. PDF Rotate options */}
          {tool.id === 'rotate-pdf' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Rotation Angle:
              </label>
              <div className="flex items-center gap-3">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotateAngle(deg)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      rotateAngle === deg
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {deg}° Clockwise
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Watermark text input */}
          {(tool.id === 'watermark-pdf' || tool.id === 'image-watermark') && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Watermark Text:
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL / DRAFT / © 2026 CastleTools"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* 4. PDF Page Counter Display */}
          {tool.id === 'pdf-page-counter' && pdfInfo && (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs text-slate-500 block">Total Pages</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {pdfInfo.pageCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Document Title</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {pdfInfo.title}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Page Dimensions</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {pdfInfo.pageSize}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Author Metadata</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {pdfInfo.author}
                </span>
              </div>
            </div>
          )}

          {/* 5. Image Compression sliders */}
          {tool.id === 'image-compressor' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Compression Quality: {imgQuality}%</span>
                  <span className="text-slate-500">Recommended: 70–80%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={imgQuality}
                  onChange={(e) => setImgQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Max Width: {imgMaxWidth}px</span>
                  <span className="text-slate-500">Auto-downscales giant camera photos</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3840"
                  step="100"
                  value={imgMaxWidth}
                  onChange={(e) => setImgMaxWidth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* 6. Image Color Picker canvas */}
          {tool.id === 'image-color-picker' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div className="overflow-auto max-h-96 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex justify-center p-2">
                <canvas
                  ref={colorPickerCanvasRef}
                  onClick={handleColorPickerClick}
                  className="cursor-crosshair max-w-full"
                />
              </div>
              {pickedColor && (
                <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-slate-300 shadow-sm"
                      style={{ backgroundColor: pickedColor.hex }}
                    />
                    <div>
                      <span className="text-xs text-slate-500 block">Sampled Color</span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {pickedColor.hex} · {pickedColor.rgb}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pickedColor.hex)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy HEX'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 7. Image Filter Selectors */}
          {tool.id === 'image-filters' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Photo Filter / Effect:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['grayscale', 'sepia', 'invert', 'blur', 'sharpen', 'sketch'] as const).map((filt) => (
                  <button
                    key={filt}
                    onClick={() => setImgFilter(filt)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize border transition-all ${
                      imgFilter === filt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {filt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. Voice Recorder interface */}
          {tool.id === 'voice-recorder' && (
            <div className="mb-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
              <div className="mb-4">
                <div className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {Math.floor(recordingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(recordingSeconds % 60).toString().padStart(2, '0')}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  {isRecording ? 'Recording active from microphone...' : 'Ready to record voice memo'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop & Save Recording</span>
                  </button>
                )}
              </div>

              {recordedAudioUrl && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    Listen to Preview:
                  </span>
                  <audio controls src={recordedAudioUrl} className="w-full max-w-md mx-auto" />
                </div>
              )}
            </div>
          )}

          {/* 9. Audio Cutter sliders */}
          {tool.id === 'audio-cutter' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time (seconds):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={audioStart}
                  onChange={(e) => setAudioStart(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time (seconds):
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={audioEnd}
                  onChange={(e) => setAudioEnd(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {/* 10. Audio Volume Booster slider */}
          {tool.id === 'audio-volume-booster' && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Amplification: {Math.round(volumeBoost * 100)}%</span>
                <span className="text-slate-500">Soft saturation protection enabled</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={volumeBoost}
                onChange={(e) => setVolumeBoost(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}

          {/* 11. QR Code Generator Interface */}
          {tool.id === 'qr-code-generator' && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    QR Content (URL, Text, WiFi, Contact):
                  </label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={qrFg}
                      onChange={(e) => setQrFg(e.target.value)}
                      className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={qrBg}
                      onChange={(e) => setQrBg(e.target.value)}
                      className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <canvas ref={qrCanvasRef} className="rounded-lg shadow-sm" />
                <button
                  onClick={() => {
                    if (qrCanvasRef.current) {
                      triggerDownload(qrCanvasRef.current.toDataURL('image/png'), 'castletools_qrcode.png');
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* 12. Password Generator Interface */}
          {tool.id === 'password-generator' && pwdResult && (
            <div className="mb-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5">
              {/* Output Display */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-white select-all break-all">
                  {pwdResult.password}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => executeProcess()}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Generate New Password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(pwdResult.password)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Entropy Meter */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Entropy Strength:</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pwdResult.strength === 'very-strong'
                        ? 'bg-emerald-500 w-full'
                        : pwdResult.strength === 'strong'
                        ? 'bg-green-500 w-3/4'
                        : pwdResult.strength === 'medium'
                        ? 'bg-amber-500 w-1/2'
                        : 'bg-red-500 w-1/4'
                    }`}
                  />
                </div>
                <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                  {pwdResult.strength} ({pwdResult.entropyBits} bits)
                </span>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Password Length: {pwdLen} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={pwdLen}
                    onChange={(e) => setPwdLen(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useUpper}
                      onChange={(e) => setUseUpper(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLower}
                      onChange={(e) => setUseLower(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useNums}
                      onChange={(e) => setUseNums(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSymbols}
                      onChange={(e) => setUseSymbols(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Symbols (!@#$)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 13. Text / Code Input Tools (JSON, Markdown, CSV, Hash, Base64, Word Count) */}
          {(tool.id === 'json-formatter' ||
            tool.id === 'base64-converter' ||
            tool.id === 'hash-generator' ||
            tool.id === 'word-counter' ||
            tool.id === 'case-converter' ||
            tool.id === 'markdown-to-html' ||
            tool.id === 'csv-to-json' ||
            tool.id === 'json-to-csv') && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Input Content:
                </label>
                <textarea
                  rows={6}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste or write your text or data here..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {textOutput && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Output Result:
                    </label>
                    <button
                      onClick={() => copyToClipboard(textOutput)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Output'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 overflow-auto max-h-80 whitespace-pre-wrap">
                    {textOutput}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Favicon grid preview */}
          {favicons.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-3">
                Generated Favicon Suite:
              </span>
              <div className="flex flex-wrap items-end gap-4">
                {favicons.map((fav) => (
                  <div key={fav.size} className="text-center">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 inline-block">
                      <img src={fav.url} alt={`${fav.size}px`} width={fav.size} height={fav.size} className="mx-auto" />
                    </div>
                    <span className="text-xs text-slate-500 block mt-1">{fav.size}x{fav.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Execution Error:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* SUCCESS RESULT BANNER */}
          {resultMeta && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{resultMeta.details}</span>
              </div>
              {resultUrl && (
                <button
                  onClick={() => triggerDownload(resultUrl, resultFileName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              )}
            </div>
          )}

          {/* PROGRESS BAR */}
          {isProcessing && (
            <div className="mb-6 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Processing in browser memory...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* PRIMARY ACTION CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Zero server upload · Secure client-side execution</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                disabled={isProcessing}
                onClick={executeProcess}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" />
                    <span>Execute & Process</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED TOOLS SECTION */}
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Related {tool.category.toUpperCase()} Utilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedTools.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectTool(rel)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit mb-2 group-hover:text-indigo-600 transition-colors">
                    <DynamicIcon name={rel.iconName} className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
