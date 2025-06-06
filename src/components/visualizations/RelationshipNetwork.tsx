import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CharacterRelationship } from '@/types/analysis';

interface RelationshipNetworkProps {
  relationships: CharacterRelationship[];
}

const RelationshipNetwork: React.FC<RelationshipNetworkProps> = ({ relationships: _relationships }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sieć Relacji Postaci
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Wizualizacja relacji między postaciami.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał interaktywną sieć relacji między postaciami.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RelationshipNetwork; 