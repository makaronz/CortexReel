# Analysis Pipeline Flow

This diagram demonstrates the 27-section analysis engine, LLM integration with multiple providers, and how results flow to role-based dashboards.

```mermaid
graph TD
    subgraph "Analysis Pipeline"
        A[PDF Upload] --> B[Text Extraction]
        B --> C{Extraction Success?}
        C -->|Yes| D[Direct Text Processing]
        C -->|No| E[OCR Fallback]
        D --> F[Text Preprocessing]
        E --> F
        F --> G[Analysis Orchestration]
    end
    
    subgraph "27-Section Analysis Engine"
        G --> H[Scene Structure Analysis]
        G --> I[Character Development]
        G --> J[Location Requirements]
        G --> K[Themes & Motifs]
        G --> L[Emotional Arcs]
        G --> M[Safety Protocols]
        G --> N[... 21 More Sections]
    end
    
    subgraph "LLM Integration"
        H --> O[LLM Service]
        I --> O
        J --> O
        K --> O
        L --> O
        M --> O
        N --> O
        
        O --> P{Model Selection}
        P -->|OpenAI| Q[GPT-4/3.5]
        P -->|Anthropic| R[Claude]
        P -->|Google| S[Gemini]
        P -->|Local| T[Local Models]
    end
    
    subgraph "Results Processing"
        Q --> U[Response Aggregation]
        R --> U
        S --> U
        T --> U
        U --> V[Data Validation]
        V --> W[Results Storage]
        W --> X[Visualization Engine]
    end
    
    subgraph "Role-Based Views"
        X --> Y[Director Dashboard]
        X --> Z[Producer Dashboard]
        X --> AA[Cinematographer View]
        X --> BB[Safety Coordinator View]
    end
    
    style G fill:#e3f2fd
    style O fill:#f3e5f5
    style U fill:#e8f5e8
    style X fill:#fff3e0
```

## Pipeline Stages

1. **Input Processing**: PDF upload with dual extraction strategy (direct + OCR fallback)
2. **Analysis Engine**: 27-section comprehensive screenplay analysis
3. **LLM Integration**: Multi-provider support with configurable model selection
4. **Results Processing**: Aggregation, validation, and storage of analysis results
5. **Visualization**: Role-based dashboards for different film industry professionals 