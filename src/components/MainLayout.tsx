import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalysisStore, useUIState, useAuth } from '@/store/analysisStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, darkMode, setSidebarOpen, toggleDarkMode } = useUIState();
  const { setAuthenticated, reset } = useAnalysisStore();
  
  const handleLogout = () => {
    setAuthenticated(false);
    reset();
    navigate('/login');
  };

  const menuItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/' },
    { icon: <UploadIcon />, text: 'Upload', path: '/upload' },
    { icon: <AnalyticsIcon />, text: 'Analysis', path: '/analysis' },
    { icon: <HistoryIcon />, text: 'History', path: '/history' },
    { icon: <PersonIcon />, text: 'Role Selector', path: '/role-selector' },
  ];

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: darkMode ? '#1e293b' : '#1976d2'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Site2Data v3 - Professional Screenplay Analysis
          </Typography>
          
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode}
                onChange={toggleDarkMode}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
              />
            }
            label=""
            sx={{ mr: 1 }}
          />
          
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}
                />
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <List>
            <ListItem>
              <ListItemText
                primary="Analysis Status"
                secondary="Ready for new upload"
                sx={{ fontSize: '0.875rem' }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 