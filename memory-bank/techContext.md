# Tech Context - Site2Data v3 Standalone

## Core Technologies Stack

### Frontend Framework
- **React 19.1.0** - Latest React with concurrent features
  - JSX automatic runtime
  - Error boundaries z improved error handling
  - Concurrent rendering dla better UX
  
- **TypeScript 5.7.2** - Strict typing
  - Strict mode enabled
  - Path aliases configured (`@/components/*`, `@/services/*`)
  - Experimental decorators support

### State Management
- **Zustand 4.4.0** - Lightweight alternative do Redux
  - Persist middleware dla localStorage integration
  - TypeScript-first design
  - Selective persistence z `partialize`
  - Custom selectors dla optimized re-renders

### UI & Styling
- **Material-UI 5.15.0** (@mui/material, @mui/icons-material)
  - Custom dark/light theme implementation
  - Responsive breakpoints
  - Component style overrides
  - Professional film industry color palette
  
- **Emotion** - CSS-in-JS dla Material-UI
  - Runtime styling z theme integration
  - Optimized bundle size

### Build & Development
- **Vite 6.2.0** - Modern build tool
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support
  - Environment variable handling
  - TypeScript support out-of-the-box

### AI & Processing
- **Google Generative AI 0.21.0** (@google/generative-ai)
  - Gemini 1.5 Pro model integration
  - Structured prompts dla 27 analysis sections
  - Error handling i rate limiting
  
- **PDF Processing**
  - **PDF.js 3.11.174** (pdfjs-dist) - Primary text extraction
  - **Tesseract.js 5.0.0** - OCR fallback dla scanned documents
  - Canvas API dla rendering pages do OCR

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
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional
VITE_APP_NAME="Site2Data v3"
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
- Code splitting z React Router
- Lazy loading dla visualization components
- Tree shaking dla unused code elimination
- Optimized imports (`@mui/icons-material` specific imports)

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