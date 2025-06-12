# Configuration Management Sequence

This sequence diagram illustrates the step-by-step process of how users interact with the admin dashboard to configure LLM settings, save configurations, and test connections.

```mermaid
sequenceDiagram
    participant U as User
    participant AD as Admin Dashboard
    participant ACS as AdminConfigService
    participant LS as localStorage
    participant LLM as LLM Service
    participant API as External API
    
    U->>AD: Access Admin Panel
    AD->>ACS: Load Configuration
    ACS->>LS: Get cortexreel_admin_config_*
    LS-->>ACS: Return Config Data
    ACS-->>AD: Configuration Object
    AD-->>U: Display Current Settings
    
    U->>AD: Modify LLM Settings
    AD->>ACS: Update LLM Config
    ACS->>LS: Save cortexreel_admin_config_llm
    LS-->>ACS: Confirm Save
    ACS-->>AD: Success Response
    AD-->>U: Show Success Notification
    
    U->>AD: Test API Connection
    AD->>LLM: Initialize with New Config
    LLM->>API: Test Connection
    API-->>LLM: Response
    LLM-->>AD: Connection Status
    AD-->>U: Display Test Result
    
    U->>AD: Update Analysis Prompts
    AD->>ACS: Save Prompt Config
    ACS->>LS: Save cortexreel_admin_config_prompts
    LS-->>ACS: Confirm Save
    ACS-->>AD: Success Response
    AD-->>U: Show Success Notification
    
    Note over U,API: Configuration is ready for<br/>integration with analysis pipeline
```

## Sequence Flow Steps

1. **Initial Load**: User accesses admin panel, system loads existing configuration
2. **Configuration Update**: User modifies settings, system persists to localStorage
3. **Connection Testing**: System validates API connectivity with new settings
4. **Prompt Management**: User updates analysis prompts, system saves changes
5. **Integration Ready**: Configuration prepared for analysis pipeline integration 