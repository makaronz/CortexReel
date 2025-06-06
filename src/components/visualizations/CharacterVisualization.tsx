import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CharacterDetail } from '@/types/analysis';

interface CharacterVisualizationProps {
  characters: CharacterDetail[];
}

const CharacterVisualization: React.FC<CharacterVisualizationProps> = ({ characters }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wizualizacja Postaci
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Znaleziono {characters?.length || 0} postaci do analizy.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał szczegółową wizualizację wszystkich postaci scenariusza.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CharacterVisualization; 