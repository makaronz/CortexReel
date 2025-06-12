import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  LinearProgress, 
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { useAnalysisProgress, useIsAnalyzing } from '@/store/analysisStore';

const ProgressBar: React.FC = () => {
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
            Analyzing Screenplay
          </Typography>
          <Chip 
            label={`${progress.sectionsComplete}/${progress.totalSections} sections`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`${timeRemaining}s remaining`}
            color="secondary"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current: {progress.currentSection}
        </Typography>

        <LinearProgress 
          variant="determinate" 
          value={progress.percentage}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 1
          }}
        />

        <Typography variant="caption" color="text.secondary">
          {progress.percentage}% complete
        </Typography>

        {progress.errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="error">
              {progress.errors.length} error(s) encountered
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressBar; 