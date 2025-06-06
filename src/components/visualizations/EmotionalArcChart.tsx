import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { EmotionalArcData } from '@/types/analysis';

interface EmotionalArcChartProps {
  emotionalArcs: EmotionalArcData;
}

const EmotionalArcChart: React.FC<EmotionalArcChartProps> = ({ emotionalArcs }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wykres Łuku Emocjonalnego
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analiza emocjonalna scenariusza.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał wykres łuku emocjonalnego całego scenariusza.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmotionalArcChart; 