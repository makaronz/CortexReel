import { describe, it, expect } from 'vitest';
import { PDFParserService } from '../services/pdfParser';

function createFile(size: number, type = 'application/pdf'): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], 'test.pdf', { type });
}

describe('PDFParserService', () => {
  it('validates file size', () => {
    const small = createFile(1024);
    const large = createFile(11 * 1024 * 1024);
    expect(PDFParserService.validateFileSize(small)).toBe(true);
    expect(PDFParserService.validateFileSize(large)).toBe(false);
  });

  it('lists supported formats', () => {
    const formats = PDFParserService.getSupportedFormats();
    expect(formats).toContain('application/pdf');
    expect(formats).toContain('.pdf');
  });
});
