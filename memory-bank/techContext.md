# Tech Context - CortexReel Standalone

*Last Updated: 2025-01-15T20:45:00Z*

## Core Technologies Stack

### Frontend Framework
- **React 19** - Latest stable version with concurrent features
- **TypeScript 5.3+** - Strict mode enabled for type safety
- **Vite 5.0** - Fast development server and optimized builds
- **React Router DOM 6.8** - Client-side routing with protected routes

### State Management
- **Zustand 4.4** - Lightweight state management with persistence
- **React Query/TanStack Query** - Server state management (planned)
- **localStorage API** - Client-side persistence for configuration and history
- **AdminConfigService** - Centralized configuration management service

### UI & Styling
- **Material-UI (MUI) 5.15** - Component library with custom theme
- **@mui/icons-material** - Comprehensive icon set for professional UI
- **@emotion/react & @emotion/styled** - CSS-in-JS styling solution
- **Recharts 2.8** - Interactive data visualization library

### Build & Development
- **Vite 6.2.0** - Modern build tool
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support
  - Environment variable handling
  - TypeScript support out-of-the-box

### AI & Processing
- **Google Gemini API** - AI analysis and content generation
- **Web Workers** - Background processing for heavy operations

### Data Visualization
- **Recharts 2.8.0** - React chart library
  - Line, Bar, Pie, Radar charts
  - Responsive containers
  - Custom styling z Material-UI theme
  - Interactive tooltips i legends

### File Handling
- **React Dropzone 14.2.0** - Drag & drop file uploads
  - File type validation (PDF only)
  - Size limits (10MB)
  - Error handling dla unsupported files

### Routing
- **React Router DOM 6.20.0** - Client-side routing
  - Nested routes structure
  - Authentication guards
  - Future flags enabled dla v7 compatibility

### Export & Utilities
- **File Saver 2.0.5** - Client-side file downloads
- **Papa Parse 5.4.0** - CSV parsing/generation
- **jsPDF 2.5.1** - PDF generation
- **UUID 9.0.0** - Unique identifier generation
- **Date-fns 2.30.0** - Date manipulation utilities

## Development Environment

### Package Manager
- **NPM** (Node.js 18+)
- Lock file: `package-lock.json`
- Scripts:
  - `npm run dev` - Development server (port 5173)
  - `npm run build` - Production build
  - `npm run preview` - Preview production build
  - `npm run type-check` - TypeScript validation

### Code Quality
- **ESLint** - Code linting
  - TypeScript ESLint integration
  - React-specific rules
  - Unused variables detection
  
- **Prettier** - Code formatting
  - Consistent style enforcement
  - Integration z IDE

### TypeScript Configuration
```json
{
  "target": "ES2020",
  "module": "ESNext", 
  "moduleResolution": "bundler",
  "strict": true,
  "jsx": "react-jsx"
}
```

## Environment Configuration

### Required Environment Variables
```bash
# Essential
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional
VITE_APP_NAME=CortexReel
VITE_MAX_FILE_SIZE=10485760
VITE_DEBUG_MODE=false
VITE_ENABLE_OCR=true
```

### Vite Configuration
- Path aliases dla clean imports
- Environment variable handling
- Development server z hot reload
- Optimized production builds z source maps

## Browser Support

### Minimum Requirements
- **Chrome 90+** - Full feature support
- **Firefox 88+** - Full feature support  
- **Safari 14+** - Full feature support
- **Edge 90+** - Full feature support

### Required Browser APIs
- **File API** - File upload i processing
- **Web Workers** - Background processing
- **Canvas API** - PDF rendering dla OCR
- **LocalStorage** - State persistence
- **Fetch API** - Network requests

### Progressive Enhancement
- Core functionality works bez JavaScript
- Enhanced UX z interactive features
- Graceful degradation dla older browsers

## Performance Considerations

### Bundle Optimization
- **Code Splitting:** Route-based lazy loading
- **Tree Shaking:** Unused code elimination
- **Dynamic Imports:** On-demand component loading
- **Asset Optimization:** Image compression and lazy loading

### Runtime Performance
- React.memo dla stable components
- useMemo dla expensive calculations
- Zustand selectors dla minimal re-renders
- Web Workers dla heavy processing (PDF/OCR)

### Memory Management
- Cleanup functions w useEffect
- Worker termination po completion
- Large object disposal (PDF data, canvas elements)

## Security Constraints

### Client-Side Limitations
- **API Key Exposure Risk** - Gemini API key visible w bundled code
- **CORS Limitations** - Direct API calls only do supported endpoints
- **No Server-Side Validation** - All validation client-side only

### Mitigation Strategies
- Environment variables dla configuration
- Input sanitization przed processing
- Content Security Policy headers (production)
- Rate limiting w API calls

## Deployment Considerations

### Static Hosting Requirements
- **CDN Support** - dla global distribution
- **HTTPS** - Required dla Web Workers i secure API calls
- **Gzip/Brotli** - Compression dla faster loading
- **SPA Routing** - All routes should serve index.html

### Recommended Platforms
- **Vercel** - Optimized dla React apps
- **Netlify** - Static site hosting z edge functions
- **GitHub Pages** - Free hosting dla open source
- **AWS S3 + CloudFront** - Enterprise solution

### Build Output
- **dist/** folder z optimized assets
- **Source maps** dla debugging
- **Vendor chunks** dla better caching
- **Service worker** dla offline capability

## Known Technical Limitations

### 1. **File Size Constraints**
- PDF files limited do 10MB (browser memory constraints)
- OCR processing can be slow dla large files (30+ seconds)

### 2. **API Dependencies**
- Google Gemini API quota limits
- Network dependency dla analysis
- No offline analysis capability

### 3. **Browser-Specific Issues**
- Web Workers compatibility varies
- PDF.js rendering differences across browsers
- Memory usage varies significantly

### 4. **Performance Bottlenecks**
- OCR processing single-threaded
- Large PDF rendering blocks UI
- Analysis results can exceed localStorage limits

## Future Technical Debt

### Planned Improvements
1. **Backend Integration** - Move API calls do secure backend
2. **Database Integration** - Replace localStorage z real database
3. **Progressive Web App** - Add offline functionality
4. **WebAssembly** - Faster PDF/OCR processing
5. **Service Workers** - Background analysis processing 

## Architecture Overview

### Client-Side Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                      │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├── AdminDashboard (Configuration Management)             │
│  ├── AnalysisDisplay (Results Visualization)               │
│  ├── FileUpload (PDF Processing Interface)                 │
│  └── Visualizations (Charts & Dashboards)                  │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ├── AdminConfigService (Configuration CRUD)               │
│  ├── GeminiService (AI Analysis)                           │
│  ├── PDFParserService (Text Extraction)                    │
│  └── AnalysisService (Orchestration)                       │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── Zustand Store (Application State)                     │
│  ├── localStorage (Configuration Persistence)              │
│  └── Session Storage (Temporary Data)                      │
├─────────────────────────────────────────────────────────────┤
│  Processing Layer                                           │
│  ├── Web Workers (Background Analysis)                     │
│  ├── PDF.js (Document Processing)                          │
│  └── Tesseract.js (OCR Processing)                         │
└─────────────────────────────────────────────────────────────┘
```

### Admin Configuration Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                Admin Dashboard UI                           │
│  ├── LLM Configuration Tab                                 │
│  │   ├── API Key Management                                │
│  │   ├── Model Selection (Gemini/GPT/Claude)               │
│  │   └── Parameter Tuning (Temperature, TopP, TopK)       │
│  ├── Prompts Management Tab                                │
│  │   ├── Accordion Interface (6 Analysis Prompts)         │
│  │   ├── Version Control Display                          │
│  │   └── Reset to Default Functionality                   │
│  └── App Settings Tab                                      │
│      ├── Feature Toggles (OCR, Charts, Export)            │
│      ├── File Size Limits                                 │
│      └── Logging Configuration                            │
├─────────────────────────────────────────────────────────────┤
│                AdminConfigService                          │
│  ├── getLLMConfig() / saveLLMConfig()                      │
│  ├── getPromptConfig() / savePromptConfig()                │
│  ├── getAppConfig() / saveAppConfig()                      │
│  └── getDefaultPrompts() (6 Analysis Sections)             │
├─────────────────────────────────────────────────────────────┤
│                localStorage Persistence                    │
│  ├── cortexreel_admin_config_llm                          │
│  ├── cortexreel_admin_config_prompts                      │
│  ├── cortexreel_admin_config_app                          │
│  └── cortexreel_admin_config_env                          │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Management System

### AdminConfigService Implementation
```typescript
interface LLMConfig {
  apiKey: string;
  model: string; // gemini-1.5-pro, gpt-4o, claude-3-opus, etc.
  temperature: number; // 0-2
  maxTokens: number; // 1-32768
  topP: number; // 0-1
  topK: number; // 1-100
  presencePenalty: number; // -2 to 2
  frequencyPenalty: number; // -2 to 2
}

interface PromptConfig {
  [key: string]: {
    id: string;
    name: string;
    prompt: string;
    version: string;
    description: string;
  };
}

interface AppConfig {
  appName: string;
  maxFileSize: number; // bytes
  supportedFormats: string; // comma-separated
  debugMode: boolean;
  logLevel: string; // debug, info, warn, error
  enableOCR: boolean;
  enableAdvancedCharts: boolean;
  enableExport: boolean;
  enableCollaboration: boolean;
}
```

### Default Analysis Prompts
1. **sceneStructure** - Scene analysis with emotions, complexity, technical requirements
2. **characters** - Character analysis with psychological profiles and relationships
3. **locations** - Location analysis with permits, accessibility, and costs
4. **themes** - Thematic analysis with motifs, symbols, and narrative structure
5. **emotionalArcs** - Emotional journey tracking with tension/sadness/hope metrics
6. **safety** - Comprehensive safety analysis with risk assessment protocols

### localStorage Strategy
- **Key Prefix:** `cortexreel_admin_config_`
- **Data Format:** JSON serialization
- **Fallback Strategy:** Default configurations when localStorage is empty
- **Future Migration:** Prepared for backend API integration

## Development Environment

### Local Development Setup
```bash
# Node.js version requirement
node --version  # 18.0.0 or higher

# Package manager
npm --version   # 9.0.0 or higher

# Development server
npm run dev     # Starts Vite dev server on localhost:5173

# Build process
npm run build   # Creates optimized production build
npm run preview # Preview production build locally
```

### Environment Variables
```bash
# .env.local (development)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_NAME=CortexReel
VITE_MAX_FILE_SIZE=10485760

# .env.production (production)
VITE_GEMINI_API_KEY=production_api_key
VITE_API_BASE_URL=https://api.cortexreel.com
```

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── dashboards/      # Dashboard-specific components
│   ├── visualizations/  # Chart and graph components
│   ├── AuthGuard.tsx    # Route protection
│   ├── FileUpload.tsx   # File processing interface
│   ├── LoginScreen.tsx  # Authentication UI
│   └── MainLayout.tsx   # Application layout
├── services/            # Business logic services
│   ├── AdminConfigService.ts  # Configuration management
│   ├── GeminiService.ts      # AI analysis service
│   ├── PDFParserService.ts   # Document processing
│   └── AnalysisService.ts    # Analysis orchestration
├── store/               # State management
│   └── analysisStore.ts # Zustand store configuration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── views/               # Page-level components
│   └── AdminDashboard.tsx    # Admin configuration interface
├── workers/             # Web Worker implementations
└── App.tsx             # Main application component
```

## API Integration

### Google Gemini API
- **Model Support:** gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
- **Authentication:** API key-based (currently client-side)
- **Rate Limiting:** Built-in retry mechanisms with exponential backoff
- **Response Format:** Structured JSON for analysis results
- **Configuration:** Dynamic model switching via admin dashboard

### Future API Integrations
- **OpenAI GPT Models:** gpt-4o, gpt-4o-mini
- **Anthropic Claude:** claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Backend Proxy:** Secure API key management
- **Configuration API:** Backend endpoints for admin settings

## Testing Strategy

### Current Testing Status
- **Unit Tests:** Not implemented (planned)
- **Integration Tests:** Not implemented (planned)
- **E2E Tests:** Not implemented (planned)
- **Manual Testing:** Comprehensive manual testing performed

### Planned Testing Implementation
```typescript
// Jest + React Testing Library
describe('AdminDashboard', () => {
  test('loads configuration on mount', async () => {
    // Test configuration loading
  });
  
  test('saves LLM configuration', async () => {
    // Test configuration persistence
  });
  
  test('validates input parameters', () => {
    // Test input validation
  });
});

// Cypress E2E Tests
describe('Admin Configuration Flow', () => {
  it('should configure LLM settings', () => {
    // Test complete admin workflow
  });
});
```

## Deployment Configuration

### Development Deployment
- **Local Server:** Vite dev server (localhost:5173)
- **Hot Reload:** Instant updates during development
- **Source Maps:** Full debugging support
- **Environment:** Development environment variables

### Production Deployment (Planned)
- **Static Hosting:** Netlify, Vercel, or AWS S3
- **CDN Distribution:** Global content delivery
- **Environment Variables:** Production API keys and configuration
- **Performance Monitoring:** Error tracking and analytics

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          admin: ['./src/views/AdminDashboard.tsx'],
        },
      },
    },
  },
});
```

## Browser Compatibility

### Supported Browsers
- **Chrome:** 90+ (recommended)
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+

### Required Browser Features
- **ES2020 Support:** Modern JavaScript features
- **Web Workers:** Background processing
- **File API:** File upload and processing
- **localStorage:** Data persistence
- **Fetch API:** HTTP requests

### Polyfills & Fallbacks
- **PDF.js:** Cross-browser PDF processing
- **Tesseract.js:** Universal OCR support
- **Material-UI:** Consistent styling across browsers
- **React:** Cross-browser component rendering

## Future Technical Roadmap

### Short Term (Next Month)
- **Configuration Integration** - Connect admin settings to application behavior
- **Schema Validation** - Zod validation for configurations and API responses
- **Enhanced Error Handling** - Better user feedback and error recovery
- **Performance Optimization** - Bundle size reduction and memory management

### Medium Term (Next Quarter)
- **Backend Integration** - Node.js/Express server with database
- **API Security** - Secure proxy for external API calls
- **Advanced Configuration** - More sophisticated configuration options
- **Testing Implementation** - Comprehensive test suite

### Long Term (Next Year)
- **Multi-User Support** - Team-based configuration management
- **Real-time Collaboration** - WebSocket-based live updates
- **Mobile Application** - React Native or PWA implementation
- **Enterprise Features** - Advanced security and compliance features 