import React from 'react';
import { ProductionRisk } from '@/types/analysis';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';

interface SafetyRiskMatrixProps {
  risks: ProductionRisk[];
}

const LIKELIHOOD_LABELS = ['Very Unlikely', 'Unlikely', 'Possible', 'Likely', 'Very Likely'];
const SEVERITY_LABELS = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

const getRiskColor = (likelihood: number, severity: number): string => {
  const riskScore = likelihood * severity;
  if (riskScore >= 15) return '#d32f2f'; // Red
  if (riskScore >= 10) return '#f57c00'; // Orange
  if (riskScore >= 5) return '#fbc02d'; // Yellow
  return '#388e3c'; // Green
};

const SafetyRiskMatrix: React.FC<SafetyRiskMatrixProps> = ({ risks }) => {
  const matrix = Array(5)
    .fill(0)
    .map(() => Array(5).fill(0).map(() => [] as ProductionRisk[]));

  risks.forEach(risk => {
    if (risk.likelihood >= 1 && risk.likelihood <= 5 && risk.severity >= 1 && risk.severity <= 5) {
      matrix[5 - risk.likelihood][risk.severity - 1].push(risk);
    }
  });

  const handleCellClick = (risksInCell: ProductionRisk[]) => {
    console.log('Risks in this cell:', risksInCell);
    // Here you could trigger a modal to show the details
  };

  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Safety Risk Matrix
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #424242' }}>Likelihood</TableCell>
              {SEVERITY_LABELS.map((label, index) => (
                <TableCell key={index} align="center" sx={{ fontWeight: 'bold', border: '1px solid #424242' }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {LIKELIHOOD_LABELS.map((label, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: '1px solid #424242' }}>
                  {label}
                </TableCell>
                {matrix[rowIndex].map((risksInCell, colIndex) => (
                  <Tooltip key={colIndex} title={`${risksInCell.length} risk(s)`} placement="top">
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #424242',
                        backgroundColor: getRiskColor(5 - rowIndex, colIndex + 1),
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        '&:hover': {
                          filter: 'brightness(1.2)',
                        },
                      }}
                      onClick={() => handleCellClick(risksInCell)}
                    >
                      {risksInCell.length > 0 ? risksInCell.length : '-'}
                    </TableCell>
                  </Tooltip>
                ))}
              </TableRow>
            )).reverse()}
          </TableBody>
        </Table>
      </TableContainer>
       <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
        <Box display="flex" alignItems="center">
          <Box width={20} height={20} bgcolor="#388e3c" mr={1} />
          <Typography variant="caption">Low</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width={20} height={20} bgcolor="#fbc02d" mr={1} />
          <Typography variant="caption">Medium</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width={20} height={20} bgcolor="#f57c00" mr={1} />
          <Typography variant="caption">High</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width={20} height={20} bgcolor="#d32f2f" mr={1} />
          <Typography variant="caption">Extreme</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SafetyRiskMatrix; 