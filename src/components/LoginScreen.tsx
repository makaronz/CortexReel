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
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login button clicked, password:', password.length > 0 ? '[HIDDEN]' : '[EMPTY]');
    
    setIsLoading(true);
    setError('');
    
    // Add small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simple password check
    if (password === 'test123') {
      console.log('Password correct, setting authenticated...');
      setAuthenticated(true);
      setError('');
    } else {
      console.log('Password incorrect');
      setError('Invalid password. Try "test123"');
    }
    
    setIsLoading(false);
  };

  const isButtonDisabled = !password.trim() || isLoading;

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
              CortexReel
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear error when typing
                }}
                placeholder="Enter password"
                sx={{ mb: 3 }}
                autoFocus
                helperText={`Password length: ${password.length} characters`}
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isButtonDisabled}
                sx={{ mb: 2 }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              {isButtonDisabled && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {!password.trim() ? 'Please enter the password to enable login button' : 'Processing...'}
                </Alert>
              )}
            </form>
            
            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2, display: 'block' }}>
              Demo password: <strong>test123</strong>
            </Typography>
            
            {/* Debug info */}
            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1, display: 'block', fontFamily: 'monospace' }}>
              Button enabled: {!isButtonDisabled ? 'YES' : 'NO'} | Loading: {isLoading ? 'YES' : 'NO'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginScreen; 