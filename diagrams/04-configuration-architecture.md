# Configuration Architecture Detail

This diagram shows the detailed structure of the AdminConfigService, storage patterns, UI components, and default configurations with their relationships.

```mermaid
graph LR
    subgraph "Configuration Management"
        A[AdminConfigService]
        B[LLMConfig Interface]
        C[PromptConfig Interface]
        D[AppConfig Interface]
    end
    
    subgraph "Storage Layer"
        E[localStorage Keys]
        F[cortexreel_admin_config_llm]
        G[cortexreel_admin_config_prompts]
        H[cortexreel_admin_config_app]
        I[cortexreel_admin_config_env]
    end
    
    subgraph "UI Components"
        J[LLM Configuration Tab]
        K[Model Selection Dropdown]
        L[API Key Input]
        M[Parameter Sliders]
        N[Prompts Management Tab]
        O[Prompt Accordions]
        P[App Settings Tab]
        Q[Feature Toggles]
    end
    
    subgraph "Default Configurations"
        R[Default LLM Settings]
        S[Default Analysis Prompts]
        T[Default App Settings]
    end
    
    A --> B
    A --> C
    A --> D
    
    A --> E
    E --> F
    E --> G
    E --> H
    E --> I
    
    J --> K
    J --> L
    J --> M
    K --> A
    L --> A
    M --> A
    
    N --> O
    O --> A
    
    P --> Q
    Q --> A
    
    R --> A
    S --> A
    T --> A
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style J fill:#e8f5e8
    style R fill:#fff3e0
```

## Configuration Components

1. **Service Layer**: AdminConfigService with TypeScript interfaces for type safety
2. **Storage Strategy**: localStorage with prefixed keys for namespace isolation
3. **UI Components**: Three-tab interface with specialized controls for each configuration type
4. **Default Values**: Comprehensive defaults for LLM settings, prompts, and app configuration
5. **Data Flow**: Bidirectional flow between UI components and storage through service layer 