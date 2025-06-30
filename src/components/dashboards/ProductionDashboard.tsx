import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  ResourcePlanning,
  EquipmentRequirement,
  ProductionChecklist,
} from '@/types/analysis';

interface ProductionDashboardProps {
  resources: ResourcePlanning;
  equipment: EquipmentRequirement[];
  checklist: ProductionChecklist;
}

const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  resources: _resources,
  equipment: _equipment,
  checklist: _checklist,
}) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('productionDashboard.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('productionDashboard.subtitle')}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t('productionDashboard.placeholder')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductionDashboard; 