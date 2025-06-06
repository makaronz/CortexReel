import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { LocationDetail } from '@/types/analysis';

interface LocationVisualizationProps {
  locations: LocationDetail[];
}

const LocationVisualization: React.FC<LocationVisualizationProps> = ({ locations }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wizualizacja Lokacji
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Znaleziono {locations?.length || 0} lokacji do analizy.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał szczegółową wizualizację wszystkich lokacji scenariusza.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationVisualization; 