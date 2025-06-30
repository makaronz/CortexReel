import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { CompleteAnalysis } from '@/types/analysis';
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
} from 'recharts';

interface OverviewDashboardProps {
  analysis: CompleteAnalysis;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ analysis }) => {
  const { t } = useTranslation();

  const totalScenes = analysis.scenes?.length || 0;
  const totalCharacters = analysis.characters?.length || 0;
  const totalLocations = analysis.locations?.length || 0;
  const estimatedDuration =
    analysis.scenes?.reduce(
      (acc, scene) => acc + (scene.estimatedDuration || 0),
      0
    ) || 0;

  const highRisks =
    analysis.risks?.filter(
      (risk) => risk.impact === 'HIGH' || risk.impact === 'CRITICAL'
    ).length || 0;
  const safetyLevel =
    analysis.safety?.overallAssessment?.overallRiskLevel || 'UNKNOWN';

  const sceneComplexityData = [
    {
      name: t('overviewDashboard.complexity.simple'),
      value: analysis.scenes?.filter((s) => s.complexity === 'LOW').length || 0,
      color: '#4caf50',
    },
    {
      name: t('overviewDashboard.complexity.medium'),
      value: analysis.scenes?.filter((s) => s.complexity === 'MEDIUM').length || 0,
      color: '#ff9800',
    },
    {
      name: t('overviewDashboard.complexity.complex'),
      value: analysis.scenes?.filter((s) => s.complexity === 'HIGH').length || 0,
      color: '#f44336',
    },
  ];

  const locationTypeData = [
    {
      name: t('overviewDashboard.locationTypes.interior'),
      value:
        analysis.locations?.filter((l) => l.type === 'INTERIOR').length || 0,
    },
    {
      name: t('overviewDashboard.locationTypes.exterior'),
      value:
        analysis.locations?.filter((l) => l.type === 'EXTERIOR').length || 0,
    },
    {
      name: t('overviewDashboard.locationTypes.mixed'),
      value: analysis.locations?.filter((l) => l.type === 'MIXED').length || 0,
    },
  ];

  const topRisks =
    analysis.risks
      ?.filter((risk) => risk.impact === 'HIGH' || risk.impact === 'CRITICAL')
      .slice(0, 5) || [];

  const mainCharacters =
    analysis.characters
      ?.filter(
        (char) => char.role === 'PROTAGONIST' || char.role === 'ANTAGONIST'
      )
      .slice(0, 5) || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3}>
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
                      {t('overviewDashboard.scenes', {
                        duration: Math.round(estimatedDuration),
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

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
                      {t('overviewDashboard.characters')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

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
                      {t('overviewDashboard.locations')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor:
                        safetyLevel === 'LOW'
                          ? 'success.main'
                          : safetyLevel === 'MEDIUM'
                          ? 'warning.main'
                          : 'error.main',
                    }}
                  >
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {highRisks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('overviewDashboard.highRisks')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('overviewDashboard.sceneComplexity')}
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
              {t('overviewDashboard.locationTypes.title')}
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

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('overviewDashboard.topRisks')}
            </Typography>
            <List>
              {topRisks.length > 0 ? (
                topRisks.map((risk) => (
                  <ListItem key={risk.id} divider>
                    <ListItemIcon>
                      <WarningIcon
                        color={
                          risk.impact === 'CRITICAL' ? 'error' : 'warning'
                        }
                      />
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
                            color={
                              risk.impact === 'CRITICAL' ? 'error' : 'warning'
                            }
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={t('overviewDashboard.noRisks')} />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('overviewDashboard.mainCharacters')}
            </Typography>
            <List>
              {mainCharacters.length > 0 ? (
                mainCharacters.map((character) => (
                  <ListItem key={character.id} divider>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor:
                            character.role === 'PROTAGONIST'
                              ? 'primary.main'
                              : 'error.main',
                          width: 32,
                          height: 32,
                        }}
                      >
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
                            color={
                              character.role === 'PROTAGONIST'
                                ? 'primary'
                                : 'error'
                            }
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {t('overviewDashboard.sceneCount', {
                              count: character.totalScenes,
                            })}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={t('overviewDashboard.noMainCharacters')}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('overviewDashboard.scriptInfo.title')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('overviewDashboard.scriptInfo.genre')}
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.genre ||
                      t('overviewDashboard.scriptInfo.unknown')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('overviewDashboard.scriptInfo.tone')}
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.tone ||
                      t('overviewDashboard.scriptInfo.unknown')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('overviewDashboard.scriptInfo.pages')}
                  </Typography>
                  <Typography variant="h6">
                    {analysis.metadata?.pageCount || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('overviewDashboard.scriptInfo.readingTime')}
                  </Typography>
                  <Typography variant="h6">
                    {t('overviewDashboard.scriptInfo.readingTimeValue', {
                      time: analysis.metadata?.estimatedReadingTime || 0,
                    })}
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