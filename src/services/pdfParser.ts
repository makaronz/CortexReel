import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { retryAsync, type ShouldRetryFn } from '@/services/llm/retry';

/**
 * Service responsible for extracting text from PDF files.
 * Performs direct extraction using pdfjs and falls back to OCR when needed.
 * Enhanced with robust error handling and resilience mechanisms.
 */

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
  warnings?: string[];
  metadata?: {
    hasImages: boolean;
    hasText: boolean;
    isEncrypted: boolean;
    title?: string;
    author?: string;
  };
}

export class PDFParserService {
  private onProgress?: (progress: { current: number; total: number; stage: string; page?: number }) => void;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(progressCallback?: (progress: { current: number; total: number; stage: string; page?: number }) => void) {
    this.onProgress = progressCallback;
  }

  async parseFile(file: File): Promise<ParsedContent> {
    // Enhanced validation before processing
    this.validateFile(file);
    
    const startTime = Date.now();
    const warnings: string[] = [];
    let metadata: ParsedContent['metadata'] = {
      hasImages: false,
      hasText: false,
      isEncrypted: false
    };

    try {
      this.updateProgress(0, 1, 'Analyzing PDF structure...');

      // Get PDF metadata first
      metadata = await this.analyzePDFMetadata(file);
      
      if (metadata.isEncrypted) {
        throw new Error('PDF is password-protected or encrypted. Please provide an unprotected version.');
      }

      // Try direct extraction with enhanced retry logic
      this.updateProgress(0, 1, 'Attempting direct text extraction...');
      let directResult: { text: string; pageCount: number } | null = null;
      
      try {
        const shouldRetryDirect: ShouldRetryFn = (error) => this.shouldRetryDirectExtraction(error);
        directResult = await retryAsync(
          () => this.extractTextDirect(file),
          this.maxRetries,
          this.retryDelay,
          shouldRetryDirect
        );
        
        if (directResult && this.isExtractionSuccessful(directResult.text, file.size)) {
          return {
            text: directResult.text,
            pageCount: directResult.pageCount,
            extractionMethod: 'DIRECT',
            confidence: 0.95,
            processingTime: Date.now() - startTime,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata
          };
        } else if (directResult) {
          warnings.push('Direct extraction returned limited text - may be a scanned PDF');
        }
      } catch (directError) {
        console.warn('Direct extraction failed after retries:', directError);
        warnings.push('Direct text extraction failed, attempting OCR');
      }

      // If direct extraction failed or was insufficient, try OCR
      if (!metadata?.hasText || warnings.length > 0) {
        this.updateProgress(0, 1, 'Direct extraction insufficient, starting OCR...');
        const ocrResult = await this.extractTextOCRWithRetry(file);
        
        // If we have both direct and OCR results, combine them
        if (directResult && directResult.text.trim()) {
          const combinedText = this.combineExtractionResults(directResult.text, ocrResult.text);
          return {
            text: combinedText,
            pageCount: Math.max(directResult.pageCount, ocrResult.pageCount),
            extractionMethod: 'MIXED',
            confidence: (0.95 + ocrResult.confidence) / 2,
            processingTime: Date.now() - startTime,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata
          };
        }
        
        return {
          text: ocrResult.text,
          pageCount: ocrResult.pageCount,
          extractionMethod: 'OCR',
          confidence: ocrResult.confidence,
          processingTime: Date.now() - startTime,
          warnings: warnings.length > 0 ? warnings : undefined,
          metadata
        };
      }

      throw new Error('Both direct extraction and OCR failed to produce readable text');
      
    } catch (error) {
      console.error('PDF parsing error:', error);
      
      // Enhanced error classification
      let errorMessage = 'Failed to parse PDF file';
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('encrypted') || errorText.includes('password')) {
          errorMessage = 'PDF is password-protected. Please remove password protection and try again.';
        } else if (errorText.includes('corrupted') || errorText.includes('invalid pdf')) {
          errorMessage = 'PDF file appears to be corrupted or invalid. Please try with a different file.';
        } else if (errorText.includes('memory') || errorText.includes('out of memory')) {
          errorMessage = 'PDF is too complex or large to process. Try reducing file size or complexity.';
        } else if (errorText.includes('timeout')) {
          errorMessage = 'PDF processing timed out. The file may be too complex or large.';
        } else if (errorText.includes('network')) {
          errorMessage = 'Network error during processing. Please check your connection and try again.';
        } else {
          errorMessage = `PDF parsing failed: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  private async analyzePDFMetadata(file: File): Promise<ParsedContent['metadata']> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Get PDF metadata
      const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
      
      // Check if PDF has text content
      let hasText = false;
      let hasImages = false;
      
      try {
        const firstPage = await pdf.getPage(1);
        const textContent = await firstPage.getTextContent();
        hasText = textContent.items.length > 0;
        
        // Simple check for images (if page has non-text content)
        const operatorList = await firstPage.getOperatorList();
        hasImages = operatorList.fnArray.some((fn: any) => 
          fn === pdfjsLib.OPS.paintImageXObject || 
          fn === pdfjsLib.OPS.paintInlineImageXObject
        );
      } catch (pageError) {
        console.warn('Could not analyze first page for content type:', pageError);
      }

      return {
        hasText,
        hasImages,
        isEncrypted: false, // If we got here, it's not encrypted
        title: metadata.info?.Title || undefined,
        author: metadata.info?.Author || undefined
      };
    } catch (error) {
      console.warn('Could not analyze PDF metadata:', error);
      return {
        hasText: true, // Assume it has text if we can't check
        hasImages: false,
        isEncrypted: false
      };
    }
  }

  private shouldRetryDirectExtraction(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const errorMessage = error.message.toLowerCase();
    
    // Retry on network errors, temporary failures, but not on permanent errors
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('temporary') ||
      errorMessage.includes('busy') ||
      errorMessage.includes('loading')
    ) && !(
      errorMessage.includes('corrupted') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('encrypted') ||
      errorMessage.includes('password')
    );
  }

  private async extractTextOCRWithRetry(file: File): Promise<{ text: string; pageCount: number; confidence: number }> {
    const shouldRetryOCRFn: ShouldRetryFn = (error) => this.shouldRetryOCR(error);
    return await retryAsync(
      () => this.extractTextOCR(file),
      this.maxRetries,
      this.retryDelay * 2, // Longer delay for OCR retries
      shouldRetryOCRFn
    );
  }

  private shouldRetryOCR(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const errorMessage = error.message.toLowerCase();
    
    // Retry on network/memory issues, but not on fundamental OCR failures
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('memory') ||
      errorMessage.includes('worker')
    ) && !(
      errorMessage.includes('tesseract failed') ||
      errorMessage.includes('no text found') ||
      errorMessage.includes('invalid image')
    );
  }

  private combineExtractionResults(directText: string, ocrText: string): string {
    // Simple heuristic to combine direct and OCR results
    const directWords = directText.trim().split(/\s+/).length;
    const ocrWords = ocrText.trim().split(/\s+/).length;
    
    // If direct extraction has significantly more words, prefer it
    if (directWords > ocrWords * 1.5) {
      return directText;
    }
    
    // If OCR has significantly more words, prefer it
    if (ocrWords > directWords * 1.5) {
      return ocrText;
    }
    
    // Otherwise, combine both with a separator
    return `${directText}\n\n--- OCR SUPPLEMENT ---\n\n${ocrText}`;
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
    
    if (file.size === 0) {
      throw new Error('File is empty');
    }
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Only PDF files are supported.');
    }

    // Additional filename validation
    if (file.name.length > 255) {
      throw new Error('Filename is too long (maximum 255 characters)');
    }

    // Check for suspicious file patterns
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.scr$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.com$/i,
      /\.pif$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      throw new Error('File type not allowed for security reasons');
    }
  }

  private async extractTextDirect(file: File): Promise<{ text: string; pageCount: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Enhanced PDF loading options
        useSystemFonts: true,
        verbosity: 0, // Reduce console noise
        maxImageSize: 16777216, // 16MB max image size
        disableFontFace: false,
        disableRange: false,
        disableStream: false
      }).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      for (let i = 1; i <= pageCount; i++) {
        this.updateProgress(i, pageCount, 'Extracting text (direct)', i);
        
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false
          });
          
          const pageText = textContent.items
            .filter((item: any) => 'str' in item && typeof item.str === 'string')
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
            
          if (pageText) {
            fullText += pageText + '\n';
          }
        } catch (pageError) {
          console.warn(`Failed to extract text from page ${i}:`, pageError);
          // Continue with other pages instead of failing completely
        }
      }
      
      return { text: fullText.trim(), pageCount };
    } catch (error) {
      console.error('Direct PDF extraction failed:', error);
      throw new Error(`Failed to extract text directly from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          logger: (m: any) => {
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

  // Enhanced isExtractionSuccessful with more edge cases
  private isExtractionSuccessful(text: string, fileSize: number): boolean {
    const trimmedText = text.trim();
    
    // Empty or very short text
    if (trimmedText.length < 50) return false;
    
    // Check word count (minimum meaningful content)
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 25) return false;
    
    // Check character composition - should have reasonable amount of letters
    const letters = trimmedText.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || [];
    const letterRatio = letters.length / trimmedText.length;
    if (letterRatio < 0.25) return false;
    
    // Check for excessive repetition (OCR artifacts)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const uniqueRatio = uniqueWords.size / words.length;
    if (uniqueRatio < 0.3) return false;
    
    // File size vs text ratio check (detect mostly-image PDFs)
    const bytesPerChar = fileSize / trimmedText.length;
    if (bytesPerChar > 500) { // Very high ratio suggests images
      console.warn('High file size to text ratio - may be image-heavy PDF');
    }
    
    // Basic screenplay format detection (enhanced)
    const screenplayPatterns = [
      /\b(INT\.|EXT\.)\s+/i,
      /\b(FADE IN:|FADE OUT:)/i,
      /\b[A-Z]{2,}\s*\n/,
      /\([^)]+\)/,
      /^\s*[A-Z\s]{3,}\s*$/m, // Character names
      /\b(CUT TO:|MATCH CUT:|DISSOLVE TO:)/i
    ];
    
    const patternMatches = screenplayPatterns.filter(pattern => pattern.test(text)).length;
    if (patternMatches === 0) {
      console.warn('No screenplay patterns detected - may not be a screenplay');
      // Don't fail here, but note the warning
    }
    
    return true;
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