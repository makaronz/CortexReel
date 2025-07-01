import {
  useState,
  useCallback,
  FC,
} from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import { useAnalysisStore } from '@/store/analysisStore';
import { PDFParserService } from '@/services/pdfParser';
import { GeminiAnalysisService } from '@/services/geminiService';
import { AdminConfigService } from '@/services/AdminConfigService';

const FileUpload: FC = () => {
  const {
    currentFile,
    extractedText,
    extractionMethod,
    setCurrentFile,
    setExtractedText,
    isProcessing,
    isAnalyzing,
    startProcessing,
    stopProcessing,
  } = useAnalysisStore();

  const {
    startAnalysis,
    updatePartialAnalysis,
    setAnalysisProgress,
    setAnalysisResult,
    setAnalysisError
  } = useAnalysisStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState<{
    current: number;
    total: number;
    stage: string;
  } | null>(null);

  // Enhanced validation function using PDFParserService methods
  const validateFile = (file: File): string | null => {
    // File size validation - use PDFParserService.validateFileSize()
    if (!PDFParserService.validateFileSize(file)) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return `Plik przekracza limit rozmiaru 10MB (aktualny rozmiar: ${sizeMB}MB). Spróbuj kompresji PDF lub wybierz mniejszy plik.`;
    }
    
    // File type validation with fallback if getSupportedFormats() is unavailable
    const supportedFormats = typeof PDFParserService.getSupportedFormats === 'function' 
      ? PDFParserService.getSupportedFormats() 
      : ['application/pdf', '.pdf'];
    const isValidType = supportedFormats.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
    
    if (!isValidType) {
      return `Nieobsługiwany format pliku. Obsługiwane formaty: PDF. Aktualny typ: ${file.type || 'nieznany'}`;
    }

    // Additional validations
    if (file.size === 0) {
      return 'Plik jest pusty. Wybierz prawidłowy plik PDF.';
    }

    if (file.name.length > 255) {
      return 'Nazwa pliku jest zbyt długa (max 255 znaków).';
    }

    return null; // File is valid
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLocalError(null);

    // Enhanced validation with specific error messages
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    startProcessing();
    setCurrentFile(file);
    
    // Get estimated processing time for user feedback
    const estimatedTime = PDFParserService.estimateProcessingTime(file);
    console.log(`Szacowany czas przetwarzania: ${Math.round(estimatedTime / 1000)}s`);

    try {
      const parser = new PDFParserService(setParseProgress);
      const parsedContent = await parser.parseFile(file);
      setExtractedText(parsedContent.text, parsedContent.extractionMethod);
      
      // Success feedback with extraction details
      console.log(`✅ Plik przetworzony pomyślnie:
        - Metoda: ${parsedContent.extractionMethod}
        - Strony: ${parsedContent.pageCount}
        - Czas: ${(parsedContent.processingTime / 1000).toFixed(1)}s
        - Pewność: ${(parsedContent.confidence * 100).toFixed(0)}%`);
      
    } catch (error) {
      let errorMessage = 'Nie udało się przetworzyć pliku';
      
      if (error instanceof Error) {
        // Specific error messages based on error type
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('file size')) {
          errorMessage = 'Plik jest zbyt duży do przetworzenia. Spróbuj kompresji PDF.';
        } else if (errorText.includes('invalid file type')) {
          errorMessage = 'Nieprawidłowy format pliku. Upewnij się, że to jest poprawny plik PDF.';
        } else if (errorText.includes('direct extraction') && errorText.includes('ocr')) {
          errorMessage = 'Nie udało się odczytać tekstu z PDF. Plik może być uszkodzony lub zawierać tylko obrazy bez tekstu.';
        } else if (errorText.includes('memory') || errorText.includes('timeout')) {
          errorMessage = 'Plik jest zbyt złożony do przetworzenia. Spróbuj z mniejszym plikiem.';
        } else if (errorText.includes('permission') || errorText.includes('encrypted')) {
          errorMessage = 'Plik PDF jest chroniony hasłem lub zaszyfrowany. Usuń ochronę i spróbuj ponownie.';
        } else {
          errorMessage = `Błąd przetwarzania pliku: ${error.message}`;
        }
      }
      
      setLocalError(errorMessage);
      console.error('File parsing error:', error);
      setCurrentFile(null); // Clear the failed file
    } finally {
      stopProcessing();
      setParseProgress(null);
    }
  }, [setCurrentFile, setExtractedText, startProcessing, stopProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB - keep consistent with PDFParserService
    disabled: isProcessing || isAnalyzing,
  });

  const handleStartAnalysis = async () => {
    if (!extractedText || !currentFile) return;

    try {
      startAnalysis();
      
      // Load admin configuration for analysis
      const adminConfigService = new AdminConfigService();
      const llmConfig = await adminConfigService.getLLMConfig();
      const promptConfig = await adminConfigService.getPromptConfig();
      
      console.log('🔧 Rozpoczynanie analizy z konfiguracją Admin Dashboard:', {
        model: llmConfig.model,
        customPrompts: Object.keys(promptConfig).length,
        fileName: currentFile.name
      });
      
      const analysisService = new GeminiAnalysisService(setAnalysisProgress, updatePartialAnalysis);
      const result = await analysisService.analyzeScreenplay(
        extractedText,
        currentFile.name
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      
      let errorMessage = 'Nie udało się przeprowadzić analizy';
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('api key')) {
          errorMessage = 'Brak lub nieprawidłowy klucz API. Skonfiguruj klucz w Panelu Administratora.';
        } else if (errorText.includes('quota') || errorText.includes('rate limit')) {
          errorMessage = 'Przekroczono limit zapytań API. Spróbuj ponownie za chwilę.';
        } else if (errorText.includes('network') || errorText.includes('connection')) {
          errorMessage = 'Błąd połączenia. Sprawdź internet i spróbuj ponownie.';
        } else {
          errorMessage = `Błąd analizy: ${error.message}`;
        }
      }
      
      setAnalysisError(errorMessage);
    }
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setExtractedText('', null);
    setLocalError(null);
  };
  
  const isActionDisabled = isProcessing || isAnalyzing;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon />
          Upload Screenplay
        </Typography>

        {localError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
            {localError}
          </Alert>
        )}

        {!currentFile && (
          <Box
            {...getRootProps()}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'transparent',
              opacity: isActionDisabled ? 0.6 : 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the file here' : 'Drag & drop a PDF screenplay'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports PDF files up to 10MB
            </Typography>
          </Box>
        )}

        {currentFile && (
          <Box sx={{ mb: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <DescriptionIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>{currentFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(currentFile.size / 1024 / 1024).toFixed(1)} MB
                    </Typography>
                  </Box>

                  {isProcessing && parseProgress && (
                    <Box sx={{ width: '100px' }}>
                      <Typography variant="caption">{parseProgress.stage}</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(parseProgress.current / parseProgress.total) * 100}
                      />
                    </Box>
                  )}

                  {extractedText && extractionMethod && !isProcessing && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Parsed (${extractionMethod})`}
                      color="success"
                      variant="outlined"
                    />
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRemoveFile}
                    disabled={isActionDisabled}
                  >
                    Remove
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {extractedText && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Extracted Text Preview:
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.900',
                color: 'grey.200',
                border: 1,
                borderColor: 'grey.700',
                borderRadius: 1,
                p: 2,
                maxHeight: 150,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            >
              {extractedText.substring(0, 1000)}
              {extractedText.length > 1000 && '...'}
            </Box>
             <Typography variant="caption" color="text.secondary">
              {extractedText.length.toLocaleString()} characters extracted
              {extractionMethod && ` via ${extractionMethod}`}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleStartAnalysis}
            disabled={!extractedText || isActionDisabled}
            sx={{ minWidth: 220 }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Full Analysis'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 