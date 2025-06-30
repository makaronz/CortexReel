import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useAnalysisProgress, useIsAnalyzing } from '@/store/analysisStore';

const ProgressBar: React.FC = () => {
  const { t } = useTranslation();
  const isAnalyzing = useIsAnalyzing();
  const progress = useAnalysisProgress();

  if (!isAnalyzing || !progress) {
    return null;
  }

  const timeRemaining = Math.ceil(progress.estimatedTimeRemaining / 1000);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('progressBar.title')}
          </Typography>
          <Chip
            label={t('progressBar.sections', {
              complete: progress.sectionsComplete,
              total: progress.totalSections,
            })}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={t('progressBar.remaining', { time: timeRemaining })}
            color="secondary"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('progressBar.current')}: {progress.currentSection}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 1,
          }}
        />

        <Typography variant="caption" color="text.secondary">
          {t('progressBar.complete', { percentage: progress.percentage })}
        </Typography>

        {progress.errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="error">
              {t('progressBar.errors', { count: progress.errors.length })}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressBar; 