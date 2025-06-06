import React, { useState } from 'react';
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
  TableRow
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Landscape as LandscapeIcon,
  Business as BusinessIcon,
  DirectionsCar as TransportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalAtm as CostIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  LocalParking as ParkingIcon,
  ElectricalServices as PowerIcon,
  WbCloudy as WeatherIcon
} from '@mui/icons-material';
import { LocationDetail } from '@/types/analysis';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';

interface LocationVisualizationProps {
  locations: LocationDetail[];
}

const LocationVisualization: React.FC<LocationVisualizationProps> = ({ locations }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);

  // Funkcje pomocnicze - definicje na górze przed użyciem
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

  // Filtrowanie lokacji
  const filteredLocations = locations.filter(location => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'interior') return location.type === 'INTERIOR';
    if (selectedFilter === 'exterior') return location.type === 'EXTERIOR';
    if (selectedFilter === 'permits') return location.requiresPermit;
    if (selectedFilter === 'high-cost') return location.baseRentalCost === 'HIGH' || location.baseRentalCost === 'VERY_HIGH';
    if (selectedFilter === 'difficult') return location.accessibility === 'DIFFICULT';
    return true;
  });

  // Statystyki
  const interiorCount = locations.filter(l => l.type === 'INTERIOR').length;
  const exteriorCount = locations.filter(l => l.type === 'EXTERIOR').length;
  const mixedCount = locations.filter(l => l.type === 'MIXED').length;
  const permitsRequired = locations.filter(l => l.requiresPermit).length;
  const highCostLocations = locations.filter(l => l.baseRentalCost === 'HIGH' || l.baseRentalCost === 'VERY_HIGH').length;
  const difficultAccess = locations.filter(l => l.accessibility === 'DIFFICULT').length;

  // Dane dla wykresów
  const typeDistributionData = [
    { name: 'Wnętrza', value: interiorCount, color: '#2563eb' },
    { name: 'Zewnętrzne', value: exteriorCount, color: '#059669' },
    { name: 'Mieszane', value: mixedCount, color: '#d97706' }
  ];

  const categoryDistributionData = [
    { name: 'Mieszkalne', value: locations.filter(l => l.category === 'RESIDENTIAL').length, color: '#2563eb' },
    { name: 'Komercyjne', value: locations.filter(l => l.category === 'COMMERCIAL').length, color: '#059669' },
    { name: 'Przemysłowe', value: locations.filter(l => l.category === 'INDUSTRIAL').length, color: '#dc2626' },
    { name: 'Naturalne', value: locations.filter(l => l.category === 'NATURAL').length, color: '#10b981' },
    { name: 'Transport', value: locations.filter(l => l.category === 'TRANSPORTATION').length, color: '#f59e0b' },
    { name: 'Instytucjonalne', value: locations.filter(l => l.category === 'INSTITUTIONAL').length, color: '#8b5cf6' },
    { name: 'Inne', value: locations.filter(l => l.category === 'OTHER').length, color: '#6b7280' }
  ].filter(item => item.value > 0);

  const costVsAccessibilityData = locations.map(location => ({
    name: location.name,
    cost: getCostValue(location.baseRentalCost),
    accessibility: getAccessibilityValue(location.accessibility),
    scenes: location.scenes.length,
    permits: location.requiresPermit ? 1 : 0
  }));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INTERIOR': return '#2563eb';
      case 'EXTERIOR': return '#059669';
      case 'MIXED': return '#d97706';
      default: return '#9ca3af';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INTERIOR': return 'Wnętrze';
      case 'EXTERIOR': return 'Zewnętrzne';
      case 'MIXED': return 'Mieszane';
      default: return type;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'RESIDENTIAL': return 'Mieszkalne';
      case 'COMMERCIAL': return 'Komercyjne';
      case 'INDUSTRIAL': return 'Przemysłowe';
      case 'NATURAL': return 'Naturalne';
      case 'TRANSPORTATION': return 'Transport';
      case 'INSTITUTIONAL': return 'Instytucjonalne';
      case 'OTHER': return 'Inne';
      default: return category;
    }
  };

  const getCostName = (cost: string) => {
    switch (cost) {
      case 'LOW': return 'Niski';
      case 'MEDIUM': return 'Średni';
      case 'HIGH': return 'Wysoki';
      case 'VERY_HIGH': return 'Bardzo wysoki';
      default: return cost;
    }
  };

  const getAccessibilityName = (accessibility: string) => {
    switch (accessibility) {
      case 'EASY': return 'Łatwy';
      case 'MODERATE': return 'Umiarkowany';
      case 'DIFFICULT': return 'Trudny';
      default: return accessibility;
    }
  };

  const getWeatherDependencyName = (weather: string) => {
    switch (weather) {
      case 'NONE': return 'Brak';
      case 'LOW': return 'Niska';
      case 'HIGH': return 'Wysoka';
      default: return weather;
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
    setSelectedLocation(selectedLocation?.id === location.id ? null : location);
  };

  return (
    <Grid container spacing={3}>
      {/* Statystyki główne */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {locations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Łączna liczba lokacji
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {interiorCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wnętrza
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {exteriorCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zewnętrzne
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {permitsRequired}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wymagają pozwoleń
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {highCostLocations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wysokie koszty
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="text.secondary" fontWeight="bold">
                  {difficultAccess}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trudny dostęp
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtrowanie */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Filtruj lokacje</InputLabel>
          <Select
            value={selectedFilter}
            label="Filtruj lokacje"
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="all">Wszystkie lokacje ({locations.length})</MenuItem>
            <MenuItem value="interior">
              <Stack direction="row" alignItems="center" spacing={1}>
                <HomeIcon fontSize="small" color="primary" />
                <span>Wnętrza ({interiorCount})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="exterior">
              <Stack direction="row" alignItems="center" spacing={1}>
                <LandscapeIcon fontSize="small" color="success" />
                <span>Zewnętrzne ({exteriorCount})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="permits">
              <Stack direction="row" alignItems="center" spacing={1}>
                <SecurityIcon fontSize="small" color="warning" />
                <span>Wymagają pozwoleń ({permitsRequired})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="high-cost">
              <Stack direction="row" alignItems="center" spacing={1}>
                <CostIcon fontSize="small" color="error" />
                <span>Wysokie koszty ({highCostLocations})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="difficult">
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningIcon fontSize="small" color="error" />
                <span>Trudny dostęp ({difficultAccess})</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Podsumowanie lokacji
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Filtrowane lokacje:</Typography>
              <Typography variant="h6">{filteredLocations.length}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Średnio scen na lokację:</Typography>
              <Typography variant="h6">
                {Math.round(locations.reduce((acc, loc) => acc + loc.scenes.length, 0) / locations.length)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Wykres typu lokacji */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rozkład Typów Lokacji
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Wykres kategorii lokacji */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kategorie Lokacji
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Wykres koszt vs dostępność */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analiza Koszt vs Dostępność Lokacji
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={costVsAccessibilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="accessibility" 
                  domain={[0, 4]} 
                  tickFormatter={(value) => {
                    switch(value) {
                      case 1: return 'Łatwy';
                      case 2: return 'Umiarkowany';
                      case 3: return 'Trudny';
                      default: return '';
                    }
                  }}
                />
                <YAxis 
                  dataKey="cost" 
                  domain={[0, 5]}
                  tickFormatter={(value) => {
                    switch(value) {
                      case 1: return 'Niski';
                      case 2: return 'Średni';
                      case 3: return 'Wysoki';
                      case 4: return 'Bardzo wysoki';
                      default: return '';
                    }
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'cost') return [getCostName(value.toString()), 'Koszt'];
                    if (name === 'accessibility') return [getAccessibilityName(value.toString()), 'Dostępność'];
                    if (name === 'scenes') return [value, 'Liczba scen'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Lokacja: ${label}`}
                />
                <Scatter dataKey="cost" fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Lista lokacji */}
      <Grid item xs={12} md={selectedLocation ? 8 : 12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lista Lokacji ({filteredLocations.length})
            </Typography>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <List>
                {filteredLocations.map((location) => (
                  <Box key={location.id}>
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor: selectedLocation?.id === location.id ? 'primary.main' : 'grey.200',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: selectedLocation?.id === location.id ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getTypeColor(location.type),
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {location.type === 'INTERIOR' ? <HomeIcon /> : 
                         location.type === 'EXTERIOR' ? <LandscapeIcon /> : 
                         <BusinessIcon />}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {location.name}
                            </Typography>
                            <Chip
                              label={getTypeName(location.type)}
                              size="small"
                              sx={{ bgcolor: getTypeColor(location.type), color: 'white' }}
                            />
                            <Chip
                              label={getCategoryName(location.category)}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {location.description || 'Brak opisu'}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {location.scenes.length} scen
                              </Typography>
                              <Chip
                                label={getCostName(location.baseRentalCost)}
                                size="small"
                                color={getCostColor(location.baseRentalCost)}
                                variant="outlined"
                              />
                              <Chip
                                label={getAccessibilityName(location.accessibility)}
                                size="small"
                                color={getAccessibilityColor(location.accessibility)}
                                variant="outlined"
                              />
                              {location.requiresPermit && (
                                <Chip label="Pozwolenie" size="small" color="warning" />
                              )}
                            </Stack>
                          </Box>
                        }
                      />
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        toggleLocationExpansion(location.id);
                      }}>
                        {expandedLocation === location.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </ListItem>

                    <Collapse in={expandedLocation === location.id}>
                      <Card variant="outlined" sx={{ ml: 2, mb: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Szczegóły lokacji
                          </Typography>

                          <Grid container spacing={2}>
                            {/* Podstawowe informacje */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Informacje podstawowe:
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                  <strong>Typ pozwolenia:</strong> {location.permitType || 'Nie wymagane'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Zależność od pogody:</strong> {getWeatherDependencyName(location.weatherDependency)}
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Udogodnienia */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Udogodnienia:
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                                {location.powerAvailable && (
                                  <Chip icon={<PowerIcon />} label="Zasilanie" size="small" color="success" />
                                )}
                                {location.parkingAvailable && (
                                  <Chip icon={<ParkingIcon />} label="Parking" size="small" color="primary" />
                                )}
                                {!location.powerAvailable && !location.parkingAvailable && (
                                  <Typography variant="body2" color="text.secondary">
                                    Brak dodatkowych udogodnień
                                  </Typography>
                                )}
                              </Stack>
                            </Grid>

                            {/* Sceny w lokacji */}
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Sceny w tej lokacji:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                {location.scenes.map((sceneNumber, index) => (
                                  <Chip 
                                    key={index}
                                    label={`Scena ${sceneNumber}`} 
                                    size="small" 
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))}
                              </Stack>
                            </Grid>

                            {/* Wymagania specjalne */}
                            {location.specialRequirements && location.specialRequirements.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                  Wymagania specjalne:
                                </Typography>
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                  {location.specialRequirements.map((requirement, index) => (
                                    <Chip 
                                      key={index}
                                      label={requirement} 
                                      size="small" 
                                      color="warning"
                                      variant="outlined"
                                    />
                                  ))}
                                </Stack>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Panel wybranej lokacji */}
      {selectedLocation && (
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: getTypeColor(selectedLocation.type),
                    width: 56,
                    height: 56
                  }}
                >
                  {selectedLocation.type === 'INTERIOR' ? <HomeIcon /> : 
                   selectedLocation.type === 'EXTERIOR' ? <LandscapeIcon /> : 
                   <BusinessIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedLocation.name}</Typography>
                  <Chip
                    label={getTypeName(selectedLocation.type)}
                    size="small"
                    sx={{ bgcolor: getTypeColor(selectedLocation.type), color: 'white' }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Informacje szczegółowe */}
              <Typography variant="subtitle2" gutterBottom>
                Informacje szczegółowe
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th">Kategoria:</TableCell>
                      <TableCell>{getCategoryName(selectedLocation.category)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Liczba scen:</TableCell>
                      <TableCell>{selectedLocation.scenes.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Koszt wynajmu:</TableCell>
                      <TableCell>
                        <Chip 
                          label={getCostName(selectedLocation.baseRentalCost)}
                          size="small"
                          color={getCostColor(selectedLocation.baseRentalCost)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Dostępność:</TableCell>
                      <TableCell>
                        <Chip 
                          label={getAccessibilityName(selectedLocation.accessibility)}
                          size="small"
                          color={getAccessibilityColor(selectedLocation.accessibility)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Pozwolenie:</TableCell>
                      <TableCell>
                        {selectedLocation.requiresPermit ? (
                          <Chip label="Wymagane" size="small" color="warning" />
                        ) : (
                          <Chip label="Nie wymagane" size="small" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">Pogoda:</TableCell>
                      <TableCell>{getWeatherDependencyName(selectedLocation.weatherDependency)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Udogodnienia */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Dostępne udogodnienia
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PowerIcon color={selectedLocation.powerAvailable ? 'success' : 'disabled'} />
                      <Typography variant="body2" color={selectedLocation.powerAvailable ? 'success.main' : 'text.disabled'}>
                        Zasilanie
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ParkingIcon color={selectedLocation.parkingAvailable ? 'primary' : 'disabled'} />
                      <Typography variant="body2" color={selectedLocation.parkingAvailable ? 'primary.main' : 'text.disabled'}>
                        Parking
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              {/* Analiza ryzyka */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Analiza ryzyka lokacji
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption">Ryzyko kosztowe:</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getCostValue(selectedLocation.baseRentalCost) * 25}
                      color={getCostColor(selectedLocation.baseRentalCost)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption">Trudność dostępu:</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getAccessibilityValue(selectedLocation.accessibility) * 33.33}
                      color={getAccessibilityColor(selectedLocation.accessibility)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  {selectedLocation.weatherDependency === 'HIGH' && (
                    <Box>
                      <Typography variant="caption">Zależność od pogody:</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={100}
                        color="warning"
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default LocationVisualization; 