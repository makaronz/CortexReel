import React, { useMemo, useState } from 'react';
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
  IconButton,
  Collapse,
  Chip,
  LinearProgress,
} from '@mui/material';
import { EquipmentRequirement } from '@/types/analysis';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface TechnicalRequirementsProps {
  equipment: EquipmentRequirement[];
}

const LONG_LEAD_TIME_THRESHOLD = 14; // days

const Row: React.FC<{ category: string; items: EquipmentRequirement[] }> = ({ category, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="h6">{category}</Typography>
        </TableCell>
        <TableCell align="right">
            <Chip label={`${items.length} items`} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Rental Duration</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>
                        {item.leadTimeDays && item.leadTimeDays > LONG_LEAD_TIME_THRESHOLD && (
                          <Chip label={`Long Lead Time (${item.leadTimeDays} days)`} color="error" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};


const TechnicalRequirements: React.FC<TechnicalRequirementsProps> = ({ equipment }) => {
    
  if (!equipment) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Technical Requirements</Typography>
        <Typography>Waiting for equipment data...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Paper>
    );
  }

  const groupedEquipment = useMemo(() => {
    if (!equipment) return {};
    return equipment.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, EquipmentRequirement[]>);
  }, [equipment]);

  if (!equipment || equipment.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Technical Requirements</Typography>
        <Typography>No equipment data available.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>Technical Requirements</Typography>
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(groupedEquipment).map(([category, items]) => (
                        <Row key={category} category={category} items={items} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
};

export default TechnicalRequirements; 