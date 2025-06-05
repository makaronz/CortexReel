import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Grid,
  useTheme
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon 
} from '@mui/icons-material';
import { useCurrentAnalysis } from '@/store/analysisStore';

const AnalysisDisplay: React.FC = () => {
  const analysis = useCurrentAnalysis();
  const theme = useTheme();

  if (!analysis) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            No analysis available. Upload a screenplay to get started.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    { key: 'metadata', title: 'Script Metadata', data: analysis.metadata },
    { key: 'scenes', title: 'Scene Structure', data: analysis.scenes, count: analysis.scenes?.length },
    { key: 'characters', title: 'Character Details', data: analysis.characters, count: analysis.characters?.length },
    { key: 'locations', title: 'Location Analysis', data: analysis.locations, count: analysis.locations?.length },
    { key: 'props', title: 'Props Management', data: analysis.props, count: analysis.props?.length },
    { key: 'vehicles', title: 'Vehicle Coordination', data: analysis.vehicles, count: analysis.vehicles?.length },
    { key: 'weapons', title: 'Weapon Management', data: analysis.weapons, count: analysis.weapons?.length },
    { key: 'lighting', title: 'Lighting Schemes', data: analysis.lighting, count: analysis.lighting?.length },
    { key: 'difficultScenes', title: 'Difficult Scenes', data: analysis.difficultScenes, count: analysis.difficultScenes?.length },
    { key: 'permits', title: 'Permit Requirements', data: analysis.permits, count: analysis.permits?.length },
    { key: 'equipment', title: 'Equipment Planning', data: analysis.equipment, count: analysis.equipment?.length },
    { key: 'risks', title: 'Production Risks', data: analysis.risks, count: analysis.risks?.length },
    { key: 'relationships', title: 'Character Relationships', data: analysis.relationships, count: analysis.relationships?.length },
    { key: 'themes', title: 'Theme Analysis', data: analysis.themes },
    { key: 'emotionalArcs', title: 'Emotional Arcs', data: analysis.emotionalArcs },
    { key: 'psychology', title: 'Psychological Analysis', data: analysis.psychology },
    { key: 'resources', title: 'Resource Planning', data: analysis.resources },
    { key: 'pacing', title: 'Pacing Analysis', data: analysis.pacing },
    { key: 'technical', title: 'Technical Requirements', data: analysis.technical, count: analysis.technical?.length },
    { key: 'budget', title: 'Budget Analysis', data: analysis.budget },
    { key: 'checklist', title: 'Production Checklist', data: analysis.checklist },
    { key: 'extras', title: 'Extra Requirements', data: analysis.extras },
    { key: 'safety', title: 'Comprehensive Safety', data: analysis.safety },
    { key: 'intimacy', title: 'Intimacy Coordination', data: analysis.intimacy },
    { key: 'animals', title: 'Animal Coordination', data: analysis.animals },
    { key: 'stunts', title: 'Stunt Coordination', data: analysis.stunts },
    { key: 'postProduction', title: 'Post-Production Notes', data: analysis.postProduction },
  ];

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h5">
            Analysis Results
          </Typography>
          <Chip 
            label={`${analysis.filename}`}
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label="27 Sections"
            color="success"
          />
        </Stack>

        {/* Analysis Overview */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {analysis.metadata?.pageCount || 0}
                </Typography>
                <Typography variant="caption">Pages</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {analysis.scenes?.length || 0}
                </Typography>
                <Typography variant="caption">Scenes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {analysis.characters?.length || 0}
                </Typography>
                <Typography variant="caption">Characters</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {analysis.locations?.length || 0}
                </Typography>
                <Typography variant="caption">Locations</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Analysis Sections */}
        <Box>
          {sections.map((section) => (
            <Accordion key={section.key} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {section.title}
                </Typography>
                {section.count !== undefined && (
                  <Chip 
                    label={section.count}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 2, 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: 400,
                  overflow: 'auto'
                }}>
                  <pre style={{ color: theme.palette.mode === 'dark' ? '#000' : undefined }}>
                    {JSON.stringify(section.data, null, 2)}
                  </pre>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalysisDisplay; 