import { useState, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  Stack,
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
  const { t } = useTranslation();
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
    startAnalysis,
    updatePartialAnalysis,
    setAnalysisProgress,
    setAnalysisResult,
    setAnalysisError,
  } = useAnalysisStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState<{
    current: number;
    total: number;
    stage: string;
  } | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!PDFParserService.validateFileSize(file)) {
      return t('fileUpload.errors.fileTooLarge', {
        size: (file.size / 1024 / 1024).toFixed(1),
        maxSize: '10',
      });
    }

    const supportedFormats = PDFParserService.getSupportedFormats();
    const isValidType =
      supportedFormats.includes(file.type) ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!isValidType) {
      return t('fileUpload.errors.unsupportedFormat', {
        type: file.type || t('fileUpload.unknown'),
      });
    }

    if (file.size === 0) {
      return t('fileUpload.errors.emptyFile');
    }

    if (file.name.length > 255) {
      return t('fileUpload.errors.filenameTooLong');
    }

    return null;
  }, [t]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLocalError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      startProcessing();
      setCurrentFile(file);

      try {
        const parser = new PDFParserService(setParseProgress);
        const parsedContent = await parser.parseFile(file);
        setExtractedText(parsedContent.text, parsedContent.extractionMethod);
      } catch (error) {
        let errorMessageKey = 'fileUpload.errors.genericParseError';
        const errorArgs: { [key: string]: string } = {};

        if (error instanceof Error) {
          const errorText = error.message.toLowerCase();
          if (errorText.includes('file size'))
            errorMessageKey = 'fileUpload.errors.fileTooLarge';
          else if (errorText.includes('invalid file type'))
            errorMessageKey = 'fileUpload.errors.invalidFileType';
          else if (
            errorText.includes('direct extraction') &&
            errorText.includes('ocr')
          )
            errorMessageKey = 'fileUpload.errors.textExtractionFailed';
          else if (errorText.includes('memory') || errorText.includes('timeout'))
            errorMessageKey = 'fileUpload.errors.fileTooComplex';
          else if (
            errorText.includes('permission') ||
            errorText.includes('encrypted')
          )
            errorMessageKey = 'fileUpload.errors.pdfProtected';
          else {
            errorMessageKey = 'fileUpload.errors.parseErrorWithMessage';
            errorArgs.message = error.message;
          }
        }

        setLocalError(t(errorMessageKey, errorArgs));
        setCurrentFile(null);
      } finally {
        stopProcessing();
        setParseProgress(null);
      }
    },
    [
      setCurrentFile,
      setExtractedText,
      startProcessing,
      stopProcessing,
      t,
      validateFile,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isProcessing || isAnalyzing,
  });

  const handleStartAnalysis = async () => {
    if (!extractedText || !currentFile) return;

    try {
      startAnalysis();
      const adminConfigService = new AdminConfigService();
      const llmConfig = await adminConfigService.getLLMConfig();
      const promptConfig = await adminConfigService.getPromptConfig();

      const analysisService = new GeminiAnalysisService(
        setAnalysisProgress,
        updatePartialAnalysis
      );
      const result = await analysisService.analyzeScreenplay(
        extractedText,
        currentFile.name
      );
      setAnalysisResult(result);
    } catch (error) {
      let errorMessageKey = 'fileUpload.errors.genericAnalysisError';
       const errorArgs: { [key: string]: string } = {};

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        if (errorText.includes('api key'))
          errorMessageKey = 'fileUpload.errors.apiKeyError';
        else if (errorText.includes('quota') || errorText.includes('rate limit'))
          errorMessageKey = 'fileUpload.errors.quotaError';
        else if (errorText.includes('network') || errorText.includes('connection'))
          errorMessageKey = 'fileUpload.errors.networkError';
        else {
           errorMessageKey = 'fileUpload.errors.analysisErrorWithMessage';
           errorArgs.message = error.message;
        }
      }
      setAnalysisError(t(errorMessageKey, errorArgs));
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
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CloudUploadIcon />
          {t('fileUpload.title')}
        </Typography>

        {localError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setLocalError(null)}
          >
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
            <CloudUploadIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? t('fileUpload.dropzone.dropHere')
                : t('fileUpload.dropzone.dragAndDrop')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('fileUpload.dropzone.orClick')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('fileUpload.dropzone.supportedFormats', { maxSize: '10MB' })}
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
                    <Typography variant="subtitle1" noWrap>
                      {currentFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(currentFile.size / 1024 / 1024).toFixed(1)} MB
                    </Typography>
                  </Box>

                  {isProcessing && parseProgress && (
                    <Box sx={{ width: '100px' }}>
                      <Typography variant="caption">
                        {parseProgress.stage}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (parseProgress.current / parseProgress.total) * 100
                        }
                      />
                    </Box>
                  )}

                  {extractedText && extractionMethod && !isProcessing && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={t('fileUpload.parsedChip', {
                        method: extractionMethod,
                      })}
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
                    {t('fileUpload.buttons.remove')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {extractedText && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('fileUpload.preview.title')}
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
                fontSize: '0.8rem',
              }}
            >
              {extractedText.substring(0, 1000)}
              {extractedText.length > 1000 && '...'}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('fileUpload.preview.charCount', {
                count: extractedText.length.toLocaleString(),
                method: extractionMethod || t('fileUpload.unknown'),
              })}
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
            {isAnalyzing
              ? t('fileUpload.buttons.analyzing')
              : t('fileUpload.buttons.startAnalysis')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 