# Component Hierarchy & Service Integration

This diagram details the React component structure and service layer integration, showing how the admin dashboard connects to configuration and LLM services.

```mermaid
graph LR
    subgraph "Component Hierarchy"
        A[App.tsx] --> B[MainLayout.tsx]
        B --> C[Navigation Menu]
        B --> D[Content Area]
        
        D --> E[Dashboard Views]
        D --> F[Admin Panel]
        D --> G[Analysis Results]
        
        F --> H[AdminDashboard.tsx]
        H --> I[LLM Config Tab]
        H --> J[Prompts Tab]
        H --> K[App Settings Tab]
        
        I --> L[ModelSelector]
        I --> M[APIKeyInput]
        I --> N[ParameterSliders]
        
        J --> O[PromptAccordion]
        O --> P[SceneStructure]
        O --> Q[Characters]
        O --> R[Locations]
        O --> S[Themes]
        O --> T[EmotionalArcs]
        O --> U[Safety]
        
        K --> V[FeatureToggles]
        K --> W[FileSettings]
        K --> X[LoggingConfig]
    end
    
    subgraph "Service Integration"
        Y[AdminConfigService] --> Z[Configuration Management]
        Z --> AA[localStorage Interface]
        Z --> BB[Validation Logic]
        Z --> CC[Default Values]
        
        DD[LLMService] --> EE[API Integration]
        EE --> FF[OpenAI Client]
        EE --> GG[Anthropic Client]
        EE --> HH[Google AI Client]
        EE --> II[Local Model Client]
    end
    
    H -.-> Y
    I -.-> DD
    J -.-> DD
    
    style A fill:#e1f5fe
    style H fill:#e8f5e8
    style Y fill:#f3e5f5
    style DD fill:#fff3e0
```

## Component Structure

1. **App Structure**: App.tsx → MainLayout.tsx → Content routing
2. **Admin Dashboard**: Three-tab interface with specialized components
3. **Configuration Components**: Model selectors, API inputs, parameter controls
4. **Prompt Management**: Accordion interface for six analysis sections
5. **Service Integration**: AdminConfigService and LLMService with API clients 