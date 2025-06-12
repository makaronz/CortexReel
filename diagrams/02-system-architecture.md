# CortexReel System Architecture

This diagram displays the layered architecture with Frontend, Admin Dashboard, Core Services, Data Layer, and External APIs.

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React SPA]
        B[Material-UI Components]
        C[TypeScript Interfaces]
        D[Vite Build System]
    end
    
    subgraph "Admin Dashboard"
        E[AdminDashboard.tsx]
        F[AdminConfigService.ts]
        G[LLM Configuration Tab]
        H[Prompts Management Tab]
        I[App Settings Tab]
    end
    
    subgraph "Core Services"
        J[LLM Service]
        K[PDF Processing Service]
        L[Analysis Engine]
        M[Storage Service]
    end
    
    subgraph "Data Layer"
        N[localStorage]
        O[Configuration Store]
        P[Analysis Results Store]
        Q[User Preferences Store]
    end
    
    subgraph "External APIs"
        R[OpenAI API]
        S[Anthropic API]
        T[Google AI API]
        U[Local LLM Endpoints]
    end
    
    A --> E
    E --> F
    F --> G
    F --> H
    F --> I
    
    G --> J
    H --> L
    I --> M
    
    J --> R
    J --> S
    J --> T
    J --> U
    
    F --> N
    N --> O
    N --> P
    N --> Q
    
    K --> L
    L --> P
    
    B --> A
    C --> A
    D --> A
```

## Architecture Layers

1. **Frontend Layer**: React SPA with Material-UI, TypeScript, and Vite
2. **Admin Dashboard**: Three-tab configuration interface with centralized service
3. **Core Services**: Business logic for LLM, PDF processing, analysis, and storage
4. **Data Layer**: localStorage-based persistence with organized stores
5. **External APIs**: Multiple LLM provider integrations 