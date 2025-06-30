import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Paper,
  Divider,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Home as HomeIcon,
  Landscape as LandscapeIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalAtm as CostIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  LocalParking as ParkingIcon,
  ElectricalServices as PowerIcon,
} from '@mui/icons-material';
import { LocationDetail } from '@/types/analysis';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface LocationVisualizationProps {
  locations: LocationDetail[];
}

const LocationVisualization: React.FC<LocationVisualizationProps> = ({
  locations,
}) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetail | null>(null);

  if (!locations) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            {t('locationVisualization.title')}
          </Typography>
          <Typography color="text.secondary">
            {t('locationVisualization.waiting')}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const getCostValue = (cost: string) => {
    switch (cost) {
      case 'LOW': return 1;
      case 'MEDIUM': return 2;
      case 'HIGH': return 3;
      case 'VERY_HIGH': return 4;
      default: return 0;
    }
  };

  const getAccessibilityValue = (accessibility: string) => {
    switch (accessibility) {
      case 'EASY': return 1;
      case 'MODERATE': return 2;
      case 'DIFFICULT': return 3;
      default: return 0;
    }
  };

  const filteredLocations = locations.filter((location) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'interior') return location.type === 'INTERIOR';
    if (selectedFilter === 'exterior') return location.type === 'EXTERIOR';
    if (selectedFilter === 'permits') return location.requiresPermit;
    if (selectedFilter === 'high-cost')
      return (
        location.baseRentalCost === 'HIGH' ||
        location.baseRentalCost === 'VERY_HIGH'
      );
    if (selectedFilter === 'difficult')
      return location.accessibility === 'DIFFICULT';
    return true;
  });

  const interiorCount = locations.filter((l) => l.type === 'INTERIOR').length;
  const exteriorCount = locations.filter((l) => l.type === 'EXTERIOR').length;
  const mixedCount = locations.filter((l) => l.type === 'MIXED').length;
  const permitsRequired = locations.filter((l) => l.requiresPermit).length;
  const highCostLocations = locations.filter(
    (l) => l.baseRentalCost === 'HIGH' || l.baseRentalCost === 'VERY_HIGH'
  ).length;
  const difficultAccess = locations.filter(
    (l) => l.accessibility === 'DIFFICULT'
  ).length;

  const typeDistributionData = [
    { name: t('locationVisualization.types.interior'), value: interiorCount, color: '#2563eb' },
    { name: t('locationVisualization.types.exterior'), value: exteriorCount, color: '#059669' },
    { name: t('locationVisualization.types.mixed'), value: mixedCount, color: '#d97706' },
  ];

  const categoryDistributionData = Object.entries(
    locations.reduce((acc, loc) => {
      const category = t(`locationVisualization.categories.${loc.category}`, loc.category);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const costVsAccessibilityData = locations.map((location) => ({
    name: location.name,
    cost: getCostValue(location.baseRentalCost),
    accessibility: getAccessibilityValue(location.accessibility),
    scenes: location.scenes?.length || 0,
    permits: location.requiresPermit ? 1 : 0,
  }));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INTERIOR': return '#2563eb';
      case 'EXTERIOR': return '#059669';
      case 'MIXED': return '#d97706';
      default: return '#9ca3af';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'VERY_HIGH': return 'error';
      default: return 'primary';
    }
  };

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case 'EASY': return 'success';
      case 'MODERATE': return 'warning';
      case 'DIFFICULT': return 'error';
      default: return 'primary';
    }
  };

  const toggleLocationExpansion = (locationId: string) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  const handleLocationSelect = (location: LocationDetail) => {
    setSelectedLocation(
      selectedLocation?.id === location.id ? null : location
    );
  };

  return (
    <Grid container spacing={3}>
        {/* ... (stats and filters with t() function) ... */}
    </Grid>
  );
};

export default LocationVisualization; 