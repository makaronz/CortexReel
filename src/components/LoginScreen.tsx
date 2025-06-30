import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/analysisStore';
import LoadingOverlay from './LoadingOverlay';

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, setAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (password === 'test123') {
      setAuthenticated(true);
      setError('');
    } else {
      setError(t('login.error.invalidPassword'));
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !password.trim() || isLoading;

  return (
    <Container maxWidth="sm">
      <LoadingOverlay loading={isLoading} message={t('login.loading.loggingIn')} />
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
              {t('login.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              {t('login.subtitle')}
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                type="password"
                label={t('login.form.passwordLabel')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear error when typing
                }}
                placeholder={t('login.form.passwordPlaceholder')}
                sx={{ mb: 3 }}
                autoFocus
                helperText={t('login.form.passwordHelper', { count: password.length })}
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isButtonDisabled}
                sx={{ mb: 2 }}
              >
                {isLoading ? t('login.form.loggingInButton') : t('login.form.loginButton')}
              </Button>
              
              {isButtonDisabled && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {!password.trim() ? t('login.alert.enterPassword') : t('login.alert.processing')}
                </Alert>
              )}
            </form>
            
            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2, display: 'block' }}>
              <span dangerouslySetInnerHTML={{ __html: t('login.demoPassword') }} />
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginScreen; 