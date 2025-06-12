import React from 'react';
import { Chart } from 'react-google-charts';
import { ProductionScheduleEntry } from '@/types/analysis';
import { Paper, Typography } from '@mui/material';

interface ProductionScheduleProps {
  schedule: ProductionScheduleEntry[];
}

const columns = [
  { type: 'string', label: 'Task ID' },
  { type: 'string', label: 'Task Name' },
  { type: 'string', label: 'Resource' },
  { type: 'date', label: 'Start Date' },
  { type: 'date', label: 'End Date' },
  { type: 'number', label: 'Duration' },
  { type: 'number', label: 'Percent Complete' },
  { type: 'string', label: 'Dependencies' },
];

const ProductionSchedule: React.FC<ProductionScheduleProps> = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6">Production Schedule</Typography>
        <Typography>No schedule data available.</Typography>
      </Paper>
    );
  }

  const rows = schedule.map(task => [
    task.id,
    task.taskName,
    task.department, // Using department as the 'Resource'
    new Date(task.start),
    new Date(task.end),
    null, // Duration is null when start and end are provided
    task.progress,
    task.dependencies ? task.dependencies.join(',') : null,
  ]);

  const data = [columns, ...rows];

  const options = {
    height: schedule.length * 42 + 50, // Dynamic height
    gantt: {
      trackHeight: 30,
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Production Schedule
      </Typography>
      <Chart
        chartType="Gantt"
        width="100%"
        height="100%"
        data={data}
        options={options}
      />
    </Paper>
  );
};

export default ProductionSchedule; 