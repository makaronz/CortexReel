# System Patterns - CortexReel Standalone

## Architektura Ogólna

### Typ Aplikacji: Single Page Application (SPA)
- **Framework:** React 19 + TypeScript  
- **State Management:** Zustand z persistence middleware
- **UI Library:** Material-UI v5 z custom theme
- **Build Tool:** Vite dla fast development i optimized production builds

### Client-Side Architecture Pattern
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Business Logic  │    │  Data Layer     │
│  (Components)   │◄──►│   (Services)     │◄──►│  (Store/API)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
       │                         │                       │
       ▼                         ▼                       ▼
   Material-UI           Gemini Service              Zustand Store
   Components            PDF Parser                 localStorage
   Recharts              Web Workers                Session State
```

## Kluczowe Wzorce Projektowe

### 1. **Web Worker Pattern dla Heavy Processing**
- **Problem:** PDF parsing i OCR blokują main thread
- **Rozwiązanie:** Dedicated Web Workers
- **Implementacja:** 
  - `geminiAnalysis.worker.ts` - analiza AI w tle
  - `pdfParser.ts` - przygotowany do przeniesienia do Worker
  - Message passing z progress updates

### 2. **Multi-Strategy Pattern dla PDF Processing**
- **Primary Strategy:** Bezpośrednia ekstrakcja tekstu (PDF.js)
- **Fallback Strategy:** OCR z Tesseract.js dla skanowanych dokumentów
- **Quality Validation:** Heurystyki do oceny sukcesu ekstrakcji
```typescript
async parseFile(file: File): Promise<ParsedContent> {
  const directResult = await this.extractTextDirect(file);
  if (this.isExtractionSuccessful(directResult.text)) {
    return { ...directResult, extractionMethod: 'DIRECT' };
  }
  const ocrResult = await this.extractTextOCR(file);
  return { ...ocrResult, extractionMethod: 'OCR' };
}
```

### 3. **Role-Based View Pattern**
- **Problem:** Różne role filmowe potrzebują różnych informacji
- **Rozwiązanie:** Dynamic tab filtering based on selected role
- **Implementacja:**
```typescript
const tabsConfig = useMemo(() => {
  if (selectedRole === FilmRole.DIRECTOR) {
    return baseTabs.filter(tab => 
      ['overview', 'scenes', 'characters', 'emotions'].includes(tab.id)
    );
  }
  // ... other roles
}, [selectedRole]);
```

### 4. **Progress Tracking Pattern**
- **Real-time Updates:** WebSocket-style message passing między Workers a UI
- **Granular Progress:** Per-section progress dla 27 analiz
- **User Feedback:** Visual progress bars z estimated time remaining

### 5. **Persistence Strategy Pattern**
- **Zustand Persistence:** Selective persistence z `partialize`
- **Session Data:** Temporary state (current analysis, progress)  
- **Historical Data:** Long-term storage (analysis history, user preferences)
```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'cortex-reel-analysis-store',
    partialize: (state) => ({
      isAuthenticated: state.isAuthenticated,
      analysisHistory: state.analysisHistory,
      // ... only persistent fields
    })
  }
)
```

## Komponentowa Architektura

### 1. **Atomic Design Pattern**
- **Atoms:** Basic UI elements (Chips, Buttons, Progress bars)
- **Molecules:** Card components, Form controls  
- **Organisms:** Complex components (AnalysisDisplay, Visualizations)
- **Templates:** Layout components (MainLayout)
- **Pages:** Route-level components (Dashboard, Analysis views)

### 2. **Container/Presentational Pattern**
- **Containers:** Components z business logic i state management
  - `AnalysisDisplay` - główny container dla wyników
  - `FileUpload` - zarządzanie upload flow
- **Presentational:** Pure UI components
  - Visualization components (charts, graphs)
  - Dashboard components (cards, stats)

### 3. **Compound Components Pattern**
- **TabPanel System:** Reusable tab infrastructure
- **Expandable Lists:** Consistent expand/collapse behavior
- **Filter Controls:** Standardized filtering across components

## Data Flow Patterns

### 1. **Unidirectional Data Flow**
```
User Action → Service Call → Worker Processing → Store Update → UI Re-render
```

### 2. **Event-Driven Architecture**
- File upload triggers parsing
- Parsing completion triggers analysis  
- Analysis progress updates UI in real-time
- Analysis completion triggers result rendering

### 3. **Optimistic Updates**
- UI immediately reflects user actions
- Background validation i error handling
- Rollback mechanism dla failed operations

## Error Handling Patterns

### 1. **Graceful Degradation**
- OCR fallback gdy direct extraction fails
- Default values gdy AI analysis incomplete
- Progressive enhancement dla advanced features

### 2. **Error Boundaries**
- React Error Boundaries na poziomie głównych komponentów
- Graceful error handling w Workers
- User-friendly error messages

### 3. **Retry Mechanisms**
- Automatic retry dla network failures
- Manual retry dla user-initiated actions
- Exponential backoff dla rate limiting

## Performance Patterns

### 1. **Lazy Loading**
- Dynamic imports dla visualization components
- Code splitting na route level
- Lazy initialization dla heavy dependencies

### 2. **Memoization Strategy**
- React.useMemo dla expensive calculations
- React.memo dla stable components  
- Zustand selectors dla optimized re-renders

### 3. **Resource Management**
- Memory cleanup w Web Workers
- Automatic cleanup dla cancelled operations
- Efficient data structures dla large analysis results

## Security Patterns

### 1. **Client-Side Environment Variables**
- Vite env variable handling dla API keys
- Runtime validation dla required configuration
- Development vs Production configurations

### 2. **Input Validation**
- File type i size validation
- Content sanitization before processing
- Safe parsing dla AI responses

### 3. **Safe Execution Context**
- Web Workers dla isolated processing
- Sandboxed iframe dla untrusted content (future)
- CSP headers dla production deployment

## Integration Patterns

### 1. **External API Integration**
- Google Gemini AI z error handling i rate limiting
- Structured prompts dla consistent responses
- Response validation z Zod schemas (planned)

### 2. **Browser API Integration**
- File API dla drag & drop
- Web Workers API dla background processing
- localStorage API z Zustand integration

### 3. **Third-party Library Integration**
- PDF.js dla document processing
- Tesseract.js dla OCR
- Recharts dla data visualization
- Material-UI z custom theming 

## Configuration Integration Pattern
- Admin dashboard settings (LLM, prompts, app config) are passed to the analysis pipeline via worker message, replacing hardcoded defaults.
- Worker uses config for all analysis sections, enabling dynamic model switching and prompt customization.

## Backend Monorepo Pattern
- Structure: apps/api (Fastify backend), apps/worker (job processing), apps/frontend (React SPA), packages/shared-types, packages/database-schemas.
- Enables shared types, modular services, and scalable deployment.

## Semantic Search Pattern
- Weaviate used for vector embeddings and semantic search of screenplay scenes.
- MongoDB stores structured analysis data, MinIO for file storage, Redis for pub/sub, BullMQ for job queues.
- **LangChain** orchestrates retrieval, prompt chaining, and LLM calls, enabling hybrid search (vector + keyword), context-aware analysis, and multi-step reasoning.

## LangChain Orchestration Pattern
- All AI analysis flows (scene, character, theme, etc.) are implemented as LangChain "chains":
  - Document loaders ingest scripts and metadata.
  - Text splitters chunk documents for granular retrieval.
  - Embeddings generated via Gemini/OpenAI/Claude.
  - Retrievers perform hybrid search (vector + keyword).
  - Prompt templates are versioned and dynamic, loaded per analysis section.
  - Chains combine retrieval, prompt, and LLM call, with validation and fallback.
- Enables modular, testable, and extensible AI pipelines.
- Future: LangChain agents for tool use, multi-hop reasoning, and collaborative workflows. 