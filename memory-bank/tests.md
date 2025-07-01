# Testing Heuristics, Edge Cases, and Fuzzing Strategy

This document outlines the testing strategies for CortexReel, focusing on heuristics for manual testing, critical edge cases to consider, and a future fuzzing strategy.

## 1. Testing Heuristics (Manual & Automated)

Given the current lack of a formal test suite, manual testing follows these heuristics. These will be automated over time.

- **The "Empty Script" Test:** Upload a blank PDF or a PDF with no parsable text. The application should handle this gracefully, display an appropriate error message, and not enter an infinite loading state.
- **The "Monster Script" Test:** Upload a very large (e.g., 500 pages) or unusually formatted screenplay. Test for performance bottlenecks, OCR fallback activation, and context window handling (`intelligentChunking`).
- **The "Garbage In, Garbage Out" Test:**
    - Provide malformed JSON responses in mock API calls to test the `sanitizeAndParseJSON` function's robustness.
    - Upload a non-screenplay PDF (e.g., an image-heavy magazine). The system should fail gracefully.
- **The "Configuration Chaos" Test:**
    - Set extreme values in the Admin Dashboard (e.g., temperature=2, maxTokens=1). The analysis should still run without crashing.
    - Delete `localStorage` keys manually to test the default fallback logic in `AdminConfigService`.
    - Inject invalid or empty prompts to ensure the system falls back to defaults.
- **The "Rapid Role Switch" Test:** Rapidly switch between user roles (Director, Producer, etc.) on the analysis dashboard to check for race conditions or state management issues.
- **The "Network Fluctuation" Test:** Use browser developer tools to simulate a slow or offline network connection during analysis to test the retry logic and error handling.

## 2. Critical Edge Cases

These edge cases must be covered in future unit, integration, and E2E tests.

### PDF Parsing & OCR:
- Screenplays with mixed languages.
- PDFs with embedded comments or annotations.
- Heavily stylized or non-standard fonts.
- Two-column script formats.
- Scanned documents with low DPI or significant skew.
- Password-protected or encrypted PDFs.
- Files that are not PDFs but have a `.pdf` extension.

### AI Analysis & Prompting:
- Scripts with no clear scene headings (e.g., `WN./ZN.`).
- Scripts where characters have the same or very similar names.
- Scenes with dozens of characters listed.
- A screenplay that is exclusively dialogue or exclusively action lines.
- Extremely short or extremely long scenes.
- LLM returning a completely empty response or a non-JSON error message.
- LLM hallucinating and creating data that doesn't exist in the script.

### State & UI:
- Canceling an analysis midway through. The worker should terminate cleanly.
- Browser being refreshed during an analysis. The application state should be partially restorable from `localStorage`.
- Running multiple analyses in rapid succession. State from the previous analysis should be fully cleared.
- Screen resolution changes during visualization rendering. Charts should resize gracefully.

## 3. Fuzzing Strategy (Future Implementation)

Fuzzing will be critical for hardening the application against unexpected inputs, particularly in the parsing and analysis stages.

- **Target 1: PDF Parsing Engine**
  - **Tool:** A custom fuzzer or a library like `pdf-fuzzer`.
  - **Method:** Generate thousands of slightly malformed PDF files by altering bytes in a valid screenplay PDF. Feed these to the `pdfParser` service to uncover potential crashes, infinite loops, or memory leaks in the PDF.js or Tesseract.js layers.

- **Target 2: LLM Response Handler**
  - **Tool:** A custom JSON fuzzer.
  - **Method:** Create a mock LLM service that returns a wide variety of malformed JSON strings to the `sanitizeAndParseJSON` function. This includes:
    - Nested structures with incorrect closing brackets.
    - Missing commas or extra trailing commas.
    - Non-string keys.
    - Mixed quote types (`'` vs `"`).
    - Injected HTML or script tags.
    - Extremely large or deeply nested JSON to test for stack overflow errors.
  - **Goal:** Ensure the sanitizer never crashes the worker and always returns a predictable (even if empty) object.

- **Target 3: Admin Configuration**
  - **Tool:** UI testing frameworks like Cypress or Playwright with randomized inputs.
  - **Method:** Write test scripts that input randomized and invalid values into all fields of the Admin Dashboard (e.g., negative numbers for `maxTokens`, strings in numeric fields, extremely long API keys) to ensure robust validation and error handling on the frontend. 