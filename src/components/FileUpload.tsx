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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLocalError(null);
    startProcessing();
    setCurrentFile(file);

    try {
      const parser = new PDFParserService(setParseProgress);
      const parsedContent = await parser.parseFile(file);
      setExtractedText(parsedContent.text, parsedContent.extractionMethod);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
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
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing || isAnalyzing,
  });

  const handleStartAnalysis = async () => {
    if (!extractedText || !currentFile) return;

    try {
      startAnalysis();
      const analysisService = new GeminiAnalysisService();
      const result = await analysisService.analyzeScreenplay(
        extractedText,
        currentFile.name,
        setAnalysisProgress
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
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