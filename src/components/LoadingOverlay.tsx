import React from 'react';
import { useTranslation } from 'react-i18next';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading, message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('loadingOverlay.default');

  return (
    <Backdrop open={loading} sx={{ zIndex: 1300, color: '#fff' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress color="inherit" />
        {displayMessage && (
          <Typography sx={{ mt: 2 }}>{displayMessage}</Typography>
        )}
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
