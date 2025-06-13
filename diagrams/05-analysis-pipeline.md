# Analysis Pipeline Flow

This diagram demonstrates the 27-section analysis engine, LLM integration with multiple providers, and how results flow to role-based dashboards.

```mermaid
graph TD
    subgraph "Backend Orchestration"
        A[Client PDF Upload] --> B[Fastify API /analysis/upload]
        B --> C[BullMQ Queue]
        C --> D[Worker Container]
        D --> E[LangChain RAG Ingest\n(PDF → chunks → embeddings)]
        E --> F[Weaviate Vector DB]
        E --> G[MongoDB Analysis Meta]
        D --> H[LangChain Section Chains (27)]
        H --> I[LLM Providers]
    end
    
    subgraph "Real-time Status"
        C --> J[Job State /analysis/:id/status]
        D --> J
    end
    
    subgraph "Result Delivery"
        G --> K[Fastify API /analysis/:id/result]
        K --> L[Frontend Dashboards]
    end
    
    subgraph "27-Section Analysis Engine"
        H --> M[Scene Structure Analysis]
        H --> N[Character Development]
        H --> O[Location Requirements]
        H --> P[Themes & Motifs]
        H --> Q[Emotional Arcs]
        H --> R[Safety Protocols]
        H --> S[... 21 More Sections]
    end
    
    subgraph "LLM Integration"
        M --> T[LLM Service]
        N --> T
        O --> T
        P --> T
        Q --> T
        R --> T
        S --> T
        
        T --> U{Model Selection}
        U -->|OpenAI| V[GPT-4/3.5]
        U -->|Anthropic| W[Claude]
        U -->|Google| X[Gemini]
        U -->|Local| Y[Local Models]
    end
    
    subgraph "Results Processing"
        V --> Z[Response Aggregation]
        W --> Z
        X --> Z
        Y --> Z
        Z --> AA[Data Validation]
        AA --> AB[Results Storage]
        AB --> AC[Visualization Engine]
    end
    
    subgraph "Role-Based Views"
        AC --> AD[Director Dashboard]
        AC --> AE[Producer Dashboard]
        AC --> AF[Cinematographer View]
        AC --> AG[Safety Coordinator View]
    end
    
    style H fill:#e3f2fd
    style T fill:#f3e5f5
    style Z fill:#e8f5e8
    style AC fill:#fff3e0
```

## Pipeline Stages

1. **Input Processing**: PDF upload with dual extraction strategy (direct + OCR fallback)
2. **Analysis Engine**: 27-section comprehensive screenplay analysis
3. **LLM Integration**: Multi-provider support with configurable model selection
4. **Results Processing**: Aggregation, validation, and storage of analysis results
5. **Visualization**: Role-based dashboards for different film industry professionals 