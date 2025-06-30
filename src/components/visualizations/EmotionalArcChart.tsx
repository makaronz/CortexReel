import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Favorite as LoveIcon,
  SentimentVeryDissatisfied as SadnessIcon,
  Whatshot as AngerIcon,
  SentimentVeryDissatisfied as FearIcon,
  SentimentNeutral as NeutralIcon,
  EmojiEmotions as JoyIcon,
  PsychologyAlt as SurpriseIcon,
  ThumbDown as DisgustIcon} from '@mui/icons-material';
import { EmotionalArcData } from '@/types/analysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';

interface EmotionalArcChartProps {
  emotionalArcs: EmotionalArcData;
}

const EmotionalArcChart: React.FC<EmotionalArcChartProps> = ({ emotionalArcs }) => {
  const [selectedView, setSelectedView] = useState('overall');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  if (!emotionalArcs) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Emotional Arc Analysis</Typography>
          <Typography color="text.secondary">Waiting for emotional arc data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  // Przygotowanie danych dla wykresów
  const emotionData = emotionalArcs.overall?.map((point, index) => ({
    scene: index + 1,
    tension: point.tension || 0,
    intensity: point.intensity || 0,
    joy: point.joy || 0,
    sadness: point.sadness || 0,
    anger: point.anger || 0,
    fear: point.fear || 0,
    hope: point.hope || 0,
    surprise: 0, // Nie ma w EmotionalArcPoint
    disgust: 0, // Nie ma w EmotionalArcPoint
    love: 0, // Nie ma w EmotionalArcPoint
    neutral: 0, // Nie ma w EmotionalArcPoint
    averageEmotion: ((point.joy || 0) + (point.sadness || 0) + (point.anger || 0) + (point.fear || 0)) / 4
  })) || [];

  // Analiza szczytów emocjonalnych
  const emotionalPeaks = emotionData.map((point, index) => {
    const emotions = [
      { name: 'Radość', value: point.joy, color: '#fbbf24' },
      { name: 'Smutek', value: point.sadness, color: '#3b82f6' },
      { name: 'Złość', value: point.anger, color: '#ef4444' },
      { name: 'Strach', value: point.fear, color: '#8b5cf6' },
      { name: 'Zaskoczenie', value: point.surprise, color: '#10b981' },
      { name: 'Wstręt', value: point.disgust, color: '#6b7280' },
      { name: 'Miłość', value: point.love, color: '#ec4899' },
      { name: 'Neutralne', value: point.neutral, color: '#9ca3af' }
    ];
    
    const dominantEmotion = emotions.reduce((prev, current) => 
      (current.value > prev.value) ? current : prev
    );

    return {
      scene: index + 1,
      dominantEmotion: dominantEmotion.name,
      dominantValue: dominantEmotion.value,
      dominantColor: dominantEmotion.color,
      intensity: point.intensity || 0,
      tension: point.tension || 0
    };
  });

  // Statystyki emocjonalne
  const emotionStats = {
    joy: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.joy, 0) / emotionData.length : 0,
    sadness: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.sadness, 0) / emotionData.length : 0,
    anger: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.anger, 0) / emotionData.length : 0,
    fear: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.fear, 0) / emotionData.length : 0,
    hope: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.hope, 0) / emotionData.length : 0,
    surprise: 0, // Brak w danych
    disgust: 0, // Brak w danych
    love: 0, // Brak w danych
    neutral: 0, // Brak w danych
    averageIntensity: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.intensity, 0) / emotionData.length : 0,
    averageTension: emotionData.length > 0 ? emotionData.reduce((sum: number, point) => sum + point.tension, 0) / emotionData.length : 0
  };

  // Dane dla wykresu radarowego
  const emotionRadarData = [
    { emotion: 'Radość', value: emotionStats.joy, fullMark: 10 },
    { emotion: 'Smutek', value: emotionStats.sadness, fullMark: 10 },
    { emotion: 'Złość', value: emotionStats.anger, fullMark: 10 },
    { emotion: 'Strach', value: emotionStats.fear, fullMark: 10 },
    { emotion: 'Nadzieja', value: emotionStats.hope, fullMark: 10 }
  ];

  // Identyfikacja kluczowych momentów z rzeczywistych danych
  const keyMoments = emotionalArcs.keyMoments || emotionalPeaks
    .map((peak, index) => ({ ...peak, sceneIndex: index }))
    .filter(peak => peak.intensity > 7 || peak.tension > 8)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);

  // Analiza dynamiki emocjonalnej
  const emotionalDynamics = emotionData.map((point, index) => {
    if (index === 0) return { scene: point.scene, change: 0, momentum: 0 };
    
    const prevPoint = emotionData[index - 1];
    const emotionChange = Math.abs((point.averageEmotion || 0) - (prevPoint.averageEmotion || 0));
    const intensityChange = (point.intensity || 0) - (prevPoint.intensity || 0);
    
    return {
      scene: point.scene,
      change: emotionChange,
      momentum: intensityChange,
      direction: intensityChange > 0 ? 'wzrost' : intensityChange < 0 ? 'spadek' : 'stabilne'
    };
  });

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Radość': return <JoyIcon sx={{ color: '#fbbf24' }} />;
      case 'Smutek': return <SadnessIcon sx={{ color: '#3b82f6' }} />;
      case 'Złość': return <AngerIcon sx={{ color: '#ef4444' }} />;
      case 'Strach': return <FearIcon sx={{ color: '#8b5cf6' }} />;
      case 'Zaskoczenie': return <SurpriseIcon sx={{ color: '#10b981' }} />;
      case 'Wstręt': return <DisgustIcon sx={{ color: '#6b7280' }} />;
      case 'Miłość': return <LoveIcon sx={{ color: '#ec4899' }} />;
      case 'Neutralne': return <NeutralIcon sx={{ color: '#9ca3af' }} />;
      default: return <NeutralIcon />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Radość': return '#fbbf24';
      case 'Smutek': return '#3b82f6';
      case 'Złość': return '#ef4444';
      case 'Strach': return '#8b5cf6';
      case 'Zaskoczenie': return '#10b981';
      case 'Wstręt': return '#6b7280';
      case 'Miłość': return '#ec4899';
      case 'Neutralne': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getIntensityLevel = (intensity: number) => {
    if (intensity >= 8) return { level: 'Bardzo wysokie', color: 'error' };
    if (intensity >= 6) return { level: 'Wysokie', color: 'warning' };
    if (intensity >= 4) return { level: 'Umiarkowane', color: 'info' };
    if (intensity >= 2) return { level: 'Niskie', color: 'success' };
    return { level: 'Bardzo niskie', color: 'default' };
  };

  return (
    <Grid container spacing={3}>
      {/* Statystyki główne */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {emotionData.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Punktów emocjonalnych
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {emotionStats.averageIntensity.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Średnia intensywność
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {emotionStats.averageTension.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Średnie napięcie
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {keyMoments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kluczowe momenty
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Kontrolki filtrowania */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Widok analizy</InputLabel>
          <Select
            value={selectedView}
            label="Widok analizy"
            onChange={(e) => setSelectedView(e.target.value)}
          >
            <MenuItem value="overall">Ogólny łuk emocjonalny</MenuItem>
            <MenuItem value="emotions">Szczegółowe emocje</MenuItem>
            <MenuItem value="dynamics">Dynamika emocjonalna</MenuItem>
            <MenuItem value="moments">Kluczowe momenty</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Fokus na emocji</InputLabel>
          <Select
            value={selectedEmotion}
            label="Fokus na emocji"
            onChange={(e) => setSelectedEmotion(e.target.value)}
          >
            <MenuItem value="all">Wszystkie emocje</MenuItem>
            <MenuItem value="joy">
              <Stack direction="row" alignItems="center" spacing={1}>
                <JoyIcon fontSize="small" sx={{ color: '#fbbf24' }} />
                <span>Radość</span>
              </Stack>
            </MenuItem>
            <MenuItem value="sadness">
              <Stack direction="row" alignItems="center" spacing={1}>
                <SadnessIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                <span>Smutek</span>
              </Stack>
            </MenuItem>
            <MenuItem value="anger">
              <Stack direction="row" alignItems="center" spacing={1}>
                <AngerIcon fontSize="small" sx={{ color: '#ef4444' }} />
                <span>Złość</span>
              </Stack>
            </MenuItem>
            <MenuItem value="fear">
              <Stack direction="row" alignItems="center" spacing={1}>
                <FearIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                <span>Strach</span>
              </Stack>
            </MenuItem>
            <MenuItem value="hope">
              <Stack direction="row" alignItems="center" spacing={1}>
                <JoyIcon fontSize="small" sx={{ color: '#10b981' }} />
                <span>Nadzieja</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Główny wykres łuku emocjonalnego */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedView === 'overall' && 'Główny Łuk Emocjonalny Scenariusza'}
              {selectedView === 'emotions' && 'Szczegółowa Analiza Emocji'}
              {selectedView === 'dynamics' && 'Dynamika Zmian Emocjonalnych'}
              {selectedView === 'moments' && 'Kluczowe Momenty Emocjonalne'}
            </Typography>
            
            {selectedView === 'overall' && (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scene" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip formatter={(value, name) => [value, name === 'tension' ? 'Napięcie' : name === 'intensity' ? 'Intensywność' : 'Średnia emocja']} />
                  <Legend formatter={(value) => value === 'tension' ? 'Napięcie' : value === 'intensity' ? 'Intensywność' : 'Średnia emocja'} />
                  <Area type="monotone" dataKey="tension" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="intensity" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="averageEmotion" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {selectedView === 'emotions' && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scene" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip formatter={(value, name) => {
                    const emotionNames = {
                      joy: 'Radość',
                      sadness: 'Smutek',
                      anger: 'Złość',
                      fear: 'Strach',
                      surprise: 'Zaskoczenie',
                      disgust: 'Wstręt',
                      love: 'Miłość',
                      neutral: 'Neutralne'
                    };
                    return [value, emotionNames[name as keyof typeof emotionNames] || name];
                  }} />
                  <Legend formatter={(value) => {
                    const emotionNames = {
                      joy: 'Radość',
                      sadness: 'Smutek',
                      anger: 'Złość',
                      fear: 'Strach',
                      surprise: 'Zaskoczenie',
                      disgust: 'Wstręt',
                      love: 'Miłość',
                      neutral: 'Neutralne'
                    };
                    return emotionNames[value as keyof typeof emotionNames] || value;
                  }} />
                  {(selectedEmotion === 'all' || selectedEmotion === 'joy') && <Line type="monotone" dataKey="joy" stroke="#fbbf24" strokeWidth={2} />}
                  {(selectedEmotion === 'all' || selectedEmotion === 'sadness') && <Line type="monotone" dataKey="sadness" stroke="#3b82f6" strokeWidth={2} />}
                  {(selectedEmotion === 'all' || selectedEmotion === 'anger') && <Line type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={2} />}
                  {(selectedEmotion === 'all' || selectedEmotion === 'fear') && <Line type="monotone" dataKey="fear" stroke="#8b5cf6" strokeWidth={2} />}
                  {selectedEmotion === 'all' && (
                    <>
                      <Line type="monotone" dataKey="hope" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}

            {selectedView === 'dynamics' && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={emotionalDynamics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scene" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, name === 'change' ? 'Zmiana emocjonalna' : 'Momentum']} />
                  <Legend formatter={(value) => value === 'change' ? 'Zmiana emocjonalna' : 'Momentum'} />
                  <Bar dataKey="change" fill="#3b82f6" name="change" />
                  <Bar dataKey="momentum" fill="#10b981" name="momentum" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Wykres radarowy emocji */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profil Emocjonalny Scenariusza
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={emotionRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="emotion" />
                <PolarRadiusAxis domain={[0, 10]} tickCount={6} />
                <Radar
                  name="Intensywność emocji"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Statystyki emocjonalne */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analiza Emocjonalna
            </Typography>
            <Stack spacing={2}>
              {Object.entries(emotionStats).slice(0, 8).map(([emotion, value]) => {
                const emotionName = {
                  joy: 'Radość',
                  sadness: 'Smutek',
                  anger: 'Złość',
                  fear: 'Strach',
                  hope: 'Nadzieja',
                  surprise: 'Zaskoczenie',
                  disgust: 'Wstręt',
                  love: 'Miłość',
                  neutral: 'Neutralne',
                  averageIntensity: 'Średnia intensywność',
                  averageTension: 'Średnie napięcie'
                }[emotion as keyof typeof emotionStats] || emotion;

                return (
                  <Box key={emotion}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getEmotionIcon(emotionName)}
                        <Typography variant="body2">{emotionName}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="bold">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(typeof value === 'number' ? value : 0) * 10}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getEmotionColor(emotionName)
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Kluczowe momenty emocjonalne */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kluczowe Momenty Emocjonalne
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Scena</TableCell>
                    <TableCell>Dominująca emocja</TableCell>
                    <TableCell>Intensywność</TableCell>
                    <TableCell>Napięcie</TableCell>
                    <TableCell>Opis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keyMoments.map((moment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip label={`Scena ${moment.sceneNumber || index + 1}`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getEmotionIcon(moment.dominantEmotion)}
                          <Typography variant="body2">{moment.dominantEmotion}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            variant="determinate"
                            value={(moment.intensity || 0) * 10}
                            sx={{ width: 60, height: 6 }}
                            color={getIntensityLevel(moment.intensity || 0).color as any}
                          />
                          <Typography variant="body2">{(moment.intensity || 0).toFixed(1)}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            variant="determinate"
                            value={(moment.tension || 0) * 10}
                            sx={{ width: 60, height: 6 }}
                            color="error"
                          />
                          <Typography variant="body2">{(moment.tension || 0).toFixed(1)}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getIntensityLevel(moment.intensity || 0).level} natężenie emocjonalne
                          {moment.description && ` - ${moment.description}`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Analiza dynamiki emocjonalnej */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dynamika Emocjonalna Scena po Scenie
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <List>
                {emotionalDynamics.slice(1).map((dynamic, index) => (
                  <ListItem key={index} divider>
                    <Avatar sx={{ mr: 2, bgcolor: dynamic.momentum > 0 ? 'success.main' : dynamic.momentum < 0 ? 'error.main' : 'grey.500' }}>
                      {dynamic.scene}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2">
                            Scena {dynamic.scene}
                          </Typography>
                          <Chip
                            label={dynamic.direction}
                            size="small"
                            color={dynamic.momentum > 0 ? 'success' : dynamic.momentum < 0 ? 'error' : 'default'}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Zmiana emocjonalna: {(dynamic.change || 0).toFixed(2)} | Momentum: {(dynamic.momentum || 0).toFixed(2)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(Math.abs(dynamic.change) * 20, 100)}
                            sx={{ mt: 0.5, height: 4 }}
                            color={dynamic.change > 2 ? 'warning' : 'primary'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmotionalArcChart; 