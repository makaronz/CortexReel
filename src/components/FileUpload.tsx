import React, { useCallback, useState } from 'react';
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
  Error as ErrorIcon
} from '@mui/icons-material';

import { useAnalysisStore, useFileProcessing, useIsAnalyzing } from '@/store/analysisStore';
import { PDFParserService } from '@/services/pdfParser';
import { GeminiAnalysisService } from '@/services/geminiService';

const FileUpload: React.FC = () => {
  const { 
    currentFile, 
    extractedText, 
    extractionMethod,
    setCurrentFile, 
    setExtractedText 
  } = useFileProcessing();
  
  const { 
    startAnalysis, 
    setAnalysisProgress, 
    setAnalysisResult, 
    setAnalysisError 
  } = useAnalysisStore();
  
  const isAnalyzing = useIsAnalyzing();
  
  // Local state
  const [parseProgress, setParseProgress] = useState<{
    current: number;
    total: number;
    stage: string;
  } | null>(null);
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // File drop handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setParseError(null);
      setCurrentFile(file);
      
      // Start PDF parsing
      const parser = new PDFParserService((progress) => {
        setParseProgress(progress);
      });
      
      const parsedContent = await parser.parseFile(file);
      
      // Set extracted text
      setExtractedText(parsedContent.text, parsedContent.extractionMethod);
      setParseProgress(null);
      
    } catch (error) {
      console.error('File parsing error:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse file');
      setParseProgress(null);
    }
  }, [setCurrentFile, setExtractedText]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isAnalyzing || !!parseProgress,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onError: (error) => {
      setParseError(error.message);
      setIsDragActive(false);
    }
  });

  // Start analysis handler
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon />
          Upload Screenplay
        </Typography>

        {/* Error Display */}
        {parseError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setParseError(null)}>
            {parseError}
          </Alert>
        )}

        {/* File Upload Area */}
        {!currentFile && (
          <Box
            {...getRootProps()}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: isDragActive || dropzoneActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive || dropzoneActive ? 'action.hover' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive || dropzoneActive ? 'Drop the file here' : 'Drag & drop a PDF screenplay'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports PDF files up to 10MB
            </Typography>
          </Box>
        )}

        {/* File Info */}
        {currentFile && (
          <Box sx={{ mb: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <DescriptionIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{currentFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(currentFile.size / 1024 / 1024).toFixed(1)} MB
                    </Typography>
                  </Box>
                  
                  {extractedText && extractionMethod && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`Extracted (${extractionMethod})`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setCurrentFile(null);
                      setExtractedText('', 'DIRECT');
                      setParseError(null);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Parse Progress */}
        {parseProgress && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {parseProgress.stage}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(parseProgress.current / parseProgress.total) * 100}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {parseProgress.current}/{parseProgress.total}
            </Typography>
          </Box>
        )}

        {/* Text Preview */}
        {extractedText && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Extracted Text Preview:
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.50',
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
                p: 2,
                maxHeight: 200,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {extractedText.substring(0, 500)}
              {extractedText.length > 500 && '...'}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {extractedText.length} characters extracted
              {extractionMethod && ` using ${extractionMethod} method`}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleStartAnalysis}
            disabled={!extractedText || isAnalyzing || !!parseProgress}
            sx={{ minWidth: 200 }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis (27 Sections)'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FileUpload; 