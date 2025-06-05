import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { useUIState } from '@/store/analysisStore';

// Components
import LoginScreen from '@/components/LoginScreen';
import MainLayout from '@/components/MainLayout';
import FileUpload from '@/components/FileUpload';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import ProgressBar from '@/components/ProgressBar';
import HistoryPanel from '@/components/HistoryPanel';
import RoleSelector from '@/components/RoleSelector';
import ErrorDisplay from '@/components/ErrorDisplay';

// Authentication Guard
import AuthGuard from '@/components/AuthGuard';

function App() {
  const { darkMode } = useUIState();

  // Create Material-UI theme for film industry
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#2563eb' : '#1976d2',
        light: darkMode ? '#60a5fa' : '#42a5f5',
        dark: darkMode ? '#1d4ed8' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: darkMode ? '#f59e0b' : '#ff9800',
        light: darkMode ? '#fbbf24' : '#ffb74d',
        dark: darkMode ? '#d97706' : '#f57c00',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f5f5f5',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e2e8f0' : '#1a202c',
        secondary: darkMode ? '#94a3b8' : '#4a5568',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      success: {
        main: '#10b981',
      },
      info: {
        main: '#3b82f6',
      }
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
      }
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }
          },
          containedPrimary: {
            background: darkMode 
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            '&:hover': {
              background: darkMode 
                ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            }
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Box sx={{ 
          minHeight: '100vh',
          background: darkMode 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginScreen />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <AuthGuard>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardView />} />
                    <Route path="/upload" element={<FileUpload />} />
                    <Route path="/analysis" element={<AnalysisDisplay />} />
                    <Route path="/history" element={<HistoryPanel />} />
                    <Route path="/role-selector" element={<RoleSelector />} />
                  </Routes>
                </MainLayout>
              </AuthGuard>
            } />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

// Dashboard View Component
const DashboardView: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Progress Bar - shows when analyzing */}
      <ProgressBar />
      
      {/* Error Display - shows when there's an error */}
      <ErrorDisplay />
      
      {/* Main Content */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3,
        mt: 2
      }}>
        {/* Left Column - File Upload & Analysis */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FileUpload />
          <AnalysisDisplay />
        </Box>
        
        {/* Right Column - Role Selector & History */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <RoleSelector />
          <HistoryPanel />
        </Box>
      </Box>
    </Box>
  );
};

export default App; 