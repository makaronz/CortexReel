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
  Avatar,
  IconButton,
  Collapse,
  Paper,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { CharacterDetail } from '@/types/analysis';
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface CharacterVisualizationProps {
  characters: CharacterDetail[];
}

const CharacterVisualization: React.FC<CharacterVisualizationProps> = ({
  characters,
}) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(
    null
  );
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterDetail | null>(null);

  if (!characters) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            {t('characterVisualization.title')}
          </Typography>
          <Typography color="text.secondary">
            {t('characterVisualization.waiting')}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const filteredCharacters = characters.filter((character) => {
    if (selectedFilter === 'all') return true;
    return character.role.toLowerCase() === selectedFilter;
  });

  const protagonists = characters.filter(
    (c) => c.role === 'PROTAGONIST'
  ).length;
  const antagonists = characters.filter(
    (c) => c.role === 'ANTAGONIST'
  ).length;
  const supporting = characters.filter((c) => c.role === 'SUPPORTING').length;
  const minor = characters.filter((c) => c.role === 'MINOR').length;
  const extras = characters.filter((c) => c.role === 'EXTRA').length;

  const roleDistributionData = [
    { name: t('roles.PROTAGONIST'), value: protagonists, color: '#2563eb' },
    { name: t('roles.ANTAGONIST'), value: antagonists, color: '#dc2626' },
    { name: t('roles.SUPPORTING'), value: supporting, color: '#059669' },
    { name: t('roles.MINOR'), value: minor, color: '#d97706' },
    { name: t('roles.EXTRA'), value: extras, color: '#6b7280' },
  ];

  const characterActivityData = characters
    .sort((a, b) => (b.totalScenes || 0) - (a.totalScenes || 0))
    .slice(0, 10)
    .map((char) => ({
      name: char.name,
      scenes: char.totalScenes || 0,
      dialogues: char.dialogueLines || 0,
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

  const toggleCharacterExpansion = (characterId: string) => {
    setExpandedCharacter(expandedCharacter === characterId ? null : characterId);
  };

  const handleCharacterSelect = (character: CharacterDetail) => {
    setSelectedCharacter(
      selectedCharacter?.id === character.id ? null : character
    );
  };

  const getRadarData = (character: CharacterDetail) => {
    if (!character.psychologicalProfile) return [];
    return [
      {
        trait: t('characterVisualization.radar.motivation'),
        value: character.psychologicalProfile.motivations?.primary ? 8 : 3,
      },
      {
        trait: t('characterVisualization.radar.strength'),
        value: character.psychologicalProfile.strengths?.length || 0,
      },
      {
        trait: t('characterVisualization.radar.conflicts'),
        value: character.psychologicalProfile.internalConflicts?.length || 0,
      },
      {
        trait: t('characterVisualization.radar.traits'),
        value: Math.min(
          character.psychologicalProfile.personalityTraits?.length || 0,
          10
        ),
      },
      {
        trait: t('characterVisualization.radar.fears'),
        value: character.psychologicalProfile.fears?.length || 0,
      },
      {
        trait: t('characterVisualization.radar.weaknesses'),
        value: character.psychologicalProfile.weaknesses?.length || 0,
      },
    ];
  };

  return (
    <Grid container spacing={3}>
      {/* Main Stats */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="primary.main"
                  fontWeight="bold"
                >
                  {characters.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('characterVisualization.stats.total')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="primary.main"
                  fontWeight="bold"
                >
                  {protagonists}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('roles.PROTAGONIST')}
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
                  {t('roles.ANTAGONIST')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="success.main"
                  fontWeight="bold"
                >
                  {supporting}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('roles.SUPPORTING')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="warning.main"
                  fontWeight="bold"
                >
                  {minor}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('roles.MINOR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {extras}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('roles.EXTRA')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filtering */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>{t('characterVisualization.filter.label')}</InputLabel>
          <Select
            value={selectedFilter}
            label={t('characterVisualization.filter.label')}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="all">
              {t('characterVisualization.filter.all', {
                count: characters.length,
              })}
            </MenuItem>
            <MenuItem value="protagonist">
              <Stack direction="row" alignItems="center" spacing={1}>
                <StarIcon fontSize="small" color="primary" />
                <span>
                  {t('characterVisualization.filter.protagonists', {
                    count: protagonists,
                  })}
                </span>
              </Stack>
            </MenuItem>
            <MenuItem value="antagonist">
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningIcon fontSize="small" color="error" />
                <span>
                  {t('characterVisualization.filter.antagonists', {
                    count: antagonists,
                  })}
                </span>
              </Stack>
            </MenuItem>
            <MenuItem value="supporting">
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupIcon fontSize="small" color="success" />
                <span>
                  {t('characterVisualization.filter.supporting', {
                    count: supporting,
                  })}
                </span>
              </Stack>
            </MenuItem>
            <MenuItem value="minor">
              {t('characterVisualization.filter.minor', { count: minor })}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('characterVisualization.summary.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                {t('characterVisualization.summary.filtered')}:
              </Typography>
              <Typography variant="h6">{filteredCharacters.length}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                {t('characterVisualization.summary.avgScenes')}:
              </Typography>
              <Typography variant="h6">
                {Math.round(
                  characters.reduce(
                    (acc, char) => acc + (char.totalScenes || 0),
                    0
                  ) / characters.length
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('characterVisualization.charts.roleDistribution')}
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

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('characterVisualization.charts.activity')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={characterActivityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    t(`characterVisualization.charts.${name}`),
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    t(`characterVisualization.charts.${value}`)
                  }
                />
                <Bar dataKey="scenes" fill="#2563eb" name="scenes" />
                <Bar dataKey="dialogues" fill="#059669" name="dialogues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Character List */}
      <Grid item xs={12} md={selectedCharacter ? 8 : 12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('characterVisualization.list.title', {
                count: filteredCharacters.length,
              })}
            </Typography>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <List>
                {filteredCharacters.map((character) => (
                  <Box key={character.id}>
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor:
                          selectedCharacter?.id === character.id
                            ? 'primary.main'
                            : 'grey.200',
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor:
                          selectedCharacter?.id === character.id
                            ? 'action.selected'
                            : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleCharacterSelect(character)}
                    >
                      <Avatar
                        sx={{
                          bgcolor: getRoleColor(character.role),
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {character.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {character.name}
                            </Typography>
                            <Chip
                              label={t(`roles.${character.role}` as const)}
                              size="small"
                              sx={{
                                bgcolor: getRoleColor(character.role),
                                color: 'white',
                              }}
                            />
                            {character.psychologicalProfile?.arcType && (
                              <Chip
                                label={t(
                                  `arcTypes.${character.psychologicalProfile.arcType}` as const
                                )}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {character.description ||
                                t('characterVisualization.list.noDescription')}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ mt: 0.5 }}
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                <TimelineIcon
                                  fontSize="inherit"
                                  sx={{ mr: 0.5 }}
                                />
                                {t('characterVisualization.list.scenes', {
                                  count: character.totalScenes || 0,
                                })}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                <BadgeIcon
                                  fontSize="inherit"
                                  sx={{ mr: 0.5 }}
                                />
                                {t('characterVisualization.list.dialogues', {
                                  count: character.dialogueLines || 0,
                                })}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t('characterVisualization.list.appearance', {
                                  first: character.firstAppearance || 0,
                                  last: character.lastAppearance || 0,
                                })}
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCharacterExpansion(character.id);
                        }}
                      >
                        {expandedCharacter === character.id ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </ListItem>

                    <Collapse in={expandedCharacter === character.id}>
                      <Card variant="outlined" sx={{ ml: 2, mb: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('characterVisualization.details.title')}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>
                              {t('characterVisualization.details.arc')}:
                            </strong>{' '}
                            {character.arc ||
                              t('characterVisualization.details.noArc')}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          {character.psychologicalProfile && (
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight="bold"
                              >
                                {t(
                                  'characterVisualization.details.psychologicalProfile'
                                )}
                                :
                              </Typography>
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                  >
                                    {t(
                                      'characterVisualization.details.motivation'
                                    )}
                                    :
                                  </Typography>
                                  <Typography variant="body2">
                                    {character.psychologicalProfile.motivations
                                      ?.primary ||
                                      t(
                                        'characterVisualization.details.unknown'
                                      )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                  >
                                    {t('characterVisualization.details.arcType')}
                                    :
                                  </Typography>
                                  <Typography variant="body2">
                                    {t(
                                      `arcTypes.${character.psychologicalProfile.arcType}` as const
                                    )}
                                  </Typography>
                                </Grid>
                              </Grid>

                              {character.psychologicalProfile.strengths
                                ?.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                  >
                                    {t(
                                      'characterVisualization.details.strengths'
                                    )}
                                    :
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ mt: 0.5 }}
                                    flexWrap="wrap"
                                  >
                                    {character.psychologicalProfile.strengths.map(
                                      (strength, index) => (
                                        <Chip
                                          key={index}
                                          label={strength}
                                          size="small"
                                          color="success"
                                          variant="outlined"
                                        />
                                      )
                                    )}
                                  </Stack>
                                </Box>
                              )}
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
      {/* Selected Character Panel */}
      {selectedCharacter && (
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(selectedCharacter.role),
                    width: 56,
                    height: 56,
                  }}
                >
                  {selectedCharacter.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedCharacter.name}
                  </Typography>
                  <Chip
                    label={t(`roles.${selectedCharacter.role}` as const)}
                    size="small"
                    sx={{
                      bgcolor: getRoleColor(selectedCharacter.role),
                      color: 'white',
                    }}
                  />
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              {selectedCharacter.psychologicalProfile && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t(
                      'characterVisualization.selected.psychologicalProfile'
                    )}
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={getRadarData(selectedCharacter)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" />
                      <PolarRadiusAxis angle={0} domain={[0, 10]} />
                      <Radar
                        name={t('characterVisualization.selected.profile')}
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              <Typography variant="subtitle2" gutterBottom>
                {t('characterVisualization.selected.stats')}
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="caption">
                      {t('characterVisualization.selected.scenes')}:
                    </Typography>
                    <Typography variant="caption">
                      {selectedCharacter.totalScenes || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      ((selectedCharacter.totalScenes || 0) /
                        Math.max(
                          ...characters.map((c) => c.totalScenes || 0)
                        )) *
                      100
                    }
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="caption">
                      {t('characterVisualization.selected.dialogues')}:
                    </Typography>
                    <Typography variant="caption">
                      {selectedCharacter.dialogueLines || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      ((selectedCharacter.dialogueLines || 0) /
                        Math.max(
                          ...characters.map((c) => c.dialogueLines || 0)
                        )) *
                      100
                    }
                    color="secondary"
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('characterVisualization.selected.specialTags')}
                </Typography>
                <Stack spacing={1}>
                  {selectedCharacter.stuntsInvolved && (
                    <Chip
                      label={t(
                        'characterVisualization.selected.stuntsInvolved'
                      )}
                      size="small"
                      color="warning"
                    />
                  )}
                  {selectedCharacter.intimacyInvolved && (
                    <Chip
                      label={t(
                        'characterVisualization.selected.intimacyInvolved'
                      )}
                      size="small"
                      color="error"
                    />
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