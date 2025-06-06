import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { ComprehensiveSafety, ProductionRisk, StuntCoordination } from '@/types/analysis';

interface SafetyDashboardProps {
  safety: ComprehensiveSafety;
  risks: ProductionRisk[];
  stunts: StuntCoordination;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ safety, risks, stunts }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dashboard Bezpieczeństwa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Poziom ryzyka: {safety?.overallAssessment?.overallRiskLevel || 'Nieznany'}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Ten komponent będzie zawierał kompletny dashboard bezpieczeństwa produkcji.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SafetyDashboard; 