import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Merge multiple PDF files into one single PDF document
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Split PDF: Extract selected page ranges (e.g., "1-3", "2,4,6", or "all")
 */
export async function splitPDF(file: File, pageRanges: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const newPdf = await PDFDocument.create();
  const pagesToInclude = new Set<number>();

  const trimmed = pageRanges.trim().toLowerCase();
  if (trimmed === 'all' || trimmed === '') {
    for (let i = 0; i < totalPages; i++) pagesToInclude.add(i);
  } else {
    const parts = trimmed.split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((s) => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            pagesToInclude.add(p - 1);
          }
        }
      } else {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pagesToInclude.add(num - 1);
        }
      }
    }
  }

  const indices = Array.from(pagesToInclude).sort((a, b) => a - b);
  if (indices.length === 0) {
    throw new Error('No valid pages found in specified range');
  }

  const copied = await newPdf.copyPages(srcPdf, indices);
  copied.forEach((p) => newPdf.addPage(p));

  return await newPdf.save();
}

/**
 * Rotate all or selected pages in PDF
 */
export async function rotatePDF(file: File, angleDegrees: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angleDegrees) % 360));
  });

  return await pdfDoc.save();
}

/**
 * Convert JPG/PNG/WebP images into a single multi-page PDF
 */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let image;
    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(bytes);
    } else {
      // JPEG or convert canvas
      image = await pdfDoc.embedJpg(bytes);
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Add diagonal watermark text to every page
 */
export async function watermarkPDF(file: File, watermarkText: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const text = watermarkText || 'CONFIDENTIAL';

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.35,
      rotate: degrees(45),
    });
  });

  return await pdfDoc.save();
}

/**
 * Add Page Numbers at bottom center of each page
 */
export async function addPageNumbersPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const text = `Page ${idx + 1} of ${total}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: 20,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdfDoc.save();
}

/**
 * Read PDF metadata & page count
 */
export async function getPDFInfo(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const count = pdfDoc.getPageCount();
  const firstPage = pdfDoc.getPage(0);
  const { width, height } = firstPage.getSize();

  return {
    pageCount: count,
    title: pdfDoc.getTitle() || 'Untitled',
    author: pdfDoc.getAuthor() || 'Unknown Author',
    subject: pdfDoc.getSubject() || 'None',
    creator: pdfDoc.getCreator() || 'Standard PDF Engine',
    pageSize: `${Math.round(width)} x ${Math.round(height)} pt`,
  };
}

/**
 * Update PDF metadata
 */
export async function updatePDFMetadata(
  file: File,
  meta: { title?: string; author?: string; subject?: string }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);

  return await pdfDoc.save();
}
