import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  AttachMoney as BudgetIcon,
  ChecklistRtl as ChecklistIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Security as SafetyIcon,
} from '@mui/icons-material';

import { useCurrentAnalysis, useSelectedRole } from '@/store/analysisStore';
import { FilmRole } from '@/types/analysis';

import OverviewDashboard from '@/components/dashboards/OverviewDashboard';
import SceneVisualization from '@/components/visualizations/SceneVisualization';
import CharacterVisualization from '@/components/visualizations/CharacterVisualization';
import LocationVisualization from '@/components/visualizations/LocationVisualization';
import EmotionalArcChart from '@/components/visualizations/EmotionalArcChart';
import BudgetBreakdown from '@/components/visualizations/BudgetBreakdown';
import SafetyDashboard from '@/components/dashboards/SafetyDashboard';
import ProductionDashboard from '@/components/dashboards/ProductionDashboard';
import RelationshipNetwork from '@/components/visualizations/RelationshipNetwork';
import TechnicalRequirements from '@/components/visualizations/TechnicalRequirements';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalysisDisplay: React.FC = () => {
  const { t } = useTranslation();
  const analysis = useCurrentAnalysis();
  const selectedRole = useSelectedRole();
  const [tabValue, setTabValue] = useState(0);

  const tabsConfig = useMemo(() => {
    const baseTabs = [
      { label: t('analysisDisplay.tabs.overview'), icon: <DashboardIcon />, id: 'overview' },
      { label: t('analysisDisplay.tabs.scenes'), icon: <TimelineIcon />, id: 'scenes' },
      { label: t('analysisDisplay.tabs.characters'), icon: <PeopleIcon />, id: 'characters' },
      { label: t('analysisDisplay.tabs.locations'), icon: <LocationIcon />, id: 'locations' },
      { label: t('analysisDisplay.tabs.emotions'), icon: <PsychologyIcon />, id: 'emotions' },
      { label: t('analysisDisplay.tabs.relationships'), icon: <PeopleIcon />, id: 'relationships' },
      { label: t('analysisDisplay.tabs.production'), icon: <AnalyticsIcon />, id: 'production' },
      { label: t('analysisDisplay.tabs.safety'), icon: <SafetyIcon />, id: 'safety' },
      { label: t('analysisDisplay.tabs.budget'), icon: <BudgetIcon />, id: 'budget' },
      { label: t('analysisDisplay.tabs.technical'), icon: <AnalyticsIcon />, id: 'technical' },
    ];

    if (selectedRole === FilmRole.DIRECTOR) {
      return baseTabs.filter((tab) =>
        ['overview', 'scenes', 'characters', 'emotions', 'relationships'].includes(tab.id)
      );
    } else if (selectedRole === FilmRole.PRODUCER) {
      return baseTabs.filter((tab) =>
        ['overview', 'production', 'budget', 'safety', 'locations'].includes(tab.id)
      );
    } else if (selectedRole === FilmRole.CINEMATOGRAPHER) {
      return baseTabs.filter((tab) =>
        ['overview', 'scenes', 'locations', 'technical', 'emotions'].includes(tab.id)
      );
    } else if (selectedRole === FilmRole.SAFETY_COORDINATOR) {
      return baseTabs.filter((tab) =>
        ['overview', 'safety', 'production', 'scenes'].includes(tab.id)
      );
    }

    return baseTabs;
  }, [selectedRole, t]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ py: 8 }}
          >
            <AnalyticsIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Box textAlign="center">
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {t('analysisDisplay.noAnalysis.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('analysisDisplay.noAnalysis.subtitle')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const totalScenes = analysis.scenes?.length || 0;
  const totalCharacters = analysis.characters?.length || 0;
  const totalLocations = analysis.locations?.length || 0;
  const budgetComplexity = analysis.budget?.overallComplexity || 'UNKNOWN';
  const safetyLevel =
    analysis.safety?.overallAssessment?.overallRiskLevel || 'UNKNOWN';

  const getComplexityColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'EXTREME': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <AnalyticsIcon color="primary" sx={{ fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('analysisDisplay.header.title')}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {analysis.filename}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title={t('analysisDisplay.header.downloadTooltip')}>
                <IconButton>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('analysisDisplay.header.shareTooltip')}>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {totalScenes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('analysisDisplay.stats.scenes')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {totalCharacters}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('analysisDisplay.stats.characters')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {totalLocations}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('analysisDisplay.stats.locations')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Chip
                  label={t(`analysisDisplay.complexity.${budgetComplexity.toUpperCase()}`)}
                  color={getComplexityColor(budgetComplexity)}
                  size="small"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t('analysisDisplay.stats.budget')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Chip
                  label={t(`analysisDisplay.complexity.${safetyLevel.toUpperCase()}`)}
                  color={getComplexityColor(safetyLevel)}
                  size="small"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t('analysisDisplay.stats.safety')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Box textAlign="center" sx={{ p: 1 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  27
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('analysisDisplay.stats.sections')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {selectedRole && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={t('analysisDisplay.roleFilter.view', {
                  role: selectedRole,
                })}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Paper>

      {/* Taby z analizą */}
      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 64 }
          }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              id={`analysis-tab-${index}`}
              aria-controls={`analysis-tabpanel-${index}`}
              sx={{ fontSize: '0.875rem' }}
            />
          ))}
        </Tabs>

        {/* Zawartość tabów */}
        <TabPanel value={tabValue} index={0}>
          <OverviewDashboard analysis={analysis} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SceneVisualization scenes={analysis.scenes} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CharacterVisualization characters={analysis.characters} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <LocationVisualization locations={analysis.locations} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <EmotionalArcChart emotionalArcs={analysis.emotionalArcs} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <RelationshipNetwork relationships={analysis.relationships} />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <ProductionDashboard 
            resources={analysis.resources}
            equipment={analysis.equipment}
            checklist={analysis.checklist}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          <SafetyDashboard 
            safety={analysis.safety}
            risks={analysis.risks}
            stunts={analysis.stunts}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={8}>
          <BudgetBreakdown budget={analysis.budget} />
        </TabPanel>

        <TabPanel value={tabValue} index={9}>
          <TechnicalRequirements 
            equipment={analysis.equipment}
          />
        </TabPanel>
      </Paper>
        </Box>
  );
};

export default AnalysisDisplay; 