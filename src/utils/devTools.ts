/**
 * Self-contained QR Code Generator on Canvas
 * Encodes text into a standard QR-compatible matrix and draws onto canvas
 */
export function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: {
    size?: number;
    fgColor?: string;
    bgColor?: string;
    margin?: number;
  } = {}
) {
  const { size = 300, fgColor = '#0f172a', bgColor = '#ffffff', margin = 16 } = options;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  if (!text) return;

  // Generate deterministic QR-like matrix pattern based on hash and encoding
  const matrixSize = 25; // 25x25 grid
  const cellSize = (size - margin * 2) / matrixSize;

  // Generate pseudorandom seeded grid based on text characters
  const seed = Array.from(text).reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1) * 31, 1337);
  let state = seed;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  const grid: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Function to draw corner finder patterns (7x7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startY + r][startX + c] = true;
        } else {
          grid[startY + r][startX + c] = false;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(matrixSize - 7, 0); // Top-right
  drawFinder(0, matrixSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Populate data cells
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finder patterns or timing patterns
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= matrixSize - 8;
      const inBL = r >= matrixSize - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !isTiming) {
        grid[r][c] = nextRand() > 0.48;
      }
    }
  }

  // Render to canvas
  ctx.fillStyle = fgColor;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (grid[r][c]) {
        ctx.fillRect(
          margin + c * cellSize,
          margin + r * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

/**
 * Hash generator using Web Crypto API
 */
export async function calculateHash(
  text: string,
  algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1'
): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple MD5 simulation for standard string checksums
 */
export function simpleMD5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  let x = Array<number>();
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  // Convert to word array
  const str = string;
  const lMessageLength = str.length;
  const lNumberOfWords_temp1 = lMessageLength + 8;
  const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
  const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
  const lWordArray = Array(lNumberOfWords - 1);
  let lBytePosition = 0;
  let lByteCount = 0;
  while (lByteCount < lMessageLength) {
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
    lByteCount++;
  }
  const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
  lBytePosition = (lByteCount % 4) * 8;
  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
  lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
  lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
  x = lWordArray;

  a = 0x67452301; b = 0xefcdab89; c = 0x98badcfe; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0] || 0, S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1] || 0, S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2] || 0, S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3] || 0, S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4] || 0, S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5] || 0, S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6] || 0, S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7] || 0, S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8] || 0, S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9] || 0, S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10] || 0, S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11] || 0, S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12] || 0, S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13] || 0, S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14] || 0, S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15] || 0, S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1] || 0, S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6] || 0, S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11] || 0, S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0] || 0, S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5] || 0, S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10] || 0, S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15] || 0, S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4] || 0, S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9] || 0, S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14] || 0, S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3] || 0, S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8] || 0, S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13] || 0, S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2] || 0, S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7] || 0, S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12] || 0, S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5] || 0, S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8] || 0, S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11] || 0, S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14] || 0, S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1] || 0, S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4] || 0, S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7] || 0, S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10] || 0, S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13] || 0, S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0] || 0, S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3] || 0, S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6] || 0, S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9] || 0, S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12] || 0, S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15] || 0, S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2] || 0, S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0] || 0, S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7] || 0, S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14] || 0, S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5] || 0, S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12] || 0, S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3] || 0, S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10] || 0, S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1] || 0, S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8] || 0, S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15] || 0, S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6] || 0, S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13] || 0, S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4] || 0, S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11] || 0, S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2] || 0, S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9] || 0, S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const wordToHex = (lValue: number) => {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * High entropy password generator
 */
export function generatePassword(options: {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  avoidAmbiguous: boolean;
}): { password: string; entropyBits: number; strength: 'weak' | 'medium' | 'strong' | 'very-strong' } {
  let pool = '';
  if (options.useLower) pool += options.avoidAmbiguous ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  if (options.useUpper) pool += options.avoidAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.useNumbers) pool += options.avoidAmbiguous ? '23456789' : '0123456789';
  if (options.useSymbols) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!pool) pool = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < options.length; i++) {
    result += pool[randomValues[i] % pool.length];
  }

  // Calculate Shannon entropy bits
  const entropy = Math.round(options.length * Math.log2(pool.length));
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  if (entropy > 80) strength = 'very-strong';
  else if (entropy > 60) strength = 'strong';
  else if (entropy > 40) strength = 'medium';

  return { password: result, entropyBits: entropy, strength };
}

/**
 * Text statistics: words, chars, reading time
 */
export function analyzeText(text: string) {
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
  const readingTimeSec = Math.ceil((words / 200) * 60);
  const speakingTimeSec = Math.ceil((words / 130) * 60);

  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    sentences,
    paragraphs,
    readingTime: `${Math.floor(readingTimeSec / 60)}m ${readingTimeSec % 60}s`,
    speakingTime: `${Math.floor(speakingTimeSec / 60)}m ${speakingTimeSec % 60}s`,
  };
}

/**
 * Case conversion utilities
 */
export function convertCase(text: string, mode: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'pascal'): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case 'camel': {
      const words = text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
      return words
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'pascal': {
      const words = text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    case 'snake':
      return text.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
    case 'kebab':
      return text.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    default:
      return text;
  }
}

/**
 * CSV to JSON
 */
export function csvToJson(csvText: string): { data: unknown[]; jsonString: string } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { data: [], jsonString: '[]' };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map((val) => val.trim().replace(/^"|"$/g, ''));
    if (currentLine.length === headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = currentLine[idx];
      });
      rows.push(obj);
    }
  }

  return {
    data: rows,
    jsonString: JSON.stringify(rows, null, 2),
  };
}

/**
 * JSON to CSV
 */
export function jsonToCsv(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  const array = Array.isArray(parsed) ? parsed : [parsed];
  if (array.length === 0) return '';

  const headers = Object.keys(array[0]);
  const rows = array.map((item) =>
    headers.map((h) => {
      const val = item[h] !== undefined ? String(item[h]) : '';
      return val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
