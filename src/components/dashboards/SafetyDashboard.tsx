import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  ComprehensiveSafety,
  ProductionRisk,
  StuntCoordination,
} from '@/types/analysis';

interface SafetyDashboardProps {
  safety: ComprehensiveSafety;
  risks: ProductionRisk[];
  stunts: StuntCoordination;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({
  safety,
  risks,
  stunts,
}) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('safetyDashboard.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('safetyDashboard.riskLevel', {
            level:
              safety?.overallAssessment?.overallRiskLevel ||
              t('safetyDashboard.unknown'),
          })}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t('safetyDashboard.placeholder')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SafetyDashboard; 