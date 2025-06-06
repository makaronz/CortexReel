import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { CompleteAnalysis, FilmRole } from '@/types/analysis';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewDashboardProps {
  analysis: CompleteAnalysis;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ analysis }) => {
  // Oblicz kluczowe metryki
  const totalScenes = analysis.scenes?.length || 0;
  const totalCharacters = analysis.characters?.length || 0;
  const totalLocations = analysis.locations?.length || 0;
  const estimatedDuration = analysis.scenes?.reduce((acc, scene) => acc + (scene.estimatedDuration || 0), 0) || 0;
  
  // Ryzyko produkcyjne
  const highRisks = analysis.risks?.filter(risk => risk.impact === 'HIGH' || risk.impact === 'CRITICAL').length || 0;
  const safetyLevel = analysis.safety?.overallAssessment?.overallRiskLevel || 'UNKNOWN';
  
  // Dane dla wykresów
  const sceneComplexityData = [
    { name: 'Proste', value: analysis.scenes?.filter(s => s.complexity === 'LOW').length || 0, color: '#4caf50' },
    { name: 'Średnie', value: analysis.scenes?.filter(s => s.complexity === 'MEDIUM').length || 0, color: '#ff9800' },
    { name: 'Złożone', value: analysis.scenes?.filter(s => s.complexity === 'HIGH').length || 0, color: '#f44336' }
  ];

  const locationTypeData = [
    { name: 'Wnętrza', value: analysis.locations?.filter(l => l.type === 'INTERIOR').length || 0 },
    { name: 'Zewnętrzne', value: analysis.locations?.filter(l => l.type === 'EXTERIOR').length || 0 },
    { name: 'Mieszane', value: analysis.locations?.filter(l => l.type === 'MIXED').length || 0 }
  ];

  // Najważniejsze ryzyka
  const topRisks = analysis.risks?.filter(risk => risk.impact === 'HIGH' || risk.impact === 'CRITICAL').slice(0, 5) || [];
  
  // Główne postacie
  const mainCharacters = analysis.characters?.filter(char => char.role === 'PROTAGONIST' || char.role === 'ANTAGONIST').slice(0, 5) || [];

  return (
    <Grid container spacing={3}>
      {/* Statystyki główne */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {/* Sceny */}
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalScenes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sceny ({Math.round(estimatedDuration)} min)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Postacie */}
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalCharacters}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Postacie
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Lokacje */}
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <LocationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalLocations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lokacje
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Bezpieczeństwo */}
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: safetyLevel === 'LOW' ? 'success.main' : 
                             safetyLevel === 'MEDIUM' ? 'warning.main' : 'error.main' 
                  }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {highRisks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Wysokie ryzyka
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Wykresy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Złożoność Scen
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sceneComplexityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sceneComplexityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Typy Lokacji
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Główne ryzyka */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Najważniejsze Ryzyka
            </Typography>
            <List>
              {topRisks.length > 0 ? topRisks.map((risk, index) => (
                <ListItem key={risk.id} divider>
                  <ListItemIcon>
                    <WarningIcon color={risk.impact === 'CRITICAL' ? 'error' : 'warning'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={risk.description}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip 
                          label={risk.category} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={risk.impact} 
                          size="small" 
                          color={risk.impact === 'CRITICAL' ? 'error' : 'warning'}
                        />
                      </Stack>
                    }
                  />
                </ListItem>
              )) : (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Brak znaczących ryzyk wykrytych" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Główne postacie */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Główne Postacie
            </Typography>
            <List>
              {mainCharacters.length > 0 ? mainCharacters.map((character, index) => (
                <ListItem key={character.id} divider>
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: character.role === 'PROTAGONIST' ? 'primary.main' : 'error.main',
                      width: 32,
                      height: 32
                    }}>
                      {character.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={character.name}
                    secondary={
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip 
                          label={character.role} 
                          size="small" 
                          color={character.role === 'PROTAGONIST' ? 'primary' : 'error'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {character.totalScenes} scen
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              )) : (
                <ListItem>
                  <ListItemText primary="Brak zidentyfikowanych głównych postaci" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Metadata */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informacje o Scenariuszu
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gatunek
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.genre || 'Nieznany'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ton
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.tone || 'Nieznany'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Strony
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.pageCount || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Czas czytania
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.estimatedReadingTime || 0} min
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OverviewDashboard; 