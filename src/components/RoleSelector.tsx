import React from 'react';
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
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Movie as DirectorIcon,
  Business as ProducerIcon,
  Camera as CinematographerIcon,
  Palette as DesignerIcon
} from '@mui/icons-material';
import { FilmRole } from '@/types/analysis';
import { useSelectedRole, useAnalysisStore } from '@/store/analysisStore';

const RoleSelector: React.FC = () => {
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

  const getRoleDescription = (role: FilmRole) => {
    switch (role) {
      case FilmRole.DIRECTOR:
        return 'Focus on creative vision, character arcs, and story flow';
      case FilmRole.PRODUCER:
        return 'Budget analysis, scheduling, and resource planning';
      case FilmRole.CINEMATOGRAPHER:
        return 'Lighting, camera angles, and visual storytelling';
      case FilmRole.PRODUCTION_DESIGNER:
        return 'Set design, locations, and visual environment';
      case FilmRole.COSTUME_DESIGNER:
        return 'Character costumes, wardrobe, and period accuracy';
      case FilmRole.SCRIPT_SUPERVISOR:
        return 'Continuity, timeline, and scene coordination';
      case FilmRole.FIRST_AD:
        return 'Scheduling, logistics, and production coordination';
      case FilmRole.SECOND_AD:
        return 'Talent management, extras, and daily logistics';
      case FilmRole.SOUND_ENGINEER:
        return 'Audio recording, sound design, and acoustics';
      case FilmRole.SAFETY_COORDINATOR:
        return 'Risk assessment, safety protocols, and insurance';
      case FilmRole.STUNT_COORDINATOR:
        return 'Action sequences, stunts, and physical effects';
      case FilmRole.VFX_SUPERVISOR:
        return 'Visual effects, post-production, and digital assets';
      case FilmRole.GAFFER:
        return 'Lighting equipment, electrical, and power distribution';
      case FilmRole.KEY_GRIP:
        return 'Camera support, rigging, and equipment setup';
      default:
        return 'Customized analysis for your specific role';
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonIcon />
          <Typography variant="h6">Role-Based Analysis</Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          Select your role to customize the analysis display and prioritize relevant sections.
        </Alert>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-select-label">Your Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole || ''}
            label="Your Role"
            onChange={(e) => setSelectedRole(e.target.value as FilmRole)}
          >
            <MenuItem value="">
              <em>All Sections (No Filter)</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRoleIcon(role)}
                  {role}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedRole && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {getRoleIcon(selectedRole)}
                <Typography variant="subtitle1" color="primary">
                  {selectedRole}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {getRoleDescription(selectedRole)}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Prioritized sections:
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedRole === FilmRole.DIRECTOR && (
                    <>
                      <Chip label="Themes" size="small" color="primary" variant="outlined" />
                      <Chip label="Characters" size="small" color="primary" variant="outlined" />
                      <Chip label="Emotional Arcs" size="small" color="primary" variant="outlined" />
                      <Chip label="Pacing" size="small" color="primary" variant="outlined" />
                    </>
                  )}
                  {selectedRole === FilmRole.PRODUCER && (
                    <>
                      <Chip label="Budget" size="small" color="primary" variant="outlined" />
                      <Chip label="Permits" size="small" color="primary" variant="outlined" />
                      <Chip label="Resources" size="small" color="primary" variant="outlined" />
                      <Chip label="Risks" size="small" color="primary" variant="outlined" />
                    </>
                  )}
                  {selectedRole === FilmRole.CINEMATOGRAPHER && (
                    <>
                      <Chip label="Lighting" size="small" color="primary" variant="outlined" />
                      <Chip label="Locations" size="small" color="primary" variant="outlined" />
                      <Chip label="Equipment" size="small" color="primary" variant="outlined" />
                      <Chip label="Technical" size="small" color="primary" variant="outlined" />
                    </>
                  )}
                  {selectedRole === FilmRole.SAFETY_COORDINATOR && (
                    <>
                      <Chip label="Safety" size="small" color="primary" variant="outlined" />
                      <Chip label="Difficult Scenes" size="small" color="primary" variant="outlined" />
                      <Chip label="Stunts" size="small" color="primary" variant="outlined" />
                      <Chip label="Weapons" size="small" color="primary" variant="outlined" />
                    </>
                  )}
                  {!selectedRole.match(/(DIRECTOR|PRODUCER|CINEMATOGRAPHER|SAFETY_COORDINATOR)/) && (
                    <Chip label="Role-specific filtering" size="small" color="secondary" variant="outlined" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {!selectedRole && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Select a role above to see customized analysis sections
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleSelector; 