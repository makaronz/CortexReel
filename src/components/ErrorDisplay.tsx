import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAnalysisError, useAnalysisStore } from '@/store/analysisStore';

const ErrorDisplay: React.FC = () => {
  const error = useAnalysisError();
  const { setAnalysisError } = useAnalysisStore();

  if (!error) {
    return null;
  }

  const handleDismiss = () => {
    setAnalysisError(null);
  };

  const handleRetry = () => {
    setAnalysisError(null);
    // Could add retry logic here
  };

  return (
    <Alert 
      severity="error" 
      sx={{ mb: 2 }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            size="small"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </Box>
      }
    >
      <AlertTitle>Analysis Error</AlertTitle>
      {error}
    </Alert>
  );
};

export default ErrorDisplay; 