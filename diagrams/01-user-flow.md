# CortexReel User Flow Diagram

This diagram shows the complete user journey from login through file upload, analysis, and role-based visualization, including the admin panel integration.

```mermaid
graph TD
    A[User Login] --> B[Main Dashboard]
    B --> C[File Upload]
    B --> D[Admin Panel]
    B --> E[Analysis History]
    B --> F[Role Selector]
    
    C --> G[PDF Processing]
    G --> H{Text Extraction}
    H -->|Success| I[Direct Text]
    H -->|Failed| J[OCR Fallback]
    I --> K[AI Analysis]
    J --> K
    
    K --> L[27-Section Analysis]
    L --> M[Results Storage]
    M --> N[Visualization Engine]
    N --> O[Role-Based Views]
    
    D --> P[LLM Configuration]
    D --> Q[Prompts Management]
    D --> R[App Settings]
    
    P --> S[API Key Management]
    P --> T[Model Selection]
    P --> U[Parameter Tuning]
    
    Q --> V[Scene Structure Prompt]
    Q --> W[Character Analysis Prompt]
    Q --> X[Location Analysis Prompt]
    Q --> Y[Themes Analysis Prompt]
    Q --> Z[Emotional Arcs Prompt]
    Q --> AA[Safety Analysis Prompt]
    
    R --> BB[Feature Toggles]
    R --> CC[File Size Limits]
    R --> DD[Logging Configuration]
    
    O --> EE[Director View]
    O --> FF[Producer View]
    O --> GG[Cinematographer View]
    O --> HH[Safety Coordinator View]
    
    EE --> II[Character Analysis]
    EE --> JJ[Emotional Arcs]
    FF --> KK[Budget Breakdown]
    FF --> LL[Production Dashboard]
    GG --> MM[Technical Requirements]
    GG --> NN[Location Visualization]
    HH --> OO[Safety Dashboard]
    HH --> PP[Risk Analysis]
```

## Key Flow Points

1. **Entry Point**: User authentication and main dashboard access
2. **Core Functions**: File upload, admin configuration, analysis history
3. **Processing Pipeline**: PDF → Text Extraction → AI Analysis → Results
4. **Admin Configuration**: Three-tab interface for comprehensive system setup
5. **Role-Based Output**: Specialized views for different film industry roles 