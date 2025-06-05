# Site2Data v3 - Professional Screenplay Analysis Platform

A comprehensive, professional screenplay analysis application with 27 analysis sections, built with React, TypeScript, and Google Gemini AI. Designed specifically for film industry professionals including directors, producers, cinematographers, and production teams.

## 🎬 Features

### Core Analysis Engine (27 Sections)
1. **Script Metadata** - Title, genre, tone, format analysis
2. **Scene Structure** - INT/EXT breakdown, locations, timing
3. **Character Details** - Roles, arcs, psychological profiles
4. **Location Analysis** - Requirements, permits, accessibility
5. **Props Management** - Inventory, importance, availability
6. **Vehicle Coordination** - Types, modifications, insurance
7. **Weapon Management** - Safety, permits, training
8. **Lighting Schemes** - Mood, equipment, complexity
9. **Difficult Scenes** - Risk assessment, alternatives
10. **Permit Requirements** - Authorities, lead times, costs
11. **Equipment Planning** - Categories, rental periods
12. **Production Risks** - Safety, weather, contingencies
13. **Character Relationships** - Network analysis, dynamics
14. **Theme Analysis** - Narrative structure, motifs
15. **Emotional Arcs** - Tension tracking, key moments
16. **Psychological Analysis** - Motivations, conflicts
17. **Resource Planning** - Crew, talent, specialist days
18. **Pacing Analysis** - Act breakdown, rhythm patterns
19. **Technical Requirements** - Camera, sound, effects
20. **Budget Analysis** - Cost drivers, risk factors
21. **Production Checklist** - Pre/post-production tasks
22. **Extra Requirements** - Background actors, casting
23. **Comprehensive Safety** - Protocols, training, emergency
24. **Intimacy Coordination** - Consent, special considerations
25. **Animal Coordination** - Trainers, welfare, permits
26. **Stunt Coordination** - Complexity, personnel, insurance
27. **Post-Production Notes** - VFX, sound, color grading

### Advanced Features
- **Multi-Strategy PDF Processing** - Direct extraction + OCR fallback
- **Real-time Progress Tracking** - Live analysis status
- **Role-Based Dashboards** - Customized views for different film roles
- **Interactive Visualizations** - Charts, graphs, network diagrams
- **Export Capabilities** - PDF, CSV, JSON, Excel formats
- **Analysis History** - Persistent storage and recall
- **Dark Mode Interface** - Film industry standard
- **Professional Authentication** - Secure access control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google Gemini API key

### Installation

1. **Clone this repository**
   ```bash
   git clone <repository-url>
   cd site2data-v3-standalone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env.local` file

5. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open application**
   - Navigate to `http://localhost:5173`
   - Login with password: `test123`

## 🛠️ Tech Stack

### Frontend Core
- **React 19** - Modern UI framework
- **TypeScript** - Type safety and development experience
- **Vite** - Fast build tool and development server
- **Material-UI v5** - Professional component library
- **Zustand** - Lightweight state management

### AI & Processing
- **Google Gemini AI** - Advanced screenplay analysis
- **PDF.js** - Direct PDF text extraction
- **Tesseract.js** - OCR fallback for scanned documents
- **React-Dropzone** - File upload interface

### Data & Visualization
- **Recharts** - Chart and graph components
- **React Force Graph** - Network relationship visualization
- **React Big Calendar** - Production scheduling
- **Date-fns** - Date manipulation utilities

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Vite PWA** - Progressive web app features

## 📁 Project Structure

```
site2data-v3-standalone/
├── src/
│   ├── components/          # React components
│   │   ├── visualizations/  # Charts and graphs
│   │   └── dashboards/      # Role-specific views
│   ├── services/           # External API services
│   │   ├── geminiService.ts # AI analysis engine
│   │   └── pdfParser.ts    # PDF processing
│   ├── store/              # State management
│   │   └── analysisStore.ts # Zustand store
│   ├── types/              # TypeScript definitions
│   │   └── analysis.ts     # Analysis data types
│   ├── utils/              # Utility functions
│   └── views/              # Page components
├── public/                 # Static assets
├── scripts/               # Build and deployment scripts
└── docs/                  # Documentation
```

## 🎯 Usage Guide

### Basic Workflow
1. **Upload Screenplay** - Drag & drop PDF file (up to 10MB)
2. **Text Extraction** - Automatic processing with OCR fallback
3. **Select Analysis Type** - Full 27-section analysis or quick modes
4. **Choose Role Filter** - Customize view for your film industry role
5. **Review Results** - Interactive sections with collapsible details
6. **Export Data** - Multiple formats for sharing and integration

### Authentication
- Default password: `test123`
- Can be customized in production environment
- Session persistence with automatic logout

### File Support
- **PDF Files** - Primary format, up to 10MB
- **Text Files** - Plain text screenplays
- **OCR Processing** - Automatic fallback for scanned documents
- **Format Detection** - Automatic screenplay structure recognition

### Analysis Modes
- **Complete Analysis** - All 27 sections (recommended)
- **Quick Summary** - Basic metadata and structure
- **Character Focus** - Character and relationship analysis
- **Production Focus** - Logistics, safety, and budget analysis
- **Custom Sections** - Select specific analysis areas

## 🎨 Customization

### Theme Configuration
The application uses a professional film industry theme with dark mode as default. Customize in `src/App.tsx`:

```typescript
const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: { main: '#2563eb' },
    // ... customize colors
  }
});
```

### Role-Based Views
Add new film industry roles in `src/types/analysis.ts`:

```typescript
export enum FilmRole {
  DIRECTOR = 'Director',
  YOUR_ROLE = 'Your Custom Role',
  // ... add more roles
}
```

### Analysis Sections
Extend or modify analysis sections in `src/services/geminiService.ts`:

```typescript
// Add new analysis method
private async analyzeYourSection(scriptText: string) {
  const prompt = `Your custom analysis prompt...`;
  return await this.analyzeWithPrompt(prompt, scriptText);
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional
VITE_APP_NAME="Your App Name"
VITE_MAX_FILE_SIZE=10485760
VITE_DEBUG_MODE=false
VITE_ENABLE_OCR=true
```

### Build Configuration
- **Development**: `npm run dev` - Hot reload, source maps
- **Production**: `npm run build` - Optimized bundle
- **Preview**: `npm run preview` - Test production build
- **Type Check**: `npm run type-check` - TypeScript validation

## 📊 Performance

### Optimization Features
- **Code Splitting** - Lazy-loaded components
- **Bundle Analysis** - Webpack bundle analyzer
- **Caching** - Service worker for offline functionality
- **Memory Management** - Efficient PDF processing
- **Progress Tracking** - Real-time analysis updates

### Recommended Specs
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB for application + analysis cache
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Network**: Stable internet for AI API calls

## 🔒 Security

### Data Handling
- **No Server Storage** - All processing client-side
- **Secure API Calls** - HTTPS only for Gemini API
- **Local Storage** - Analysis history encrypted
- **Privacy First** - No user data tracking

### Production Deployment
- Environment variable validation
- Content Security Policy headers
- HTTPS enforcement
- API key rotation support

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy dist/ folder
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper TypeScript types
4. Test thoroughly with various screenplay formats
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Component documentation
- Test coverage for new features
- Accessibility compliance (WCAG 2.1 AA)

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

### Common Issues
- **API Key**: Ensure Gemini API key is valid and has quota
- **File Upload**: Check file size (10MB limit) and format (PDF)
- **OCR Fallback**: Large files may take 30+ seconds for processing
- **Memory**: Close other browser tabs for large screenplay files

### Getting Help
- Check the documentation in `/docs` folder
- Review error messages in browser console
- Ensure all dependencies are properly installed
- Test with different screenplay samples

## 🎯 Roadmap

### Planned Features
- **Multi-language Support** - International screenplay formats
- **Collaboration Tools** - Team sharing and comments
- **Advanced Visualizations** - 3D relationship networks
- **Mobile App** - React Native companion
- **API Integration** - Production management tools
- **AI Model Training** - Custom screenplay analysis models

### Version History
- **v3.0.0** - Complete rewrite with 27 analysis sections
- **v2.x** - Basic analysis with 6 sections
- **v1.x** - Initial prototype

---

**Site2Data v3** - Transforming screenplay analysis for the modern film industry. Built with precision, designed for professionals. 