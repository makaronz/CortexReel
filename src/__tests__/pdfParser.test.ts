import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFParserService } from '../services/pdfParser';

function createFile(size: number, type = 'application/pdf', name = 'test.pdf'): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

function createMockPDFFile(content: string, type = 'application/pdf'): File {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const blob = new Blob([data], { type });
  return new File([blob], 'screenplay.pdf', { type });
}

describe('PDFParserService', () => {
  let consoleSpy: any;
  
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Static Utility Methods', () => {
    it('validates file size correctly', () => {
      const smallFile = createFile(1024); // 1KB
      const mediumFile = createFile(5 * 1024 * 1024); // 5MB
      const largeFile = createFile(11 * 1024 * 1024); // 11MB
      const exactLimitFile = createFile(10 * 1024 * 1024); // Exactly 10MB
      
      expect(PDFParserService.validateFileSize(smallFile)).toBe(true);
      expect(PDFParserService.validateFileSize(mediumFile)).toBe(true);
      expect(PDFParserService.validateFileSize(exactLimitFile)).toBe(true);
      expect(PDFParserService.validateFileSize(largeFile)).toBe(false);
    });

    it('handles invalid file objects gracefully', () => {
      const invalidFile = null as any;
      expect(PDFParserService.validateFileSize(invalidFile)).toBe(false);
    });

    it('lists supported formats', () => {
      const formats = PDFParserService.getSupportedFormats();
      expect(formats).toContain('application/pdf');
      expect(formats).toContain('.pdf');
      expect(formats).toHaveLength(2);
    });

    it('estimates processing time based on file size', () => {
      const tinyFile = createFile(500 * 1024); // 0.5MB
      const smallFile = createFile(2 * 1024 * 1024); // 2MB
      const mediumFile = createFile(7 * 1024 * 1024); // 7MB
      const largeFile = createFile(15 * 1024 * 1024); // 15MB (over limit but for testing)
      
      expect(PDFParserService.estimateProcessingTime(tinyFile)).toBe(5000); // 5s
      expect(PDFParserService.estimateProcessingTime(smallFile)).toBe(20000); // 20s
      expect(PDFParserService.estimateProcessingTime(mediumFile)).toBe(40000); // 40s
      expect(PDFParserService.estimateProcessingTime(largeFile)).toBe(60000); // 60s
    });
  });

  describe('File Validation Edge Cases', () => {
    it('rejects empty files', async () => {
      const emptyFile = createFile(0);
      const parser = new PDFParserService();
      
      await expect(parser.parseFile(emptyFile)).rejects.toThrow('File is empty');
    });

    it('rejects files with wrong MIME type', async () => {
      const textFile = createFile(1024, 'text/plain', 'document.txt');
      const parser = new PDFParserService();
      
      await expect(parser.parseFile(textFile)).rejects.toThrow('Invalid file type');
    });

    it('rejects files with suspicious extensions', async () => {
      const executableFile = createFile(1024, 'application/pdf', 'malware.exe');
      const parser = new PDFParserService();
      
      await expect(parser.parseFile(executableFile)).rejects.toThrow('File type not allowed for security reasons');
    });

    it('rejects files with extremely long names', async () => {
      const longName = 'a'.repeat(300) + '.pdf';
      const longNameFile = createFile(1024, 'application/pdf', longName);
      const parser = new PDFParserService();
      
      await expect(parser.parseFile(longNameFile)).rejects.toThrow('Filename is too long');
    });

    it('accepts PDF files with .PDF extension (case insensitive)', async () => {
      const parser = new PDFParserService();
      
      // Mock the internal methods to avoid actual PDF processing
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'FADE IN:\n\nINT. OFFICE - DAY\n\nSample screenplay content.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const uppercaseFile = createFile(1024, 'application/pdf', 'SCREENPLAY.PDF');
      
      const result = await parser.parseFile(uppercaseFile);
      
      expect(result.extractionMethod).toBe('DIRECT');
      expect(result.text).toContain('screenplay');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });
  });

  describe('Progress Callback Integration', () => {
    it('calls progress callback during processing', async () => {
      const progressCallback = vi.fn();
      const parser = new PDFParserService(progressCallback);
      
      // Mock internal methods
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample screenplay content with meaningful text length and proper screenplay format. FADE IN:\n\nINT. OFFICE - DAY\n\nCharacter dialogue and action lines.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      await parser.parseFile(testFile);
      
      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          current: expect.any(Number),
          total: expect.any(Number),
          stage: expect.any(String)
        })
      );
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('works without progress callback', async () => {
      const parser = new PDFParserService(); // No callback
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample screenplay content with sufficient length for validation.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      const result = await parser.parseFile(testFile);
      
      expect(result).toBeDefined();
      expect(result.extractionMethod).toBe('DIRECT');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });
  });

  describe('Enhanced isExtractionSuccessful Edge Cases', () => {
    let parser: PDFParserService;
    
    beforeEach(() => {
      parser = new PDFParserService();
    });
    
    it('rejects very short text', () => {
      const shortText = 'Too short';
      const fileSize = 1024;
      
      const result = (parser as any).isExtractionSuccessful(shortText, fileSize);
      expect(result).toBe(false);
    });

    it('rejects text with too few words', () => {
      const fewWordsText = 'Only five words here total';
      const fileSize = 1024;
      
      const result = (parser as any).isExtractionSuccessful(fewWordsText, fileSize);
      expect(result).toBe(false);
    });

    it('rejects text with poor letter ratio (mostly symbols)', () => {
      const symbolsText = '!@#$%^&*()_+-=[]{}|;:,.<>? '.repeat(20);
      const fileSize = 1024;
      
      const result = (parser as any).isExtractionSuccessful(symbolsText, fileSize);
      expect(result).toBe(false);
    });

    it('rejects highly repetitive text (OCR artifacts)', () => {
      const repetitiveText = 'same word same word same word '.repeat(20);
      const fileSize = 1024;
      
      const result = (parser as any).isExtractionSuccessful(repetitiveText, fileSize);
      expect(result).toBe(false);
    });

    it('accepts valid screenplay text', () => {
      const screenplayText = `
        FADE IN:
        
        INT. OFFICE BUILDING - DAY
        
        JOHN, a determined detective in his forties, walks through the lobby.
        
        JOHN
        (into phone)
        I need backup at the downtown location.
        
        The elevator doors close as he approaches.
        
        CUT TO:
        
        EXT. STREET - CONTINUOUS
        
        Multiple police cars arrive at the scene with sirens blaring.
      `;
      const fileSize = 2048;
      
      const result = (parser as any).isExtractionSuccessful(screenplayText, fileSize);
      expect(result).toBe(true);
    });

    it('warns about files with high file size to text ratio', () => {
      const normalText = 'This is a normal text with reasonable length for testing purposes. '.repeat(10);
      const largeFileSize = 1024 * 1024; // 1MB for small text = high ratio
      
      const result = (parser as any).isExtractionSuccessful(normalText, largeFileSize);
      
      expect(consoleSpy).toHaveBeenCalledWith('High file size to text ratio - may be image-heavy PDF');
      expect(result).toBe(true); // Still valid, just warned
    });

    it('handles Polish characters correctly', () => {
      const polishText = `
        WŁĄCZ ŚWIATŁO:
        
        WN. BIURO - DZIEŃ
        
        KRZYSZTOF, zdeterminowany detektyw po czterdziestce, przechodzi przez hol.
        
        KRZYSZTOF
        (do telefonu)
        Potrzebuję wsparcia w centrum miasta.
        
        Drzwi windy zamykają się gdy się zbliża.
      `;
      const fileSize = 1024;
      
      const result = (parser as any).isExtractionSuccessful(polishText, fileSize);
      expect(result).toBe(true);
    });
  });

  describe('Error Classification and Recovery', () => {
    it('handles network timeout errors gracefully', async () => {
      const parser = new PDFParserService();
      
      // Mock network timeout error
      const networkError = new Error('Network timeout occurred while fetching PDF data');
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockRejectedValue(networkError);
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('Network error during processing');
      
      extractTextDirectSpy.mockRestore();
    });

    it('handles corrupted PDF errors appropriately', async () => {
      const parser = new PDFParserService();
      
      const corruptionError = new Error('PDF file appears to be corrupted or invalid format');
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockRejectedValue(corruptionError);
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('PDF file appears to be corrupted or invalid');
      
      extractTextDirectSpy.mockRestore();
    });

    it('handles encrypted PDF detection', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: false,
        hasImages: false,
        isEncrypted: true
      });
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('PDF is password-protected');
      
      analyzePDFMetadataSpy.mockRestore();
    });
  });

  describe('Chunk Combination Logic', () => {
    let parser: PDFParserService;
    
    beforeEach(() => {
      parser = new PDFParserService();
    });
    
    it('prefers direct extraction when significantly longer', () => {
      const directText = 'Direct extraction result with much more content and detailed information. '.repeat(20);
      const ocrText = 'Short OCR result.';
      
      const result = (parser as any).combineExtractionResults(directText, ocrText);
      expect(result).toBe(directText);
    });

    it('prefers OCR when significantly longer', () => {
      const directText = 'Short direct result.';
      const ocrText = 'OCR extraction result with much more detailed content and information. '.repeat(20);
      
      const result = (parser as any).combineExtractionResults(directText, ocrText);
      expect(result).toBe(ocrText);
    });

    it('combines both when similar lengths', () => {
      const directText = 'Direct extraction with reasonable content length.';
      const ocrText = 'OCR extraction with similar content length here.';
      
      const result = (parser as any).combineExtractionResults(directText, ocrText);
      expect(result).toContain(directText);
      expect(result).toContain(ocrText);
      expect(result).toContain('--- OCR SUPPLEMENT ---');
    });
  });

  describe('Metadata Analysis', () => {
    it('returns default metadata when analysis fails', async () => {
      const parser = new PDFParserService();
      
      // Mock PDF document loading failure
      vi.mock('pdfjs-dist', () => ({
        getDocument: vi.fn().mockReturnValue({
          promise: Promise.reject(new Error('Failed to load PDF'))
        })
      }));
      
      const testFile = createFile(1024);
      const metadata = await (parser as any).analyzePDFMetadata(testFile);
      
      expect(metadata).toEqual({
        hasText: true, // Assumes text if can't check
        hasImages: false,
        isEncrypted: false
      });
    });
  });

  describe('Performance Considerations', () => {
    it('handles large file size estimation correctly', () => {
      const hugeMockFile = createFile(50 * 1024 * 1024); // 50MB (hypothetical)
      const estimatedTime = PDFParserService.estimateProcessingTime(hugeMockFile);
      
      expect(estimatedTime).toBe(60000); // Caps at 60 seconds
    });

    it('provides reasonable estimates for different file sizes', () => {
      const sizes = [
        { size: 0.5 * 1024 * 1024, expected: 5000 },
        { size: 3 * 1024 * 1024, expected: 20000 },
        { size: 8 * 1024 * 1024, expected: 40000 },
        { size: 15 * 1024 * 1024, expected: 60000 }
      ];
      
      sizes.forEach(({ size, expected }) => {
        const file = createFile(size);
        const estimate = PDFParserService.estimateProcessingTime(file);
        expect(estimate).toBe(expected);
      });
    });
  });
});
