import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';
import { Chart } from 'react-google-charts';
import { BudgetAnalysis } from '@/types/analysis';

interface BudgetBreakdownProps {
  budget?: BudgetAnalysis;
}

const getPriorityChipColor = (
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
) => {
  switch (priority) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
    default:
      return 'success';
  }
};

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ budget }) => {
  const { t, i18n } = useTranslation();

  if (!budget) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">{t('budgetBreakdown.title')}</Typography>
        <Typography>{t('budgetBreakdown.waiting')}</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }

  const chartData = useMemo(() => {
    if (!budget || !budget.costDrivers)
      return [[t('budgetBreakdown.chart.driver'), t('budgetBreakdown.chart.count')]];
    const counts = budget.costDrivers.reduce((acc, driver) => {
      acc[driver] = (acc[driver] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [[t('budgetBreakdown.chart.driver'), t('budgetBreakdown.chart.count')], ...Object.entries(counts)];
  }, [budget, t]);

  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h5" gutterBottom>
        {t('budgetBreakdown.title')}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">
            {t('budgetBreakdown.overallComplexity')}:{' '}
            <strong>{budget.overallComplexity}</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          {budget.targetBudget && (
            <Typography variant="subtitle1" align="right">
              {t('budgetBreakdown.targetBudget')}:{' '}
              <strong>
                {new Intl.NumberFormat(i18n.language, {
                  style: 'currency',
                  currency: budget.currency || 'USD',
                }).format(budget.targetBudget)}
              </strong>
            </Typography>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>
            {t('budgetBreakdown.costDrivers')}
          </Typography>
          <Chart
            chartType="PieChart"
            data={chartData}
            options={{
              title: t('budgetBreakdown.chart.title'),
              pieHole: 0.4,
              is3D: false,
              backgroundColor: 'transparent',
              legend: { textStyle: { color: '#ffffff' } },
              titleTextStyle: { color: '#ffffff' },
            }}
            width="100%"
            height="300px"
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" gutterBottom>
            {t('budgetBreakdown.budgetFlags')}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('budgetBreakdown.table.category')}</TableCell>
                  <TableCell>{t('budgetBreakdown.table.description')}</TableCell>
                  <TableCell>{t('budgetBreakdown.table.estimatedCost')}</TableCell>
                  <TableCell>{t('budgetBreakdown.table.priority')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budget.flags.map((flag, index) => (
                  <TableRow key={index}>
                    <TableCell>{flag.category}</TableCell>
                    <TableCell>{flag.description}</TableCell>
                    <TableCell>{flag.estimatedCost}</TableCell>
                    <TableCell>
                      <Chip
                        label={flag.priority}
                        color={getPriorityChipColor(flag.priority)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BudgetBreakdown; 