# CortexReel Architecture Diagrams

This directory contains comprehensive architectural diagrams for the CortexReel screenplay analysis system. These diagrams document the current implementation including the recently completed admin dashboard and show integration points for future development.

## Diagram Overview

### 1. [User Flow Diagram](./01-user-flow.md)
**Purpose**: Complete user journey from login to role-based analysis results  
**Key Features**: Admin panel integration, 27-section analysis, role-based views  
**Status**: Current implementation with admin dashboard complete

### 2. [System Architecture](./02-system-architecture.md)
**Purpose**: Layered architecture showing all system components  
**Key Features**: Frontend, Admin Dashboard, Core Services, Data Layer, External APIs  
**Status**: Admin dashboard layer fully implemented

### 3. [Configuration Sequence](./03-configuration-sequence.md)
**Purpose**: Step-by-step configuration management process  
**Key Features**: localStorage persistence, API testing, prompt management  
**Status**: Complete sequence implemented

### 4. [Configuration Architecture](./04-configuration-architecture.md)
**Purpose**: Detailed configuration system structure  
**Key Features**: AdminConfigService, TypeScript interfaces, three-tab UI  
**Status**: Fully implemented with localStorage persistence

### 5. [Analysis Pipeline](./05-analysis-pipeline.md)
**Purpose**: 27-section analysis engine and LLM integration  
**Key Features**: Multi-provider LLM support, OCR fallback, role-based output  
**Status**: Core pipeline exists, admin configuration integration pending

### 6. [Data Flow Architecture](./06-data-flow-architecture.md)
**Purpose**: Four parallel data flows and their interconnections  
**Key Features**: Configuration flow, analysis flow, state management  
**Status**: Configuration flow complete, integration points identified

### 7. [Component Hierarchy](./07-component-hierarchy.md)
**Purpose**: React component structure and service integration  
**Key Features**: Three-tab admin interface, service layer connections  
**Status**: Component hierarchy complete, service integration ready

## Current Implementation Status

### ✅ Completed Features
- **Admin Dashboard**: Three-tab Material-UI interface (LLM Config, Prompts, App Settings)
- **Configuration Management**: AdminConfigService with localStorage persistence
- **Polish UI**: Professional film industry aesthetics with Polish language
- **Navigation Integration**: Seamless admin panel access from main navigation
- **Default Configurations**: Comprehensive defaults for all six analysis sections
- **Type Safety**: Full TypeScript interfaces for all configuration types

### 🔄 Next Phase: Configuration Integration
- Connect admin settings to analysis pipeline behavior
- Dynamic LLM model switching implementation
- Prompt configuration integration with analysis engine
- API key security migration from localStorage to backend

### 🔮 Future Enhancements
- Backend API integration for secure configuration storage
- Multi-user configuration management
- Real-time configuration validation
- Advanced prompt versioning and rollback

## Technical Architecture Highlights

### Configuration Persistence Strategy
- **localStorage Keys**: `cortexreel_admin_config_*` with domain separation
- **Service Layer**: Centralized AdminConfigService for all configuration operations
- **Default Fallbacks**: Comprehensive default configurations for first-time users
- **Migration Ready**: Prepared for backend API integration

### Admin Dashboard Design
- **Three-Tab Interface**: Logical separation of LLM, Prompts, and App settings
- **Material-UI Components**: Professional interface with sliders, switches, accordions
- **Polish Language**: User preference for film industry professionals
- **Validation**: Input validation with immediate feedback via Snackbar notifications

### Integration Architecture
- **Service Abstraction**: AdminConfigService provides clean interface for configuration access
- **Type Safety**: TypeScript interfaces ensure configuration consistency
- **Future-Proof**: Design supports both localStorage and backend API persistence

## Usage Notes

These diagrams serve multiple purposes:
1. **Documentation**: Current system architecture and implementation
2. **Development Guide**: Clear integration points for next development phase
3. **Onboarding**: New team members can understand system structure
4. **Planning**: Visual reference for future feature development

## Viewing Diagrams

All diagrams use Mermaid syntax and can be viewed in:
- GitHub (native Mermaid support)
- VS Code with Mermaid extension
- Any Markdown viewer with Mermaid support
- Mermaid Live Editor (https://mermaid.live)

## Maintenance

These diagrams should be updated when:
- New major features are implemented
- Architecture changes significantly
- Integration points are modified
- New services or components are added

Last Updated: Current as of admin dashboard implementation completion 