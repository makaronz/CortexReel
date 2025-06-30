import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Stack,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Movie as DirectorIcon,
  Business as ProducerIcon,
  Camera as CinematographerIcon,
  Palette as DesignerIcon,
} from '@mui/icons-material';
import { FilmRole } from '@/types/analysis';
import { useSelectedRole, useAnalysisStore } from '@/store/analysisStore';

const RoleSelector: React.FC = () => {
  const { t } = useTranslation();
  const selectedRole = useSelectedRole();
  const { setSelectedRole } = useAnalysisStore();

  const roles = Object.values(FilmRole);

  const getRoleIcon = (role: FilmRole) => {
    switch (role) {
      case FilmRole.DIRECTOR:
        return <DirectorIcon />;
      case FilmRole.PRODUCER:
        return <ProducerIcon />;
      case FilmRole.CINEMATOGRAPHER:
        return <CinematographerIcon />;
      case FilmRole.PRODUCTION_DESIGNER:
      case FilmRole.COSTUME_DESIGNER:
        return <DesignerIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const prioritizedSections: { [key in FilmRole]?: string[] } = {
    [FilmRole.DIRECTOR]: ['themes', 'characters', 'emotionalArcs', 'pacing'],
    [FilmRole.PRODUCER]: ['budget', 'permits', 'resources', 'risks'],
    [FilmRole.CINEMATOGRAPHER]: ['lighting', 'locations', 'equipment', 'technical'],
    [FilmRole.SAFETY_COORDINATOR]: ['safety', 'difficultScenes', 'stunts', 'weapons'],
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonIcon />
          <Typography variant="h6">{t('roleSelector.title')}</Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('roleSelector.alert')}
        </Alert>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-select-label">{t('roleSelector.label')}</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole || ''}
            label={t('roleSelector.label')}
            onChange={(e) => setSelectedRole(e.target.value as FilmRole)}
          >
            <MenuItem value="">
              <em>{t('roleSelector.noFilter')}</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRoleIcon(role)}
                  {t(`roles.${role}` as const)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedRole && (
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                {getRoleIcon(selectedRole)}
                <Typography variant="subtitle1" color="primary">
                  {t(`roles.${selectedRole}` as const)}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {t(`roleDescriptions.${selectedRole}` as const)}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('roleSelector.prioritizedSections')}:
                </Typography>
                <Box
                  sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                >
                  {(prioritizedSections[selectedRole] || []).map((section) => (
                    <Chip
                      key={section}
                      label={t(`roleSelector.sections.${section}`)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {!(selectedRole in prioritizedSections) && (
                     <Chip label={t('roleSelector.sections.roleSpecific')} size="small" color="secondary" variant="outlined" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {!selectedRole && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('roleSelector.selectPrompt')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleSelector; 