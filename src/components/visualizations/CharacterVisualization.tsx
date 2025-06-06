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
  Avatar,
  IconButton,
  Collapse,
  Paper,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Badge as BadgeIcon,
  Favorite as FavoriteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { CharacterDetail, CharacterRelationship } from '@/types/analysis';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface CharacterVisualizationProps {
  characters: CharacterDetail[];
}

const CharacterVisualization: React.FC<CharacterVisualizationProps> = ({ characters }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDetail | null>(null);

  // Filtrowanie postaci
  const filteredCharacters = characters.filter(character => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'protagonist') return character.role === 'PROTAGONIST';
    if (selectedFilter === 'antagonist') return character.role === 'ANTAGONIST';
    if (selectedFilter === 'supporting') return character.role === 'SUPPORTING';
    if (selectedFilter === 'minor') return character.role === 'MINOR';
    return true;
  });

  // Statystyki
  const protagonists = characters.filter(c => c.role === 'PROTAGONIST').length;
  const antagonists = characters.filter(c => c.role === 'ANTAGONIST').length;
  const supporting = characters.filter(c => c.role === 'SUPPORTING').length;
  const minor = characters.filter(c => c.role === 'MINOR').length;
  const extras = characters.filter(c => c.role === 'EXTRA').length;

  // Dane dla wykresów
  const roleDistributionData = [
    { name: 'Protagoniści', value: protagonists, color: '#2563eb' },
    { name: 'Antagoniści', value: antagonists, color: '#dc2626' },
    { name: 'Wspierające', value: supporting, color: '#059669' },
    { name: 'Pomniejsze', value: minor, color: '#d97706' },
    { name: 'Statyści', value: extras, color: '#6b7280' }
  ];

  const characterActivityData = characters
    .sort((a, b) => (b.totalScenes || 0) - (a.totalScenes || 0))
    .slice(0, 10)
    .map(char => ({
      name: char.name,
      scenes: char.totalScenes || 0,
      dialogues: char.dialogueLines || 0
    }));

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PROTAGONIST': return '#2563eb';
      case 'ANTAGONIST': return '#dc2626';
      case 'SUPPORTING': return '#059669';
      case 'MINOR': return '#d97706';
      case 'EXTRA': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'PROTAGONIST': return 'Protagonista';
      case 'ANTAGONIST': return 'Antagonista';
      case 'SUPPORTING': return 'Wspierająca';
      case 'MINOR': return 'Pomniejsza';
      case 'EXTRA': return 'Statystka';
      default: return role;
    }
  };

  const getArcTypeName = (arcType: string) => {
    switch (arcType) {
      case 'HERO': return 'Bohater';
      case 'VILLAIN': return 'Czarny charakter';
      case 'ANTI_HERO': return 'Antybohater';
      case 'MENTOR': return 'Mentor';
      case 'SIDEKICK': return 'Pomocnik';
      case 'LOVE_INTEREST': return 'Partner romantyczny';
      case 'COMIC_RELIEF': return 'Ulga komiczna';
      case 'OTHER': return 'Inne';
      default: return arcType;
    }
  };

  const toggleCharacterExpansion = (characterId: string) => {
    setExpandedCharacter(expandedCharacter === characterId ? null : characterId);
  };

  const handleCharacterSelect = (character: CharacterDetail) => {
    setSelectedCharacter(selectedCharacter?.id === character.id ? null : character);
  };

  // Dane radaru dla profilu psychologicznego
  const getRadarData = (character: CharacterDetail) => {
    if (!character.psychologicalProfile) return [];
    
    return [
      { trait: 'Motywacja', value: character.psychologicalProfile.motivations?.primary ? 8 : 3 },
      { trait: 'Siła charakteru', value: character.psychologicalProfile.strengths?.length || 0 },
      { trait: 'Konflikty', value: character.psychologicalProfile.internalConflicts?.length || 0 },
      { trait: 'Cechy osobowości', value: Math.min(character.psychologicalProfile.personalityTraits?.length || 0, 10) },
      { trait: 'Lęki', value: character.psychologicalProfile.fears?.length || 0 },
      { trait: 'Słabości', value: character.psychologicalProfile.weaknesses?.length || 0 }
    ];
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
                  {characters.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Łączna liczba postaci
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {protagonists}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Protagoniści
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {antagonists}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Antagoniści
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {supporting}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wspierające
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {minor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pomniejsze
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="text.secondary" fontWeight="bold">
                  {extras}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Statyści
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtrowanie */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Filtruj postacie</InputLabel>
          <Select
            value={selectedFilter}
            label="Filtruj postacie"
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="all">Wszystkie postacie ({characters.length})</MenuItem>
            <MenuItem value="protagonist">
              <Stack direction="row" alignItems="center" spacing={1}>
                <StarIcon fontSize="small" color="primary" />
                <span>Protagoniści ({protagonists})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="antagonist">
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningIcon fontSize="small" color="error" />
                <span>Antagoniści ({antagonists})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="supporting">
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupIcon fontSize="small" color="success" />
                <span>Wspierające ({supporting})</span>
              </Stack>
            </MenuItem>
            <MenuItem value="minor">Pomniejsze ({minor})</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Podsumowanie postaci
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Filtrowane postacie:</Typography>
              <Typography variant="h6">{filteredCharacters.length}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Średnio scen na postać:</Typography>
              <Typography variant="h6">
                {Math.round(characters.reduce((acc, char) => acc + (char.totalScenes || 0), 0) / characters.length)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Wykres rozkładu ról */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rozkład Ról Postaci
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Wykres aktywności postaci */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Aktywność Postaci (Top 10)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={characterActivityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value, name) => [value, name === 'scenes' ? 'Sceny' : 'Kwestie']} />
                <Legend formatter={(value) => value === 'scenes' ? 'Sceny' : 'Kwestie'} />
                <Bar dataKey="scenes" fill="#2563eb" name="scenes" />
                <Bar dataKey="dialogues" fill="#059669" name="dialogues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Lista postaci */}
      <Grid item xs={12} md={selectedCharacter ? 8 : 12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lista Postaci ({filteredCharacters.length})
            </Typography>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <List>
                {filteredCharacters.map((character) => (
                  <Box key={character.id}>
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor: selectedCharacter?.id === character.id ? 'primary.main' : 'grey.200',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: selectedCharacter?.id === character.id ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleCharacterSelect(character)}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getRoleColor(character.role),
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        {character.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {character.name}
                            </Typography>
                            <Chip
                              label={getRoleName(character.role)}
                              size="small"
                              sx={{ bgcolor: getRoleColor(character.role), color: 'white' }}
                            />
                            {character.psychologicalProfile?.arcType && (
                              <Chip
                                label={getArcTypeName(character.psychologicalProfile.arcType)}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {character.description || 'Brak opisu'}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                <TimelineIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {character.totalScenes || 0} scen
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <BadgeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                {character.dialogueLines || 0} kwestii
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Sceny {character.firstAppearance || 0}-{character.lastAppearance || 0}
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        toggleCharacterExpansion(character.id);
                      }}>
                        {expandedCharacter === character.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </ListItem>

                    <Collapse in={expandedCharacter === character.id}>
                      <Card variant="outlined" sx={{ ml: 2, mb: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Szczegóły postaci
                          </Typography>

                          {/* Opis łuku */}
                          <Typography variant="body2" paragraph>
                            <strong>Łuk postaci:</strong> {character.arc || 'Brak opisu łuku'}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          {/* Profil psychologiczny */}
                          {character.psychologicalProfile && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Profil psychologiczny:
                              </Typography>
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="caption" fontWeight="bold">Główna motywacja:</Typography>
                                  <Typography variant="body2">
                                    {character.psychologicalProfile.motivations?.primary || 'Nieznana'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="caption" fontWeight="bold">Typ archetypu:</Typography>
                                  <Typography variant="body2">
                                    {getArcTypeName(character.psychologicalProfile.arcType)}
                                  </Typography>
                                </Grid>
                              </Grid>

                              {character.psychologicalProfile.strengths && character.psychologicalProfile.strengths.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">Mocne strony:</Typography>
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                    {character.psychologicalProfile.strengths.map((strength, index) => (
                                      <Chip key={index} label={strength} size="small" color="success" variant="outlined" />
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {character.psychologicalProfile.weaknesses && character.psychologicalProfile.weaknesses.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">Słabości:</Typography>
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                    {character.psychologicalProfile.weaknesses.map((weakness, index) => (
                                      <Chip key={index} label={weakness} size="small" color="error" variant="outlined" />
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {character.psychologicalProfile.fears && character.psychologicalProfile.fears.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">Lęki:</Typography>
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                    {character.psychologicalProfile.fears.map((fear, index) => (
                                      <Chip key={index} label={fear} size="small" color="warning" variant="outlined" />
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Informacje dodatkowe */}
                          <Grid container spacing={2}>
                            {character.age && (
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Wiek:</Typography>
                                <Typography variant="body2">{character.age}</Typography>
                              </Grid>
                            )}
                            {character.gender && (
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Płeć:</Typography>
                                <Typography variant="body2">{character.gender}</Typography>
                              </Grid>
                            )}
                          </Grid>

                          {/* Umiejętności specjalne */}
                          {character.specialSkills && character.specialSkills.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                Umiejętności specjalne:
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                {character.specialSkills.map((skill, index) => (
                                  <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
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

      {/* Panel wybranej postaci */}
      {selectedCharacter && (
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(selectedCharacter.role),
                    width: 56,
                    height: 56
                  }}
                >
                  {selectedCharacter.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCharacter.name}</Typography>
                  <Chip
                    label={getRoleName(selectedCharacter.role)}
                    size="small"
                    sx={{ bgcolor: getRoleColor(selectedCharacter.role), color: 'white' }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Radar profilu psychologicznego */}
              {selectedCharacter.psychologicalProfile && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Profil Psychologiczny
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={getRadarData(selectedCharacter)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" />
                      <PolarRadiusAxis angle={0} domain={[0, 10]} />
                      <Radar
                        name="Profil"
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {/* Statystyki postaci */}
              <Typography variant="subtitle2" gutterBottom>
                Statystyki
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Sceny:</Typography>
                    <Typography variant="caption">{selectedCharacter.totalScenes || 0}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={((selectedCharacter.totalScenes || 0) / Math.max(...characters.map(c => c.totalScenes || 0))) * 100}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Kwestie dialogowe:</Typography>
                    <Typography variant="caption">{selectedCharacter.dialogueLines || 0}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={((selectedCharacter.dialogueLines || 0) / Math.max(...characters.map(c => c.dialogueLines || 0))) * 100}
                    color="secondary"
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Stack>

              {/* Oznaczenia specjalne */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Oznaczenia specjalne
                </Typography>
                <Stack spacing={1}>
                  {selectedCharacter.stuntsInvolved && (
                    <Chip label="Sceny kaskaderskie" size="small" color="warning" />
                  )}
                  {selectedCharacter.intimacyInvolved && (
                    <Chip label="Sceny intymne" size="small" color="error" />
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

export default CharacterVisualization; 