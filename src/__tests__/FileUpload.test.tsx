import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import FileUpload from '../components/FileUpload';

// Mock file reader and other browser APIs
const mockFileReader = {
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  result: 'data:image/png;base64,mockbase64data',
  onload: null as any,
  onerror: null as any,
  onabort: null as any,
  readyState: 0,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
};

const mockCreateObjectURL = vi.fn(() => 'mock-object-url');
const mockRevokeObjectURL = vi.fn();

// Setup global mocks
beforeAll(() => {
  global.FileReader = vi.fn(() => mockFileReader) as any;
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: mockCreateObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: mockRevokeObjectURL,
  });
});

describe('FileUpload Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileReader.readAsDataURL.mockClear();
    mockFileReader.readAsText.mockClear();
  });

  describe('Initial Rendering', () => {
    test('renders file upload component with default state', () => {
      render(<FileUpload />);
      
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
      expect(screen.getByText(/drag.*drop|choose.*file/i)).toBeInTheDocument();
    });

    test('renders with custom label when provided', () => {
      const customLabel = 'Select Your Documents';
      render(<FileUpload label={customLabel} />);
      
      expect(screen.getByText(customLabel)).toBeInTheDocument();
    });

    test('applies accept attribute to file input', () => {
      render(<FileUpload accept="image/*,.pdf" />);
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf');
    });

    test('renders in disabled state when disabled prop is true', () => {
      render(<FileUpload disabled={true} />);
      
      const uploadButton = screen.getByRole('button');
      expect(uploadButton).toBeDisabled();
    });

    test('sets multiple attribute when multiple prop is true', () => {
      render(<FileUpload multiple={true} />);
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });

  describe('File Selection via Input', () => {
    test('handles single file selection correctly', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
    });

    test('handles multiple file selection when multiple prop is true', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} multiple={true} />);
      
      const files = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ];
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, files);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith(files);
    });

    test('calls onChange callback when provided', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onChange={mockOnChange} />);
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop Functionality', () => {
    test('handles file drop correctly', async () => {
      const mockOnFileSelect = vi.fn();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const dropZone = screen.getByText(/drag.*drop|drop.*here/i).closest('div');
      const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });
      
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
          items: [],
          types: ['Files'],
        },
      });
      
      fireEvent(dropZone!, dropEvent);
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
      });
    });

    test('shows visual feedback during drag over', () => {
      render(<FileUpload />);
      
      const dropZone = screen.getByText(/drag.*drop|drop.*here/i).closest('div');
      
      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { types: ['Files'] },
      });
      
      fireEvent(dropZone!, dragOverEvent);
      
      expect(dropZone).toHaveClass(/drag-over|dragging|active|highlight/);
    });

    test('removes visual feedback when drag leaves', () => {
      render(<FileUpload />);
      
      const dropZone = screen.getByText(/drag.*drop|drop.*here/i).closest('div');
      
      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { types: ['Files'] },
      });
      
      fireEvent(dropZone!, dragOverEvent);
      
      const dragLeaveEvent = new Event('dragleave', { bubbles: true });
      fireEvent(dropZone!, dragLeaveEvent);
      
      expect(dropZone).not.toHaveClass(/drag-over|dragging|active|highlight/);
    });

    test('prevents default behavior for drag events', () => {
      render(<FileUpload />);
      
      const dropZone = screen.getByText(/drag.*drop|drop.*here/i).closest('div');
      
      const dragOverEvent = new Event('dragover', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault');
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { types: ['Files'] },
      });
      
      fireEvent(dropZone!, dragOverEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('ignores non-file drag events', () => {
      const mockOnFileSelect = vi.fn();
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const dropZone = screen.getByText(/drag.*drop|drop.*here/i).closest('div');
      
      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { types: ['text/plain'] },
      });
      
      fireEvent(dropZone!, dragOverEvent);
      
      expect(dropZone).not.toHaveClass(/drag-over|dragging|active|highlight/);
    });
  });

  describe('File Validation', () => {
    test('validates file size when maxSize is set', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onError={mockOnError} maxSize={100} />);
      
      const largeFile = new File(['a'.repeat(200)], 'large.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, largeFile);
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FILE_TOO_LARGE',
          message: expect.stringContaining('size'),
          file: largeFile,
        })
      );
    });

    test('validates file types with MIME types', async () => {
      const mockOnError = vi.fn();
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          accept="image/png,image/jpeg"
        />
      );
      
      const validFile = new File(['content'], 'image.png', { type: 'image/png' });
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      // Test valid file
      await user.upload(fileInput, validFile);
      expect(mockOnFileSelect).toHaveBeenCalledWith([validFile]);
      
      // Clear previous calls
      vi.clearAllMocks();
      
      // Test invalid file
      await user.upload(fileInput, invalidFile);
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'INVALID_FILE_TYPE',
          message: expect.stringContaining('type'),
          file: invalidFile,
        })
      );
    });

    test('validates file extensions', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onError={mockOnError} accept=".pdf,.doc,.docx" />);
      
      const invalidFile = new File(['content'], 'image.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, invalidFile);
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'INVALID_FILE_TYPE',
        })
      );
    });

    test('validates maximum number of files', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onError={mockOnError} multiple={true} maxFiles={2} />);
      
      const files = [
        new File(['1'], '1.txt', { type: 'text/plain' }),
        new File(['2'], '2.txt', { type: 'text/plain' }),
        new File(['3'], '3.txt', { type: 'text/plain' }),
      ];
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, files);
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TOO_MANY_FILES',
          message: expect.stringContaining('maximum'),
        })
      );
    });

    test('validates minimum number of files', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onError={mockOnError} multiple={true} minFiles={2} />);
      
      const file = new File(['content'], 'single.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TOO_FEW_FILES',
          message: expect.stringContaining('minimum'),
        })
      );
    });

    test('allows files that pass all validations', async () => {
      const mockOnFileSelect = vi.fn();
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          maxSize={1000}
          accept="text/plain"
          maxFiles={5}
        />
      );
      
      const validFile = new File(['content'], 'valid.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, validFile);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([validFile]);
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('File Preview Generation', () => {
    test('generates preview for image files', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} showPreview={true} />);
      
      const imageFile = new File(['image-content'], 'image.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, imageFile);
      
      // Simulate FileReader completing
      mockFileReader.result = 'data:image/png;base64,mockbase64data';
      mockFileReader.onload();
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,mockbase64data');
      });
    });

    test('handles FileReader errors gracefully', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onError={mockOnError} showPreview={true} />);
      
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      // Simulate FileReader error
      const errorEvent = new ProgressEvent('error');
      mockFileReader.onerror(errorEvent);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'PREVIEW_ERROR',
          })
        );
      });
    });

    test('skips preview generation for non-image files', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} showPreview={true} />);
      
      const textFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, textFile);
      
      expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Upload Progress', () => {
    test('displays upload progress when provided', () => {
      render(<FileUpload progress={45} showProgress={true} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    test('hides progress bar when progress is not provided', () => {
      render(<FileUpload showProgress={true} />);
      
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    test('shows completed state when progress is 100', () => {
      render(<FileUpload progress={100} showProgress={true} />);
      
      expect(screen.getByText(/complete|success|done/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    test('shows loading state during upload', () => {
      render(<FileUpload progress={50} isUploading={true} />);
      
      expect(screen.getByText(/uploading|loading/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<FileUpload />);
      
      const uploadButton = screen.getByRole('button');
      expect(uploadButton).toHaveAttribute('aria-label');
      
      const fileInput = uploadButton.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('aria-describedby');
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload />);
      
      const uploadButton = screen.getByRole('button');
      
      // Tab to the button
      await user.tab();
      expect(uploadButton).toHaveFocus();
      
      // Press Enter or Space to trigger file selection
      await user.keyboard('{Enter}');
      
      // File input should be accessible
      const fileInput = uploadButton.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    test('announces file selection to screen readers', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload />);
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        const announcement = screen.getByText(/selected|chosen/i);
        expect(announcement).toBeInTheDocument();
        expect(announcement).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('provides proper focus management', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload />);
      
      const uploadButton = screen.getByRole('button');
      await user.click(uploadButton);
      
      // Focus should remain manageable
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Error Handling and Display', () => {
    test('displays error messages when showErrors is true', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload maxSize={10} showErrors={true} />);
      
      const largeFile = new File(['x'.repeat(20)], 'large.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText(/error|invalid|too large/i)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    test('clears error messages on successful file selection', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload maxSize={100} showErrors={true} />);
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      // Upload invalid file first
      const largeFile = new File(['x'.repeat(200)], 'large.txt', { type: 'text/plain' });
      await user.upload(fileInput, largeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Upload valid file
      const validFile = new File(['small'], 'small.txt', { type: 'text/plain' });
      await user.upload(fileInput, validFile);
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    test('handles multiple errors appropriately', async () => {
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onError={mockOnError}
          maxSize={50}
          accept="image/*"
          showErrors={true}
        />
      );
      
      // File that violates both size and type constraints
      const invalidFile = new File(['x'.repeat(100)], 'large.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, invalidFile);
      
      // Should report both errors
      expect(mockOnError).toHaveBeenCalledTimes(2);
    });
  });

  describe('File List Management', () => {
    test('displays selected files when showFileList is true', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload showFileList={true} multiple={true} />);
      
      const files = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
      ];
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, files);
      
      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('file2.txt')).toBeInTheDocument();
      });
    });

    test('allows removing files from the list', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onFileSelect={mockOnFileSelect}
          showFileList={true}
          multiple={true}
          allowRemove={true}
        />
      );
      
      const files = [
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' }),
      ];
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, files);
      
      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });
      
      // Find and click remove button for first file
      const removeButton = screen.getByRole('button', { name: /remove|delete/i });
      await user.click(removeButton);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([files[1]]);
    });

    test('shows file size information', async () => {
      const user = userEvent.setup();
      
      render(<FileUpload showFileList={true} showFileSize={true} />);
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText(/\d+\s*(B|KB|MB)/)).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle and Cleanup', () => {
    test('revokes object URLs when component unmounts', () => {
      mockCreateObjectURL.mockReturnValue('mock-url-1');
      
      const { unmount } = render(<FileUpload showPreview={true} />);
      
      unmount();
      
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url-1');
    });

    test('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<FileUpload />);
      
      unmount();
      
      // Verify that removeEventListener is called for each addEventListener
      const addCalls = addEventListenerSpy.mock.calls;
      const removeCalls = removeEventListenerSpy.mock.calls;
      
      addCalls.forEach(([event, handler]) => {
        expect(removeCalls).toContainEqual([event, handler]);
      });
    });

    test('handles component re-renders without issues', () => {
      const { rerender } = render(<FileUpload maxSize={100} />);
      
      rerender(<FileUpload maxSize={200} />);
      rerender(<FileUpload maxSize={300} accept="image/*" />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('handles empty file selection gracefully', async () => {
      const mockOnFileSelect = vi.fn();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      // Simulate selecting no files
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    test('handles files with no extension', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const fileWithoutExtension = new File(['content'], 'README', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, fileWithoutExtension);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([fileWithoutExtension]);
    });

    test('handles extremely long filenames', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const longName = 'a'.repeat(300) + '.txt';
      const fileWithLongName = new File(['content'], longName, { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, fileWithLongName);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([fileWithLongName]);
    });

    test('handles special characters in filenames', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const specialName = 'file@#$%^&*()_+{}|:<>?[]\\;\'",./`~.txt';
      const fileWithSpecialChars = new File(['content'], specialName, { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, fileWithSpecialChars);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([fileWithSpecialChars]);
    });

    test('handles zero-byte files', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, emptyFile);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([emptyFile]);
    });

    test('handles files with unusual MIME types', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const unusualFile = new File(['content'], 'test.xyz', { type: 'application/x-unknown' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, unusualFile);
      
      expect(mockOnFileSelect).toHaveBeenCalledWith([unusualFile]);
    });

    test('handles rapid successive file selections', async () => {
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<FileUpload onFileSelect={mockOnFileSelect} />);
      
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, file1);
      await user.upload(fileInput, file2);
      
      expect(mockOnFileSelect).toHaveBeenCalledTimes(2);
      expect(mockOnFileSelect).toHaveBeenNthCalledWith(1, [file1]);
      expect(mockOnFileSelect).toHaveBeenNthCalledWith(2, [file2]);
    });
  });

  describe('Custom Validation Functions', () => {
    test('applies custom validation function', async () => {
      const customValidator = vi.fn((file: File) => {
        if (file.name.includes('invalid')) {
          return { isValid: false, message: 'Filename contains invalid text' };
        }
        return { isValid: true };
      });
      
      const mockOnError = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onError={mockOnError}
          customValidator={customValidator}
        />
      );
      
      const invalidFile = new File(['content'], 'invalid_file.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, invalidFile);
      
      expect(customValidator).toHaveBeenCalledWith(invalidFile);
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CUSTOM_VALIDATION_ERROR',
          message: 'Filename contains invalid text',
        })
      );
    });

    test('allows files that pass custom validation', async () => {
      const customValidator = vi.fn(() => ({ isValid: true }));
      const mockOnFileSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FileUpload 
          onFileSelect={mockOnFileSelect}
          customValidator={customValidator}
        />
      );
      
      const validFile = new File(['content'], 'valid.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(fileInput, validFile);
      
      expect(customValidator).toHaveBeenCalledWith(validFile);
      expect(mockOnFileSelect).toHaveBeenCalledWith([validFile]);
    });
  });
});