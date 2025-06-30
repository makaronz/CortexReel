import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingOverlayProps {
  loading: boolean;
}

/**
 * Displays a fullscreen backdrop with spinner while a boolean flag is true.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading }) => (
  <Backdrop open={loading} sx={{ zIndex: 1300 }}>
    <CircularProgress color="inherit" />
  </Backdrop>
);

export default LoadingOverlay;
