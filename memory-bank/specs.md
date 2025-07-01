# Protocol Specs & Data Contracts

This document outlines protocol specifications, data contracts, and schema evolution strategies for the CortexReel project.

## 1. REST Endpoints and Versioning

- **Current State:** The project is a client-side only application and **does not have any REST endpoints**.
- **Future Backend (Fastify):** The planned backend will expose the following RESTful API, which is currently under development. It will follow a versioning scheme (e.g., `/api/v1/...`).

  - **`POST /api/v1/analysis`**: Upload a new screenplay for analysis.
    - **Request Body:** `multipart/form-data` with the PDF file.
    - **Response:** `202 Accepted` with a `jobId`.
      ```json
      { "jobId": "uuid-v4-string" }
      ```
  - **`GET /api/v1/analysis/:jobId/status`**: Get the status of an analysis job.
    - **Response:** `200 OK` with the job status.
      ```json
      { 
        "jobId": "uuid-v4-string",
        "status": "queued" | "processing" | "completed" | "failed",
        "progress": {
          "currentSection": "Scene Structure",
          "percentage": 5
        }
      }
      ```
  - **`GET /api/v1/analysis/:jobId/result`**: Get the full analysis result.
    - **Response:** `200 OK` with the `CompleteAnalysis` JSON object.

## 2. GraphQL Schemas
- **Not applicable.** The project uses a REST-based approach for its future backend and does not use GraphQL.

## 3. WebSocket Message Formats
- **Current State:** The application uses `postMessage` between the main thread and the Web Worker, which simulates a WebSocket-like communication channel for real-time progress updates.
- **Message Structure:**
  ```typescript
  // Worker to Main Thread
  interface WorkerMessage {
    type: 'success' | 'partial_result' | 'error' | 'progress';
    payload: any;
  }
  ```
  - `success`: `payload` is the `CompleteAnalysis` object.
  - `partial_result`: `payload` is `{ section: string, data: any }`.
  - `error`: `payload` is an error message string.
  - `progress`: `payload` is an `AnalysisProgress` object.
- **Future Backend:** The backend will use a proper WebSocket connection (likely via the Fastify `@fastify/websocket` plugin) to push status updates to the client, following the same message structure.

## 4. JSON Schema Definitions (Output Contracts)

The primary data contract is the `CompleteAnalysis` object returned by the analysis pipeline. While formal JSON schemas are not yet in use, the TypeScript interfaces serve as the de-facto schema.

- **`CompleteAnalysis` Interface (abbreviated):**
  ```typescript
  interface CompleteAnalysis {
    id: string;
    filename: string;
    createdAt: string;
    metadata: { title: string; genre: string; /*...*/ };
    scenes: Scene[];
    characters: Character[];
    locations: Location[];
    // ... 24 more analysis sections
  }
  ```
- **`Scene` Interface Example:**
  ```typescript
  interface Scene {
    id: string;
    number: number;
    heading: string;
    location: string;
    timeOfDay: string;
    sceneType: 'WNĘTRZE' | 'ZEWNĘTRZE';
    description: string;
    characters: string[];
    dialogueCount: number;
    estimatedDuration: number;
    emotions: {
      tension: number;
      sadness: number;
      // ... more emotions
    };
  }
  ```
- **See `src/types/analysis.ts` for the complete set of interfaces.**

## 5. Protobuf Compatibility
- **Not applicable.** The project uses JSON for all data serialization and has no plans to use Protocol Buffers.

## 6. OpenAPI/Swagger
- **Not applicable** for the current client-side application.
- **Future Backend:** The Fastify backend will use the `@fastify/swagger` and `@fastify/swagger-ui` plugins to automatically generate an OpenAPI 3.0 specification from the route schemas. This will provide interactive API documentation.

## 7. Deprecation Lifecycle Policy
- **Not applicable** yet as the API is not public.
- **Future Policy:** Once the v1 API is public, any breaking changes will necessitate a new version (e.g., `/api/v2`). The previous version will be supported for a minimum of 6 months, with clear communication about the deprecation timeline.

## 8. Backward Compatibility Strategy
- The current system relies on `localStorage`. The `AdminConfigService` is designed to be backward-compatible by providing default values if it encounters missing or malformed data from a previous version, preventing the app from crashing after an update.
- **Future API:** The API will be versioned to ensure backward compatibility. Non-breaking changes (e.g., adding a new optional field to a response) can be introduced in the current version. Breaking changes (e.g., removing a field, changing a data type) will require a new API version.

## 9. Automated Schema Validation Tooling
- **Current State:** No automated schema validation is in place.
- **Planned Implementation:** The project will use **Zod** for schema definition and validation.
  - **Backend:** Zod schemas will be used to validate incoming request bodies and to ensure outgoing responses conform to the OpenAPI specification.
  - **Frontend:** The same Zod schemas can be used on the client to validate the data received from the backend, ensuring end-to-end type safety. 