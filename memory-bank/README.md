# Memory Bank - CortexReel Standalone

This Memory Bank system provides comprehensive documentation and context for the **cortex-reel-standalone** project - a professional React TypeScript screenplay analysis platform designed for film industry professionals.

## 📖 Purpose

The AI assistant's memory resets completely between sessions. This Memory Bank serves as the **only source of truth** for understanding project context, architecture decisions, current status, and development patterns. Every AI session MUST begin by reading all Memory Bank files to ensure continuity and effective assistance.

## 📁 File Structure

### Core Documentation Files

1. **[projectbrief.md](./projectbrief.md)** - Project foundation
   - Basic project information and requirements
   - Target audience and core functionality
   - Technical constraints and goals

2. **[productContext.md](./productContext.md)** - Product vision and problems solved
   - Film industry problems addressed
   - Value proposition and user benefits
   - Competitive advantages and market position

3. **[systemPatterns.md](./systemPatterns.md)** - Technical architecture
   - Architectural patterns and design decisions
   - Component organization and data flow
   - Integration patterns and performance strategies

4. **[techContext.md](./techContext.md)** - Technology stack and setup
   - Complete technology inventory
   - Development environment configuration
   - Browser support and deployment considerations

5. **[activeContext.md](./activeContext.md)** - Current work status
   - Recently completed features and fixes
   - Current priorities and active development
   - Known issues and next steps

6. **[progress.md](./progress.md)** - Implementation tracking
   - Feature completion status
   - Technical debt and quality metrics
   - Timeline and milestone achievements

## 🎯 Project Overview

**CortexReel Standalone** is a React TypeScript Single Page Application that enables film industry professionals to upload PDF screenplays and receive comprehensive AI-powered analysis across 27 different analytical dimensions with complete administrative control.

### Key Features
- **🎯 Complete Admin Dashboard**: Three-tab configuration interface with full integration to analysis pipeline
- **🚀 MEGA PROMPT v7.0**: "MISTYCZNY ALTER EGO REŻYSERA" - 27-section comprehensive film analysis  
- **⚡ Gemini 2.5 Flash**: Upgraded AI model with 65,536 token output capacity
- **📄 PDF Processing**: Direct text extraction + OCR fallback with progress tracking
- **🎨 Professional Visualizations**: Role-based dashboards and interactive charts
- **🎬 Film Industry Focus**: Polish film industry standards and terminology
- **🤖 Automated Testing**: MCP Playwright testing suite for quality assurance

### Technology Stack
- **Frontend**: React 19 + TypeScript + Material-UI + Zustand
- **AI Integration**: Google Gemini 1.5 Pro API
- **Visualization**: Recharts library
- **Build Tool**: Vite with optimized production builds
- **File Processing**: PDF.js + Tesseract.js (OCR fallback)

## 🚨 Critical Information

### Security Concerns
- **API Key Exposure**: Gemini API key currently exposed in client bundle (HIGH PRIORITY FIX NEEDED)
- **Client-Side Processing**: All processing happens in browser (scalability limitation)

### Architecture Decisions
- **Client-Side Only**: No backend currently implemented
- **Local Storage**: State persistence using Zustand + localStorage
- **Web Workers**: Background processing for heavy operations
- **Role-Based UI**: Dynamic content filtering based on user role

### Performance Characteristics
- **Initial Load**: <3 seconds target
- **Analysis Time**: 2-5 minutes average for complete 27-section analysis
- **Memory Usage**: Stable for normal sessions (<500MB)
- **Bundle Size**: ~2.5MB gzipped

## 🛠️ Development Context

### Current Status (2025-01-16)
- **✅ ADMIN DASHBOARD → ANALYSIS PIPELINE INTEGRATION**: FULLY COMPLETED and verified
- **✅ GEMINI 2.5 FLASH + MEGA PROMPT v7.0**: Comprehensive 27-section analysis implemented
- **✅ MCP PLAYWRIGHT TESTING**: Complete automated testing suite confirming functionality
- **✅ API KEY INTEGRATION**: Resolved - previous "integration gap" was missing API key, not code issue
- **Visualization System**: Complete redesign with 10 major components functional

### Known Issues Being Tracked
1. **✅ RESOLVED: Configuration Integration** - Was falsely reported, actually working correctly
2. Large file processing performance (PDFs >5MB) - Enhancement opportunity
3. LocalStorage size limits for large analysis results - Monitoring
4. API key security risk - High priority for backend implementation

### Quality Standards
- **TypeScript**: Strict mode, 95%+ coverage
- **Component Design**: Atomic Design pattern
- **Error Handling**: Graceful degradation required
- **Performance**: Optimized for film industry workflows
- **UI/UX**: Professional appearance, dark mode primary

## 📋 Usage Protocol

### For AI Assistants

1. **ALWAYS** start each session by reading ALL Memory Bank files
2. **UNDERSTAND** current project state from `activeContext.md`
3. **REVIEW** implementation status in `progress.md`
4. **FOLLOW** established patterns documented in `systemPatterns.md`
5. **MAINTAIN** consistency with technical decisions in `techContext.md`

### For Developers

1. **READ** this README first for project overview
2. **STUDY** `systemPatterns.md` for architectural understanding
3. **CHECK** `activeContext.md` for current work context
4. **REFERENCE** `techContext.md` for setup and configuration
5. **UPDATE** Memory Bank when making significant changes

## 🔄 Update Protocol

### When to Update Memory Bank

- New architectural patterns discovered
- Significant feature implementations completed
- Major bug fixes or performance improvements
- User feedback requiring pattern changes
- Security enhancements implemented

### How to Update

1. Read ALL existing Memory Bank files
2. Identify which files need updates
3. Maintain consistency across all documents
4. Update `activeContext.md` with latest changes
5. Record lessons learned in appropriate pattern documentation

## 🎯 Success Metrics

### Technical Excellence
- TypeScript coverage: 95%+
- Component modularity: 90%+
- Error handling: Comprehensive
- Performance: Stable memory usage
- Security: Ongoing improvement (API key issue pending)

### User Experience
- Professional film industry aesthetics
- Role-based content relevance
- Interactive and informative visualizations
- Reliable PDF processing with OCR fallback
- Export capabilities for production workflows

### Feature Completeness
- ✅ PDF upload and processing with OCR fallback
- ✅ 27-section AI analysis with MEGA PROMPT v7.0
- ✅ **Complete Admin Dashboard with configuration integration**
- ✅ **Dynamic LLM model switching (Gemini 2.5 Flash)**
- ✅ **65,536 token output capacity**
- ✅ 10 major visualization components
- ✅ Role-based filtering system
- ✅ Theme switching and responsive design
- ✅ **MCP Playwright automated testing suite**

## 📞 Communication Standards

- **User Communication**: Polish language
- **Code/Documentation**: English for GitHub
- **Terminology**: Use "cortex-reel" (not "pixelpasta")
- **Tone**: Professional, appropriate for film industry
- **Technical Accuracy**: Critical - no assumptions

This Memory Bank ensures project continuity and maintains high development standards across all AI assistant sessions working on the cortex-reel-standalone project. 