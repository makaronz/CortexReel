# Data Flow Architecture

This diagram presents four parallel flows: general data flow, configuration flow, analysis flow, and state management, showing how they interconnect.

```mermaid
graph TB
    subgraph "Data Flow Architecture"
        A[User Input] --> B[Frontend Components]
        B --> C[Service Layer]
        C --> D[Processing Engine]
        D --> E[Storage Layer]
        E --> F[Visualization Layer]
        F --> G[User Interface]
    end
    
    subgraph "Configuration Flow"
        H[Admin Dashboard] --> I[AdminConfigService]
        I --> J[localStorage Persistence]
        J --> K[Configuration Validation]
        K --> L[Service Integration]
        L --> M[Runtime Application]
    end
    
    subgraph "Analysis Flow"
        N[PDF Document] --> O[Text Extraction]
        O --> P[Content Preprocessing]
        P --> Q[LLM Analysis Request]
        Q --> R[External API Call]
        R --> S[Response Processing]
        S --> T[Result Aggregation]
        T --> U[Data Visualization]
    end
    
    subgraph "State Management"
        V[User Actions] --> W[Component State]
        W --> X[Context Providers]
        X --> Y[Global State]
        Y --> Z[Persistent Storage]
        Z --> AA[State Hydration]
        AA --> BB[UI Updates]
    end
    
    B -.-> H
    C -.-> I
    D -.-> Q
    E -.-> Z
    F -.-> BB
    
    style A fill:#ffebee
    style H fill:#e8f5e8
    style N fill:#e3f2fd
    style V fill:#fff3e0
```

## Flow Interconnections

1. **General Data Flow**: User input through processing to visualization
2. **Configuration Flow**: Admin settings through validation to runtime application
3. **Analysis Flow**: Document processing through LLM analysis to visualization
4. **State Management**: User actions through global state to UI updates
5. **Cross-Flow Integration**: Dotted lines show how flows interconnect at key points 