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
  LinearProgress,
  IconButton,
  Collapse,
  Paper,
  Divider
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  AccessTime,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Thermostat as IntensityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  WbSunny as DayIcon,
  NightsStay,
  Home as InteriorIcon,
  Landscape as ExteriorIcon
} from '@mui/icons-material';
import { SceneStructure } from '@/types/analysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface SceneVisualizationProps {
  scenes: SceneStructure[];
}

const SceneVisualization: React.FC<SceneVisualizationProps> = ({ scenes }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

  // Filtrowanie scen
  const filteredScenes = scenes.filter(scene => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'interior') return scene.sceneType === 'INTERIOR';
    if (selectedFilter === 'exterior') return scene.sceneType === 'EXTERIOR';
    if (selectedFilter === 'day') return ['DAY', 'DAWN', 'MORNING', 'AFTERNOON'].includes(scene.timeOfDay);
    if (selectedFilter === 'night') return ['NIGHT', 'DUSK', 'EVENING'].includes(scene.timeOfDay);
    if (selectedFilter === 'complex') return scene.complexity === 'HIGH';
    return true;
  });

  // Dane dla wykresów
  const emotionalData = scenes.map((scene, index) => ({
    sceneNumber: scene.number,
    tension: scene.emotions?.tension || 0,
    intensity: scene.emotions?.intensity || 0,
    joy: scene.emotions?.joy || 0,
    sadness: scene.emotions?.sadness || 0,
    fear: scene.emotions?.fear || 0,
    anger: scene.emotions?.anger || 0
  }));

  const durationData = scenes.map(scene => ({
    scene: `Scena ${scene.number}`,
    duration: scene.estimatedDuration || 0,
    complexity: scene.complexity
  }));

  // Statystyki
  const totalDuration = scenes.reduce((acc, scene) => acc + (scene.estimatedDuration || 0), 0);
  const avgDuration = totalDuration / scenes.length;
  const complexScenes = scenes.filter(s => s.complexity === 'HIGH').length;
  const nightScenes = scenes.filter(s => ['NIGHT', 'DUSK', 'EVENING'].includes(s.timeOfDay)).length;
  const interiorScenes = scenes.filter(s => s.sceneType === 'INTERIOR').length;
  const exteriorScenes = scenes.filter(s => s.sceneType === 'EXTERIOR').length;

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'LOW': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'tension': return '#f44336';
      case 'joy': return '#4caf50';
      case 'sadness': return '#2196f3';
      case 'fear': return '#9c27b0';
      case 'anger': return '#ff5722';
      case 'intensity': return '#ff9800';
      default: return '#757575';
    }
  };

  const toggleSceneExpansion = (sceneId: string) => {
    setExpandedScene(expandedScene === sceneId ? null : sceneId);
  };

  const formatTimeOfDay = (timeOfDay: string) => {
    const timeMap: { [key: string]: string } = {
      'DAY': 'Dzień',
      'NIGHT': 'Noc',
      'DAWN': 'Świt',
      'DUSK': 'Zmierzch',
      'MORNING': 'Rano',
      'AFTERNOON': 'Popołudnie',
      'EVENING': 'Wieczór',
      'CONTINUOUS': 'Ciągłość'
    };
    return timeMap[timeOfDay] || timeOfDay;
  };

  const formatComplexity = (complexity: string) => {
    const complexityMap: { [key: string]: string } = {
      'LOW': 'Niska',
      'MEDIUM': 'Średnia',
      'HIGH': 'Wysoka'
    };
    return complexityMap[complexity] || complexity;
  };

  return (
    <Grid container spacing={3}>
      {/* Statystyki */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {scenes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Łączna liczba scen
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {Math.round(totalDuration)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Całkowity czas (min)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {complexScenes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sceny złożone
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {nightScenes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sceny nocne
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary.main" fontWeight="bold">
                  {interiorScenes}
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
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {exteriorScenes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zewnętrzne
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtrowanie */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Filtruj sceny</InputLabel>
          <Select
            value={selectedFilter}
            label="Filtruj sceny"
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="all">Wszystkie sceny ({scenes.length})</MenuItem>
            <MenuItem value="interior">
              <Stack direction="row" alignItems="center" spacing={1}>
                <InteriorIcon fontSize="small" />
                <span>Tylko wnętrza ({interiorScenes})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="exterior">
              <Stack direction="row" alignItems="center" spacing={1}>
                <ExteriorIcon fontSize="small" />
                <span>Tylko zewnętrzne ({exteriorScenes})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="day">
              <Stack direction="row" alignItems="center" spacing={1}>
                <DayIcon fontSize="small" />
                <span>Sceny dzienne</span>
              </Stack>
            </MenuItem>
            <MenuItem value="night">
              <Stack direction="row" alignItems="center" spacing={1}>
                <NightsStay fontSize="small" />
                <span>Sceny nocne ({nightScenes})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="complex">Sceny złożone ({complexScenes})</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Podsumowanie filtrów
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Filtrowane sceny:</Typography>
              <Typography variant="h6">{filteredScenes.length}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Średni czas:</Typography>
              <Typography variant="h6">{Math.round(avgDuration)} min</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Najdłuższa:</Typography>
              <Typography variant="h6">
                {Math.max(...scenes.map(s => s.estimatedDuration || 0))} min
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Najkrótsza:</Typography>
              <Typography variant="h6">
                {Math.min(...scenes.map(s => s.estimatedDuration || 0))} min
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Wykres emocjonalny */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Łuk Emocjonalny Scenariusza
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={emotionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sceneNumber" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}/10`,
                    name === 'tension' ? 'Napięcie' :
                    name === 'intensity' ? 'Intensywność' :
                    name === 'joy' ? 'Radość' :
                    name === 'sadness' ? 'Smutek' :
                    name === 'fear' ? 'Strach' :
                    name === 'anger' ? 'Gniew' : name
                  ]}
                  labelFormatter={(value) => `Scena ${value}`}
                />
                <Legend 
                  formatter={(value) => 
                    value === 'tension' ? 'Napięcie' :
                    value === 'intensity' ? 'Intensywność' :
                    value === 'joy' ? 'Radość' :
                    value === 'sadness' ? 'Smutek' :
                    value === 'fear' ? 'Strach' :
                    value === 'anger' ? 'Gniew' : value
                  }
                />
                <Line type="monotone" dataKey="tension" stroke="#f44336" strokeWidth={2} name="tension" />
                <Line type="monotone" dataKey="intensity" stroke="#ff9800" strokeWidth={2} name="intensity" />
                <Line type="monotone" dataKey="joy" stroke="#4caf50" strokeWidth={2} name="joy" />
                <Line type="monotone" dataKey="sadness" stroke="#2196f3" strokeWidth={2} name="sadness" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Wykres czasów trwania */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Czas Trwania Scen
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scene" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} min`, 'Czas trwania']} />
                <Bar dataKey="duration" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Lista scen */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lista Scen ({filteredScenes.length})
            </Typography>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <List>
                {filteredScenes.map((scene) => (
                  <Box key={scene.id}>
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => toggleSceneExpansion(scene.id)}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Scena {scene.number}
                            </Typography>
                            <Chip 
                              label={scene.sceneType === 'INTERIOR' ? 'WN' : 'ZEW'} 
                              size="small" 
                              color={scene.sceneType === 'INTERIOR' ? 'primary' : 'secondary'}
                              icon={scene.sceneType === 'INTERIOR' ? <InteriorIcon /> : <ExteriorIcon />}
                            />
                            <Chip 
                              label={formatTimeOfDay(scene.timeOfDay)} 
                              size="small" 
                              variant="outlined"
                              icon={['NIGHT', 'DUSK', 'EVENING'].includes(scene.timeOfDay) ? <NightsStay /> : <DayIcon />}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {scene.location}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                              <Chip 
                                label={formatComplexity(scene.complexity)} 
                                size="small" 
                                sx={{ bgcolor: getComplexityColor(scene.complexity), color: 'white' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                <AccessTime fontSize="inherit" sx={{ mr: 0.5 }} />
                                {scene.estimatedDuration || 0} min
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <PeopleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {scene.characters?.length || 0} postaci
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                      <IconButton>
                        {expandedScene === scene.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </ListItem>
                    
                    <Collapse in={expandedScene === scene.id}>
                      <Card variant="outlined" sx={{ ml: 2, mb: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Szczegóły sceny
                          </Typography>
                          
                          {/* Opis */}
                          <Typography variant="body2" paragraph>
                            {scene.description || 'Brak opisu'}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Postacie */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Postacie w scenie:
                            </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                              {scene.characters?.map((character, index) => (
                                <Chip 
                                  key={index}
                                  label={character} 
                                  size="small" 
                                  variant="outlined"
                                  icon={<PeopleIcon />}
                                />
                              ))}
                            </Stack>
                          </Box>

                          {/* Emocje */}
                          {scene.emotions && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Profil emocjonalny:
                              </Typography>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                {Object.entries(scene.emotions).map(([emotion, value]) => (
                                  emotion !== 'dominantEmotion' && typeof value === 'number' && (
                                    <Grid item xs={6} key={emotion}>
                                      <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Typography variant="caption">
                                            {emotion === 'tension' ? 'Napięcie' :
                                             emotion === 'joy' ? 'Radość' :
                                             emotion === 'sadness' ? 'Smutek' :
                                             emotion === 'fear' ? 'Strach' :
                                             emotion === 'anger' ? 'Gniew' :
                                             emotion === 'hope' ? 'Nadzieja' :
                                             emotion === 'intensity' ? 'Intensywność' : emotion}
                                          </Typography>
                                          <Typography variant="caption">{value}/10</Typography>
                                        </Stack>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={(value / 10) * 100} 
                                          sx={{ 
                                            height: 4,
                                            borderRadius: 2,
                                            '& .MuiLinearProgress-bar': {
                                              bgcolor: getEmotionColor(emotion)
                                            }
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  )
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {/* Rekwizyty i pojazdy */}
                          {scene.props && scene.props.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Rekwizyty:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                {scene.props.map((prop, index) => (
                                  <Chip 
                                    key={index}
                                    label={prop} 
                                    size="small" 
                                    color="secondary"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Pojazdy */}
                          {scene.vehicles && scene.vehicles.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Pojazdy:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                {scene.vehicles.map((vehicle, index) => (
                                  <Chip 
                                    key={index}
                                    label={vehicle} 
                                    size="small" 
                                    color="warning"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Efekty specjalne */}
                          {scene.specialEffects && scene.specialEffects.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Efekty specjalne:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                {scene.specialEffects.map((effect, index) => (
                                  <Chip 
                                    key={index}
                                    label={effect} 
                                    size="small" 
                                    color="error"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
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
    </Grid>
  );
};

export default SceneVisualization; 