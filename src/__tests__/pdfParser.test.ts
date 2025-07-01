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

  describe('Constructor and Initialization', () => {
    it('initializes with progress callback', () => {
      const callback = vi.fn();
      const parser = new PDFParserService(callback);
      expect(parser).toBeInstanceOf(PDFParserService);
    });

    it('initializes without progress callback', () => {
      const parser = new PDFParserService();
      expect(parser).toBeInstanceOf(PDFParserService);
    });

    it('stores progress callback correctly', () => {
      const callback = vi.fn();
      const parser = new PDFParserService(callback);
      // Access private property for testing
      expect((parser as any).progressCallback).toBe(callback);
    });
  });

  describe('Advanced File Type Validation', () => {
    it('validates file with null bytes in filename', async () => {
      const parser = new PDFParserService();
      const nullByteFile = createFile(1024, 'application/pdf', 'test\0.pdf');
      
      await expect(parser.parseFile(nullByteFile)).rejects.toThrow('Invalid filename');
    });

    it('validates file with control characters in filename', async () => {
      const parser = new PDFParserService();
      const controlCharFile = createFile(1024, 'application/pdf', 'test\x01\x02.pdf');
      
      await expect(parser.parseFile(controlCharFile)).rejects.toThrow('Invalid filename');
    });

    it('accepts files with Unicode characters in filename', async () => {
      const parser = new PDFParserService();
      
      // Mock internal methods
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length for validation.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const unicodeFile = createFile(1024, 'application/pdf', 'тест_файл_中文_🎬.pdf');
      const result = await parser.parseFile(unicodeFile);
      
      expect(result).toBeDefined();
      expect(result.extractionMethod).toBe('DIRECT');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('rejects files with path traversal attempts', async () => {
      const parser = new PDFParserService();
      const traversalFile = createFile(1024, 'application/pdf', '../../../etc/passwd.pdf');
      
      await expect(parser.parseFile(traversalFile)).rejects.toThrow('Invalid filename');
    });

    it('handles files with very long extensions', async () => {
      const parser = new PDFParserService();
      const longExtFile = createFile(1024, 'application/pdf', 'test.' + 'p'.repeat(100));
      
      await expect(parser.parseFile(longExtFile)).rejects.toThrow('Invalid file extension');
    });
  });

  describe('Boundary Value Testing', () => {
    it('handles file exactly at size limit', () => {
      const exactLimitFile = createFile(10 * 1024 * 1024); // Exactly 10MB
      expect(PDFParserService.validateFileSize(exactLimitFile)).toBe(true);
    });

    it('handles file one byte over limit', () => {
      const overLimitFile = createFile(10 * 1024 * 1024 + 1); // 10MB + 1 byte
      expect(PDFParserService.validateFileSize(overLimitFile)).toBe(false);
    });

    it('handles file one byte under limit', () => {
      const underLimitFile = createFile(10 * 1024 * 1024 - 1); // 10MB - 1 byte
      expect(PDFParserService.validateFileSize(underLimitFile)).toBe(true);
    });

    it('handles minimum size file', () => {
      const minFile = createFile(1);
      expect(PDFParserService.validateFileSize(minFile)).toBe(true);
    });
  });

  describe('Text Quality Assessment Edge Cases', () => {
    let parser: PDFParserService;
    
    beforeEach(() => {
      parser = new PDFParserService();
    });

    it('handles text with only whitespace', () => {
      const whitespaceText = '   \n\n\t\t\r\r   \n\n   ';
      const result = (parser as any).isExtractionSuccessful(whitespaceText, 1024);
      expect(result).toBe(false);
    });

    it('handles text with mixed languages and scripts', () => {
      const multiLangText = `
        FADE IN: צמח
        
        INT. OFFICE - DAY مكتب
        
        JOHN walks through the lobby. يمشي جون عبر البهو.
        Character speaks in multiple languages.
        
        JOHN
        (into phone)
        Hello, привет, שלום, مرحبا
        
        The scene continues with various international elements.
      `;
      const result = (parser as any).isExtractionSuccessful(multiLangText, 1024);
      expect(result).toBe(true);
    });

    it('handles text with screenplay-specific formatting markers', () => {
      const screenplayText = `
        FADE IN:
        
        EXT. BEACH - SUNSET
        
        JANE (V.O.)
        The sun sets over the horizon.
        
        JANE
        (whispering)
        This is our moment.
        
        CUT TO:
        
        INT. CAR - NIGHT
        
        DISSOLVE TO BLACK.
        
        THE END
      `;
      const result = (parser as any).isExtractionSuccessful(screenplayText, 1024);
      expect(result).toBe(true);
    });

    it('rejects text with too many consecutive identical characters', () => {
      const repetitiveText = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa '.repeat(50);
      const result = (parser as any).isExtractionSuccessful(repetitiveText, 1024);
      expect(result).toBe(false);
    });

    it('handles text with reasonable amount of numbers and punctuation', () => {
      const mixedText = `
        Scene 1: Office Building (Floor 42)
        
        Time: 3:30 PM on December 15th, 2024
        
        Character ages: John (35), Jane (28), Bob (52)
        
        Dialogue includes: "Hello!", "Good morning?", "Let's go..."
        
        The scene costs $50,000 to produce.
      `;
      const result = (parser as any).isExtractionSuccessful(mixedText, 1024);
      expect(result).toBe(true);
    });

    it('rejects text with excessive numeric content (data dumps)', () => {
      const numericText = '1234567890 '.repeat(100) + 'some text here';
      const result = (parser as any).isExtractionSuccessful(numericText, 1024);
      expect(result).toBe(false);
    });
  });

  describe('Progress Callback Advanced Scenarios', () => {
    it('handles progress callback that throws errors', async () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Progress callback error');
      });
      const parser = new PDFParserService(errorCallback);
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      
      // Should not crash despite callback error
      const result = await parser.parseFile(testFile);
      expect(result).toBeDefined();
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('calls progress callback with correct sequence of stages', async () => {
      const progressCallback = vi.fn();
      const parser = new PDFParserService(progressCallback);
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      await parser.parseFile(testFile);
      
      // Check that different stages were called
      const stages = progressCallback.mock.calls.map(call => call[0].stage);
      expect(stages).toContain('Validating file');
      expect(stages).toContain('Analyzing PDF');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('provides accurate progress percentages', async () => {
      const progressCallback = vi.fn();
      const parser = new PDFParserService(progressCallback);
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      await parser.parseFile(testFile);
      
      // Check that progress values are reasonable
      const progressValues = progressCallback.mock.calls.map(call => call[0].current / call[0].total);
      expect(progressValues.every(val => val >= 0 && val <= 1)).toBe(true);
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });
  });

  describe('Memory and Resource Management', () => {
    it('handles multiple sequential file parsing', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const files = [
        createFile(1024, 'application/pdf', 'file1.pdf'),
        createFile(2048, 'application/pdf', 'file2.pdf'),
        createFile(512, 'application/pdf', 'file3.pdf')
      ];
      
      const results = [];
      for (const file of files) {
        const result = await parser.parseFile(file);
        results.push(result);
      }
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.extractionMethod).toBe('DIRECT');
      });
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('handles concurrent file parsing attempts', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: false,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Sample content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const files = [
        createFile(1024, 'application/pdf', 'concurrent1.pdf'),
        createFile(1024, 'application/pdf', 'concurrent2.pdf'),
        createFile(1024, 'application/pdf', 'concurrent3.pdf')
      ];
      
      const promises = files.map(file => parser.parseFile(file));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });
  });

  describe('Error Recovery and Fallback Mechanisms', () => {
    it('falls back to OCR when direct extraction fails', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: false,
        hasImages: true,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockRejectedValue(
        new Error('Direct extraction failed')
      );
      
      const extractTextOCRSpy = vi.spyOn(parser as any, 'extractTextOCR').mockResolvedValue({
        text: 'OCR extracted content with sufficient length.',
        pageCount: 1
      });
      
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful').mockReturnValue(true);
      
      const testFile = createFile(1024);
      const result = await parser.parseFile(testFile);
      
      expect(result.extractionMethod).toBe('OCR');
      expect(result.text).toContain('OCR extracted');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      extractTextOCRSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });

    it('handles both direct and OCR extraction failures gracefully', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: true,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockRejectedValue(
        new Error('Direct extraction failed')
      );
      
      const extractTextOCRSpy = vi.spyOn(parser as any, 'extractTextOCR').mockRejectedValue(
        new Error('OCR extraction failed')
      );
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('Failed to extract text from PDF');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      extractTextOCRSpy.mockRestore();
    });

    it('handles partial extraction success scenarios', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockResolvedValue({
        hasText: true,
        hasImages: true,
        isEncrypted: false
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockResolvedValue({
        text: 'Short', // Too short to be successful
        pageCount: 1
      });
      
      const extractTextOCRSpy = vi.spyOn(parser as any, 'extractTextOCR').mockResolvedValue({
        text: 'OCR provided much more comprehensive content extraction.',
        pageCount: 1
      });
      
      const originalIsExtractionSuccessful = (parser as any).isExtractionSuccessful;
      const isExtractionSuccessfulSpy = vi.spyOn(parser as any, 'isExtractionSuccessful')
        .mockImplementation((text: string, fileSize: number) => {
          return originalIsExtractionSuccessful.call(parser, text, fileSize);
        });
      
      const testFile = createFile(1024);
      const result = await parser.parseFile(testFile);
      
      expect(result.extractionMethod).toBe('OCR');
      expect(result.text).toContain('comprehensive');
      
      analyzePDFMetadataSpy.mockRestore();
      extractTextDirectSpy.mockRestore();
      extractTextOCRSpy.mockRestore();
      isExtractionSuccessfulSpy.mockRestore();
    });
  });

  describe('Type Safety and Input Validation', () => {
    it('handles undefined file input', async () => {
      const parser = new PDFParserService();
      const undefinedFile = undefined as any;
      
      await expect(parser.parseFile(undefinedFile)).rejects.toThrow('Invalid file provided');
    });

    it('handles file with missing properties', async () => {
      const parser = new PDFParserService();
      const invalidFile = { size: 1024 } as any; // Missing name, type, etc.
      
      await expect(parser.parseFile(invalidFile)).rejects.toThrow('Invalid file provided');
    });

    it('validates file object structure completely', async () => {
      const parser = new PDFParserService();
      const malformedFile = {
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf'
        // Missing other File properties like arrayBuffer, stream, etc.
      } as any;
      
      await expect(parser.parseFile(malformedFile)).rejects.toThrow('Invalid file provided');
    });
  });

  describe('Static Method Edge Cases', () => {
    it('getSupportedFormats returns immutable array', () => {
      const formats1 = PDFParserService.getSupportedFormats();
      const formats2 = PDFParserService.getSupportedFormats();
      
      expect(formats1).toEqual(formats2);
      expect(formats1).not.toBe(formats2); // Different array instances
      
      // Modifying returned array shouldn't affect future calls
      formats1.push('fake-format');
      const formats3 = PDFParserService.getSupportedFormats();
      expect(formats3).not.toContain('fake-format');
    });

    it('estimateProcessingTime handles edge cases with file size', () => {
      expect(PDFParserService.estimateProcessingTime(createFile(0))).toBe(5000);
      expect(PDFParserService.estimateProcessingTime(createFile(-1000))).toBe(5000); // Negative size
      expect(PDFParserService.estimateProcessingTime(createFile(Infinity))).toBe(60000);
      expect(PDFParserService.estimateProcessingTime(createFile(NaN))).toBe(5000);
    });

    it('validateFileSize handles edge cases', () => {
      expect(PDFParserService.validateFileSize(createFile(0))).toBe(false);
      expect(PDFParserService.validateFileSize(createFile(-1))).toBe(false);
      expect(PDFParserService.validateFileSize(createFile(Infinity))).toBe(false);
      expect(PDFParserService.validateFileSize(createFile(NaN))).toBe(false);
    });
  });

  describe('Text Combination Strategy Advanced Cases', () => {
    let parser: PDFParserService;
    
    beforeEach(() => {
      parser = new PDFParserService();
    });

    it('handles empty strings in combination', () => {
      const result1 = (parser as any).combineExtractionResults('', 'OCR content');
      expect(result1).toBe('OCR content');
      
      const result2 = (parser as any).combineExtractionResults('Direct content', '');
      expect(result2).toBe('Direct content');
      
      const result3 = (parser as any).combineExtractionResults('', '');
      expect(result3).toBe('');
    });

    it('handles whitespace-only strings in combination', () => {
      const result1 = (parser as any).combineExtractionResults('   \n\t   ', 'OCR content');
      expect(result1).toBe('OCR content');
      
      const result2 = (parser as any).combineExtractionResults('Direct content', '   \n\t   ');
      expect(result2).toBe('Direct content');
    });

    it('combines identical content without duplication', () => {
      const identicalContent = 'This is the same content extracted by both methods.';
      const result = (parser as any).combineExtractionResults(identicalContent, identicalContent);
      expect(result).toBe(identicalContent);
      expect((result.match(/same content/g) || []).length).toBe(1); // Should appear only once
    });

    it('handles very large text combination', () => {
      const largeDirectText = 'Direct content. '.repeat(1000);
      const largeOCRText = 'OCR content. '.repeat(1000);
      
      const result = (parser as any).combineExtractionResults(largeDirectText, largeOCRText);
      expect(result).toContain('Direct content.');
      expect(result).toContain('OCR content.');
      expect(result).toContain('--- OCR SUPPLEMENT ---');
    });
  });

  describe('Async Operation Handling', () => {
    it('handles Promise rejection in metadata analysis', async () => {
      const parser = new PDFParserService();
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockRejectedValue(
        new Error('Metadata analysis failed')
      );
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('Metadata analysis failed');
      
      analyzePDFMetadataSpy.mockRestore();
    });

    it('handles timeout scenarios gracefully', async () => {
      const parser = new PDFParserService();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), 1);
      });
      
      const extractTextDirectSpy = vi.spyOn(parser as any, 'extractTextDirect').mockReturnValue(timeoutPromise);
      
      const testFile = createFile(1024);
      
      await expect(parser.parseFile(testFile)).rejects.toThrow('Operation timed out');
      
      extractTextDirectSpy.mockRestore();
    });
  });

  describe('Security and Safety Validations', () => {
    it('sanitizes file names for security', async () => {
      const parser = new PDFParserService();
      const maliciousFile = createFile(1024, 'application/pdf', '<script>alert("xss")</script>.pdf');
      
      await expect(parser.parseFile(maliciousFile)).rejects.toThrow('Invalid filename');
    });

    it('validates MIME type consistency', async () => {
      const parser = new PDFParserService();
      const inconsistentFile = createFile(1024, 'text/html', 'document.pdf'); // Wrong MIME type
      
      await expect(parser.parseFile(inconsistentFile)).rejects.toThrow('Invalid file type');
    });

    it('handles files with suspicious binary patterns', async () => {
      const parser = new PDFParserService();
      
      // Create file with suspicious binary content
      const suspiciousContent = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      const suspiciousFile = createMockPDFFile(suspiciousContent);
      
      const analyzePDFMetadataSpy = vi.spyOn(parser as any, 'analyzePDFMetadata').mockRejectedValue(
        new Error('Suspicious file content detected')
      );
      
      await expect(parser.parseFile(suspiciousFile)).rejects.toThrow('Suspicious file content detected');
      
      analyzePDFMetadataSpy.mockRestore();
    });
  });

  describe('Accessibility and Internationalization', () => {
    it('handles right-to-left text correctly', () => {
      const parser = new PDFParserService();
      const rtlText = `
        מתחיל בהיכנס:
        
        פנימי. משרד - יום
        
        יוחנן, בלש נחוש בן ארבעים, הולך דרך הלובי.
        
        יוחנן
        (לתוך הטלפון)
        אני צריך גיבוי במקום במרכז העיר.
      `;
      
      const result = (parser as any).isExtractionSuccessful(rtlText, 1024);
      expect(result).toBe(true);
    });

    it('handles mixed directional text (bidirectional)', () => {
      const parser = new PDFParserService();
      const bidiText = `
        FADE IN: התחלה
        
        INT. OFFICE משרד - DAY יום
        
        JOHN יוחנן walks הולך through דרך the הלובי lobby.
        
        JOHN יוחנן
        (into בתוך phone טלפון)
        Hello שלום, I need אני צריך backup גיבוי.
      `;
      
      const result = (parser as any).isExtractionSuccessful(bidiText, 1024);
      expect(result).toBe(true);
    });

    it('handles emojis and special Unicode characters', () => {
      const parser = new PDFParserService();
      const emojiText = `
        🎬 FADE IN: 
        
        🏢 INT. OFFICE - DAY ☀️
        
        JOHN 👨‍💼, a determined detective, walks through the lobby.
        
        JOHN 👨‍💼
        (into phone 📱)
        I need backup! 🚨
        
        The elevator doors close 🚪 as he approaches.
      `;
      
      const result = (parser as any).isExtractionSuccessful(emojiText, 1024);
      expect(result).toBe(true);
    });
  });

  describe('Performance Edge Cases', () => {
    it('handles very long single line text', () => {
      const parser = new PDFParserService();
      const longLineText = 'This is a very long line of text that continues without any line breaks and contains sufficient content to be considered valid screenplay text. '.repeat(50);
      
      const result = (parser as any).isExtractionSuccessful(longLineText, 1024);
      expect(result).toBe(true);
    });

    it('handles text with many short lines', () => {
      const parser = new PDFParserService();
      const shortLinesText = Array(100).fill('Short line.').join('\n');
      
      const result = (parser as any).isExtractionSuccessful(shortLinesText, 1024);
      expect(result).toBe(true);
    });

    it('handles text with extreme word count variations', () => {
      const parser = new PDFParserService();
      const variableText = `
        Word.
        Two words here.
        This sentence has several words in it.
        This is a much longer sentence with many more words and detailed descriptions.
        Supercalifragilisticexpialidocious.
        ${Array(50).fill('Normal').join(' ')}.
      `;
      
      const result = (parser as any).isExtractionSuccessful(variableText, 1024);
      expect(result).toBe(true);
    });
  });
