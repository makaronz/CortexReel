import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { BudgetAnalysis } from '@/types/analysis';

interface BudgetBreakdownProps {
  budget: BudgetAnalysis;
}

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ budget }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analiza Budżetu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Złożoność budżetu: {budget?.overallComplexity || 'Nieznana'}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał szczegółową analizę budżetu produkcji.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetBreakdown; 