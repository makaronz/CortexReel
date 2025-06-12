import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

export interface ParsedContent {
  text: string;
  pageCount: number;
  extractionMethod: 'DIRECT' | 'OCR' | 'MIXED';
  confidence: number;
  processingTime: number;
}

export class PDFParserService {
  private onProgress?: (progress: { current: number; total: number; stage: string; page?: number }) => void;

  constructor(progressCallback?: (progress: { current: number; total: number; stage: string; page?: number }) => void) {
    this.onProgress = progressCallback;
  }

  async parseFile(file: File): Promise<ParsedContent> {
    // Validate file before processing
    this.validateFile(file);
    
    const startTime = Date.now();

    try {
      this.updateProgress(0, 1, 'Loading PDF...');
      
      // Try direct extraction first
      const directResult = await this.extractTextDirect(file);
      
      if (this.isExtractionSuccessful(directResult.text)) {
        return {
          text: directResult.text,
          pageCount: directResult.pageCount,
          extractionMethod: 'DIRECT',
          confidence: 0.95,
          processingTime: Date.now() - startTime,
        };
      }
      
      // If direct extraction failed, try OCR
      this.updateProgress(0, 1, 'Direct extraction failed, starting OCR...');
      const ocrResult = await this.extractTextOCR(file);
      
      return {
        text: ocrResult.text,
        pageCount: ocrResult.pageCount,
        extractionMethod: 'OCR',
        confidence: ocrResult.confidence,
        processingTime: Date.now() - startTime,
      };
      
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to parse PDF file');
    }
  }

  private updateProgress(current: number, total: number, stage: string, page?: number) {
    if (this.onProgress) {
      this.onProgress({ current, total, stage, page });
    }
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (10MB)`);
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Only PDF files are supported.');
    }
  }

  private async extractTextDirect(file: File): Promise<{ text: string; pageCount: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      const pageCount = pdf.numPages;
      
      for (let i = 1; i <= pageCount; i++) {
        this.updateProgress(i, pageCount, 'Extracting text (direct)', i);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => 'str' in item && typeof item.str === 'string')
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return { text: fullText.trim(), pageCount };
    } catch (error) {
      console.error('Direct PDF extraction failed:', error);
      throw new Error('Failed to extract text directly from PDF');
    }
  }

  private async extractTextOCR(file: File): Promise<{ text: string; pageCount: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      let fullText = '';
      let totalConfidence = 0;

      for (let i = 1; i <= pageCount; i++) {
        this.updateProgress(i, pageCount, 'OCR Processing', i);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Failed to create canvas context');
        }

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        const imageData = canvas.toDataURL('image/png');

        const ocrResult = await Tesseract.recognize(imageData, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.updateProgress(
                i - 1 + (m.progress || 0),
                pageCount,
                `OCR page ${i}/${pageCount} - ${Math.round((m.progress || 0) * 100)}%`
              );
            }
          },
        });
        
        fullText += ocrResult.data.text + '\n';
        totalConfidence += ocrResult.data.confidence;
      }
      
      return { 
        text: fullText.trim(), 
        pageCount, 
        confidence: totalConfidence / pageCount / 100 
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text using OCR');
    }
  }

  private isExtractionSuccessful(text: string): boolean {
    const trimmedText = text.trim();
    if (trimmedText.length < 100) return false;
    
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 50) return false;
    
    const readableChars = trimmedText.match(/[a-zA-Z]/g) || [];
    const readableRatio = readableChars.length / trimmedText.length;
    if (readableRatio < 0.3) return false;
    
    // Check for screenplay patterns
    const screenplayPatterns = [
      /INT\.|EXT\./, 
      /FADE IN:|FADE OUT:/,
      /\b[A-Z]{2,}\b.*\n.*[a-z]/, 
      /\([^)]+\)/
    ];
    const patternMatches = screenplayPatterns.filter(pattern => pattern.test(text)).length;
    return patternMatches >= 1;
  }

  // Static utility methods
  static validateFileSize(file: File): boolean {
    try {
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    } catch {
      return false;
    }
  }

  static getSupportedFormats(): string[] {
    return ['application/pdf', '.pdf'];
  }

  static estimateProcessingTime(file: File): number {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < 1) return 5000; // 5 seconds
    if (sizeMB < 5) return 20000; // 20 seconds
    if (sizeMB < 10) return 40000; // 40 seconds
    return 60000; // 60 seconds for larger files
  }
} 