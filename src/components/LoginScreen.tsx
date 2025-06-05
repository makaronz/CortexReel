import React, { useState } from 'react';
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
import { useAuth } from '@/store/analysisStore';

const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuthenticated } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check
    if (password === 'test123') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Try "test123"');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
              Site2Data v3
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Professional Screenplay Analysis Platform
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
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                sx={{ mb: 3 }}
                autoFocus
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!password}
              >
                Login
              </Button>
            </form>
            
            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2, display: 'block' }}>
              Demo password: test123
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginScreen; 