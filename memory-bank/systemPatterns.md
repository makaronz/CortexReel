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

## 🎯 Admin Dashboard → Analysis Pipeline Integration Pattern ✅ **COMPLETE**
**Status:** FULLY IMPLEMENTED and VERIFIED through automated MCP Playwright testing

**Architecture Flow:**
```
Admin Dashboard → AdminConfigService → GeminiService → Worker → Analysis Pipeline
      ↓                   ↓                ↓             ↓           ↓
Polish UI        localStorage     postMessage()    config    Dynamic Processing
```

**Implementation Pattern:**
```typescript
// AdminConfigService loads configuration
const llmConfig = AdminConfigService.getLLMConfig();
const promptConfig = AdminConfigService.getPromptConfig();

// GeminiService passes to worker
this.worker.postMessage({
  scriptText,
  filename,
  llmConfig,     // ✅ Working: Dynamic model switching
  promptConfig   // ✅ Working: Custom prompts
});

// Worker applies configuration dynamically
const model = genAI.getGenerativeModel({ 
  model: llmConfig.model,               // google/gemini-2.5-flash
  generationConfig: {
    temperature: llmConfig.temperature,  // User-defined parameters
    maxOutputTokens: llmConfig.maxTokens // 65,536 for Gemini 2.5 Flash
  }
});
```

**Key Discovery:** Previous "integration gap" was actually missing API key, not architectural issue. The integration was working correctly from the beginning.

## 🚀 MEGA PROMPT v7.0 Analysis Pattern ✅ **IMPLEMENTED**
**"MISTYCZNY ALTER EGO REŻYSERA" - Comprehensive 27-Section Film Analysis**

**Enhanced Gemini 2.5 Flash Configuration:**
```typescript
const llmConfig = {
  model: 'google/gemini-2.5-flash',  // Upgraded for speed + capacity
  maxTokens: 65536,                  // Maximum output for complex analysis
  temperature: 0.7,                  // Balanced creativity/consistency
  topP: 0.95,                        // Enhanced response diversity
  topK: 64                           // Optimized token selection
};
```

**27-Section Analysis Architecture:**
```
1. projectGenesis - Film concept and vision
2. filmicVisionSensibility - Artistic direction  
3. metadata - Technical specifications
4. scenes - Polish scene analysis (WN./ZN./PL. detection)
5. characterMonographs - Deep character studies
6. thematicResonance - Theme and motif analysis
7. worldBuildingElements - Setting and universe
8. artDepartmentVisionBoardKeywords - Visual design
9. productionStrategyInsights - Production planning
10. postProductionBlueprint - Post-production workflow
... [17 additional sections covering all aspects of film production]
```

**Polish Film Industry Integration:**
- **Scene Recognition**: Advanced WN./ZN./PL. (interior/exterior/location) parsing
- **Industry Terminology**: Professional Polish film vocabulary
- **Production Protocols**: European film production standards
- **Safety Compliance**: Polish workplace safety regulations

## 🤖 MCP Playwright Automated Testing Pattern ✅ **IMPLEMENTED**
**Comprehensive End-to-End Integration Verification**

**Testing Architecture:**
```typescript
// Automated Admin Dashboard Testing
browserbase_navigate() → Admin Panel Access
browserbase_click() → Configuration Tab Navigation  
browserbase_type() → API Key Input Testing
browserbase_click() → "Reset do Nowych Domyślnych" Testing
browserbase_get_text() → Configuration Verification
```

**Verification Checkpoints:**
1. **Navigation Testing**: Admin panel accessibility and routing
2. **Configuration Reset**: Default settings restoration functionality
3. **Model Switching**: Dynamic model change verification (google/gemini-2.5-flash)
4. **Token Limits**: Max tokens configuration (65,536) validation
5. **Prompt Loading**: MEGA PROMPT v7.0 availability confirmation
6. **API Key Management**: Secure storage and retrieval testing
7. **localStorage Persistence**: Configuration survival across sessions

**Critical Discovery Pattern:**
- **False Positive Issues**: Automated testing revealed "integration gaps" were actually missing test data
- **Architecture Validation**: Confirmed AdminConfigService → Worker pipeline was already functional
- **End-to-End Confidence**: Complete verification of configuration integration chain

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

## Pattern Graveyard

This section documents architectural patterns that were considered but ultimately rejected, along with the reasoning for their exclusion. This is crucial for preventing the re-evaluation of unsuitable solutions.

### **Rejected Pattern: Server-Side Rendering (SSR) for Analysis Results**
- **Description:** An initial architectural approach considered generating the 27-section analysis report on a backend server (e.g., using Node.js with a templating engine) and delivering a complete, static HTML page to the user.
- **Reason for Rejection:**
    - **Lack of Interactivity:** SSR would have resulted in a static, non-interactive report. The core value proposition of CortexReel lies in its dynamic, role-based dashboards with interactive charts and real-time filtering, which are best implemented in a client-side SPA.
    - **Poor User Experience:** Users would have to wait for the entire, massive report to be generated and loaded. The current SPA approach allows for progressive loading, showing results as they become available from the analysis worker.
    - **Increased Server Load:** Generating large, complex reports on the server for each user would be resource-intensive and would not scale well. The current client-side/worker approach offloads this processing to the user's machine.
    - **Architectural Complexity:** Integrating interactive client-side components with a server-rendered page (hydration) would have introduced unnecessary complexity compared to a pure SPA architecture.
- **Chosen Alternative:** A full Single Page Application (SPA) architecture using React, with analysis performed in a Web Worker and results rendered dynamically on the client. This provides a superior, interactive user experience and a more scalable model. 