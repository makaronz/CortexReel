# AI Orchestration & Prompt Engineering

This document outlines the AI-related architecture for CortexReel, including prompt design, LLM workflows, and agent configurations.

## 1. Versioned Prompt Structures

The core of the analysis is the **MEGA PROMPT v7.0**, a system of 27 distinct prompts designed for comprehensive screenplay analysis. Each prompt is treated as a versioned artifact.

- **Metadata Example (`AdminConfigService` defaults):**
  ```typescript
  {
    "sceneStructure": {
      "id": "sceneStructure",
      "name": "Scene Structure Analysis",
      "version": "2.0.0",
      "description": "Analyzes Polish screenplay scenes with proper formatting recognition",
      "prompt": "Przeanalizuj scenariusz filmowy w języku polskim..."
    },
    // ... other prompts
  }
  ```
- **Current Model:** `google/gemini-2.5-flash` is the default, optimized for the 65,536 token context window.
- **Use-Case:** Each prompt corresponds to one of the 27 analysis sections, from `projectGenesis` to `postProduction`.

## 2. Reset-to-Default Behavior

The application has a robust fallback and reset mechanism for prompts, managed by `AdminConfigService`.

- **Logic:** If no custom prompts are found in `localStorage` for a given section, the `AdminConfigService` provides a hardcoded, professionally engineered default prompt.
- **User-Facing Feature:** The "🎬 Reset do Nowych Domyślnych" button in the Admin Dashboard allows users to discard their custom prompts and revert to the latest default versions at any time.

## 3. Chain-of-Thought (CoT) Prompts

While not explicitly using a formal "Chain-of-Thought" label in the prompts themselves, the underlying analysis process functions as a large-scale CoT workflow.

- **Implicit Chaining:** The execution of 27 sequential analysis prompts forms a logical chain, where the overall understanding of the script is built step-by-step.
- **Prompt Design:** Prompts like `sceneStructure` contain detailed, multi-step instructions (e.g., "1. Find every scene marker... 2. Look for 'WN.' or 'ZN.'... 3. Extract location name..."), guiding the LLM through a reasoning process.
- **Future Evolution:** LangChain implementation will formalize this into explicit chains (`LCEL`) for better observability, error handling, and modularity.

## 4. Multi-Agent Orchestration

- **Current State:** The system currently operates as a **single, highly-specialized agent**. The `geminiAnalysis.worker.ts` acts as a monolithic agent responsible for executing all 27 analysis tasks sequentially.
- **Future Vision (LangChain):** The plan is to decompose this into a multi-agent system:
  - **Orchestrator Agent:** Manages the overall analysis workflow and delegates tasks.
  - **RAG Agent:** Specialized in retrieving relevant scenes or character descriptions from the Weaviate vector database.
  - **Analysis Agent(s):** Agents specialized for specific domains (e.g., a "Safety Agent" for risk assessment, a "Budget Agent" for cost analysis).
  - **Chat Agent:** Manages the interactive chat with memory.

## 5. Token Budgeting & Context Thresholds

- **Max Context:** The system is optimized for the **65,536 token context window** of `google/gemini-2.5-flash`.
- **Token Budgeting Strategy:** The primary strategy for handling scripts that exceed the context window is **intelligent chunking**.
- **Implementation:** The `intelligentChunking` function in `geminiAnalysis.worker.ts` splits large scripts into smaller, context-aware parts before sending them to the LLM. It aims for a conservative character-to-token ratio to avoid exceeding limits.
- **Merging:** Results from multiple chunks are intelligently merged back together to form a cohesive analysis.

## 6. Agent Roles & Responsibility Delegation

- **Current Role:** `geminiAnalysis.worker.ts` has the sole responsibility for the entire analysis pipeline. It receives the script and configuration, and its single role is to return a `CompleteAnalysis` object.
- **Future Delegation:** With LangChain, responsibilities will be delegated:
  - **FastAPI Backend:** Will be responsible for receiving uploads, managing jobs, and security.
  - **BullMQ Worker:** Will be responsible for executing the LangChain pipeline asynchronously.
  - **LangChain Agents:** Will have specific, delegated analysis roles as described in the Multi-Agent Orchestration section.

## 7. Fallback Model Logic

- **Current Implementation:** The Admin Dashboard UI allows a user to *manually* select from different LLM providers (Gemini, GPT, Claude). The chosen model is then passed to the analysis worker.
- **Automatic Fallback:** There is **no automatic fallback logic** implemented yet. If an API call to the selected model fails for a reason other than a transient network error (which is handled by a retry mechanism), the analysis for that section will fail.
- **Future Enhancement:** A planned feature is to implement automatic fallback logic (e.g., if Gemini fails, try Claude) for increased resilience. This will be managed within the LangChain orchestration layer.

## 8. Output Contracts (JSON Shape & Error Codes)

- **Strict JSON Enforcement:** All prompts explicitly instruct the LLM to respond **only with valid JSON**.
- **Enforcement Mechanism:** The `sanitizeAndParseJSON` function in `geminiAnalysis.worker.ts` is the enforcement layer. It aggressively cleans and repairs the LLM's raw text output to ensure it can be parsed into a valid JavaScript object. It handles common LLM mistakes like trailing commas, unescaped quotes, and extraneous text outside the JSON block.
- **Error Codes:** The system does not use a formal system of error codes. Errors are handled via a custom `AnalysisError` interface in the worker, which classifies errors into types (`RATE_LIMIT`, `QUOTA_EXCEEDED`, `PARSING`, etc.) and determines if they are `retryable`.
- **Schema Validation (Planned):** The plan is to use **Zod** to validate the structure of the parsed JSON against predefined schemas, ensuring the final output contract is strictly met. 