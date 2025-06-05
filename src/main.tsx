import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Error Boundary for better error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Site2Data v3 - Application Error
          </h1>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', textAlign: 'center' }}>
            Something went wrong while loading the application.
          </p>
          <details style={{ 
            backgroundColor: '#1e293b', 
            padding: '1rem', 
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
              Error Details
            </summary>
            <pre style={{ 
              fontSize: '0.875rem', 
              overflow: 'auto',
              color: '#f87171'
            }}>
              {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React App
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains a div with id="root"');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Hot Module Replacement for development
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Service Worker registration (for production builds)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Environment validation
if (!import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.DEV) {
  console.warn('⚠️ VITE_GEMINI_API_KEY is not set. Copy env.example to .env.local and add your API key.');
} 