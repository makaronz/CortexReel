## 🏛️ **Wybrany Stack Backendowy `cortex-reel`: Skalowalny, Bezpieczny, Modułowy**

| Warstwa                   | Technologia                                       | Uzasadnienie                                                                                                                 |
| ------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Framework API**         | `Fastify`                                         | Zastępuje Express — minimalny overhead, *znacznie lepsza wydajność* (przy wsparciu dla async hooks, pluginów i WebSocketów). |
| **Walidacja**             | `Zod`                                             | Jednolita walidacja typów w całym monorepo (`apps/api`, `apps/worker-js`).                                                   |
| **Komunikacja WebSocket** | `fastify-websocket` + JSON schema router          | Stabilna komunikacja dwukierunkowa; obsługuje `diffs`, `status`, `errors`.                                                   |
| **Magazyn plików**        | `MinIO` (S3-compatible)                           | Trwałe przechowywanie PDFów + ZIPów z grafami relacji; łatwe backupowanie; działa lokalnie i w chmurze.                      |
| **Baza danych**           | `MongoDB` (główna) + `Weaviate` (wektorowa)       | Do wersjonowania analiz, przechowywania scen, wersji feedbacku i embeddingów.                                                |
| **Kolejkowanie zadań**    | `Redis Streams` + `BullMQ`                        | Przejrzysty i monitorowalny system reanaliz; kompatybilny z `apps/worker-js`.                                                |
| **Autentykacja**          | `JWT (access + refresh)`                          | Stateless, bezpieczny, token może być używany w WebSocket handshake + REST.                                                  |
| **Zarządzanie dostępem**  | `RBAC` (Viewer, Editor, Admin) + `sceneOwnership` | Umożliwia współdzieloną edycję scen, ale z kontrolą kolizji edycyjnych.                                                      |
| **Obserwowalność**        | `Pino` + `Prometheus + Grafana`                   | Structured logging + metryki backendu + system health.                                                                       |
| **Testy**                 | `Vitest` + `Supertest` + `faker`                  | Szybkie testy jednostkowe i integracyjne, typowane z TypeScript.                                                             |

---

## 🔁 **Funkcje MVP+: Obowiązkowe w Twoim Zakresie**

### 📄 Trwałe Przechowywanie PDF-ów

* Upload → MinIO → Referencja UUID → zapisana w MongoDB
* PDF dostępny do ponownej analizy, eksportu lub audytu

### 🧠 Reanalizy Po Edycji

* Zmiana w `scene.meta` lub `userFeedback` → enqueue do `BullMQ` + oznaczenie wersji
* Wersja `v3.2` może np. zawierać inne `narrativeValidation`

### 📚 Wersjonowanie Analiz

* Każda analiza → `AnalysisVersion` z UID, timestampem, hash poprzedniej wersji
* Możliwe diffowanie i rollback (czasowe, nie destrukcyjne)

### 🤝 Współdzielona Edycja Scen

* Redis Pub/Sub do komunikacji między użytkownikami
* Locking optymistyczny (edytujesz blok sceny), ostrzeżenia przy kolizji

### 💬 Real-Time Feedback via Chat

* WebSocket `/ws/chat/:jobId`
* Obsługa:

  * `text_message` → `parsed intent` → `metadata patch`
  * `apply_change` → trigger reanalysis
  * `request_status` → latest pipeline progress

---

## 🧱 Dodatkowo: Struktura Projektowa

```
apps/
├── api/                  # Fastify backend API (REST + WebSocket)
│   ├── routes/analysis/  # POST /api/analysis, GET /api/analysis/:id
│   ├── routes/chat/      # WebSocket endpoint
│   ├── services/         # SceneAnalysisService, FeedbackProcessor
│   ├── models/           # MongoDB models (Scene, AnalysisVersion, ChatLog)
│   ├── schemas/          # Zod schemas
│   └── utils/            # Prompt builders, logger, etc.
├── worker-js/            # BullMQ workers for Gemini/GPT reanalysis
├── frontend/             # React app
packages/
├── shared-types/         # Zod schemas + TypeScript interfaces
├── prompts/              # Langchain prompt templates
```

---

## 🧪 Testy i Kontrola Jakości

| Typ testu           | Narzędzia               | Zakres                                          |
| ------------------- | ----------------------- | ----------------------------------------------- |
| **Unit**            | `Vitest`                | Funkcje: diff, feedback parsing, scene patching |
| **Integration**     | `Supertest`             | API endpoints + MongoDB + Redis                 |
| **LLM chain tests** | `mocked OpenAI API`     | walidacja JSON wyników                          |
| **E2E**             | `Cypress` (opcjonalnie) | Upload → Chat → Reanaliza → Diff                |

---

## 📘 **VOLUME I – Design Bible: Modular Backend for AI-Driven Screenplay Analysis**

> ✨ *Cel:* Zdefiniować kompletną, testowalną, w pełni modularną architekturę backendową `cortex-reel` – gotową do obsługi:
>
> * wieloetapowej analizy LLM
> * czatowego feedbacku użytkownika
> * wersjonowania i reanalizy scen
> * współdzielonej edycji
> * i pełnej obserwowalności.

---

## 🗂️ **MODULE MAP: Wysokopoziomowy Plan Modułów**

| Modul                        | Cel                                            | Typ                  | Nazwa Pliku                         |
| ---------------------------- | ---------------------------------------------- | -------------------- | ----------------------------------- |
| 📥 `PdfUploadHandler`        | Obsługa uploadu pliku do MinIO                 | API Route            | `routes/analysis/upload.ts`         |
| 🧠 `ScriptAnalysisService`   | Przetwarzanie PDF → sceny → analiza Gemini/GPT | Service              | `services/ScriptAnalysisService.ts` |
| 🔀 `FeedbackProcessor`       | Parsowanie czatu i aktualizacja metadanych     | Service              | `services/FeedbackProcessor.ts`     |
| 🧾 `SceneVersionStore`       | Obsługa wersjonowania analizy scen             | MongoDB DAO          | `models/sceneVersion.ts`            |
| 💬 `ChatWebSocketHandler`    | Komunikacja w czasie rzeczywistym              | WebSocket Controller | `routes/chat/index.ts`              |
| 🧱 `AnalysisValidator`       | Walidacja JSONów Zod                           | Util                 | `utils/AnalysisValidator.ts`        |
| 🧪 `TestSuites`              | Testy jednostkowe i integracyjne               | Test                 | `tests/**/*.test.ts`                |
| 🚦 `JobQueueManager`         | Kolejkowanie i nadzór zadań                    | BullMQ Worker        | `jobs/queueManager.ts`              |
| 🔗 `PromptChainOrchestrator` | Budowanie promptów Langchain                   | Orchestrator         | `orchestrators/PromptChain.ts`      |
| 🧭 `StatusTracker`           | Śledzenie stanu zadań przez Redis              | Service              | `services/StatusTracker.ts`         |

---

## 📐 MODULE: `ScriptAnalysisService.ts`

### 🎯 Cel:

Obsługa pełnego potoku przetwarzania scenariusza PDF:

1. Pobierz PDF z MinIO
2. Podziel na sceny
3. Wyślij każdą do Gemini (technical) + GPT-4o (emotional)
4. Waliduj JSON
5. Zapisz wersje do MongoDB
6. Zapisz embeddingi do Weaviate

---

### 🧬 **Interfejs**

```ts
type AnalyzeScriptOptions = {
  jobId: string;
  pdfFileKey: string; // klucz w MinIO
  userId: string;
};

type SceneAnalysisResult = {
  sceneId: string;
  technicalAnalysis: TechnicalAnalysis;
  narrativeValidation: NarrativeValidation;
};

class ScriptAnalysisService {
  analyze(options: AnalyzeScriptOptions): Promise<SceneAnalysisResult[]>;
}
```

---

### 🧩 **Zależności**

* `MinIOClient` (pobiera plik PDF)
* `PdfChunker` (dzieli PDF na sceny)
* `GeminiClient`, `GPTClient` (LLM interfejsy)
* `AnalysisValidator` (Zod schemas)
* `SceneVersionStore` (MongoDB)
* `WeaviateClient` (embeddingi)

---

### ✅ **Zachowanie testowalne**

* `analyze()` zwraca kompletny wynik dla każdej sceny
* Błędy LLM muszą być logowane, nie rzucać `throw` (zamiast tego `Result`)

---

## 📐 MODULE: `ChatWebSocketHandler.ts`

### 🎯 Cel:

Obsługuje komunikację czatu użytkownika z backendem:

* interpretuje komendy (intencje)
* deleguje do `FeedbackProcessor`
* wysyła statusy, błędy, różnice

---

### 🧬 **WebSocket Protokół**

```ts
type ClientMessage =
  | { type: 'text_message'; content: string; sceneId?: string }
  | { type: 'request_diff'; sceneId: string };

type ServerMessage =
  | { type: 'diff'; sceneId: string; changes: Diff[] }
  | { type: 'ack'; message: string }
  | { type: 'error'; reason: string };
```

---

### 🔌 **Handler**

```ts
fastify.register(require('fastify-websocket'));

fastify.get('/ws/chat/:jobId', { websocket: true }, async (connection, req) => {
  connection.socket.on('message', (raw) => {
    const msg: ClientMessage = JSON.parse(raw.toString());
    await ChatWebSocketHandler.handle(msg, connection, req);
  });
});
```

---

## 📐 MODULE: `FeedbackProcessor.ts`

### 🎯 Cel:

* Interpretuje wiadomości użytkownika
* Wyciąga intencje: zmiana lokacji, czasu, postaci
* Modyfikuje scenę w `MongoDB`
* Wywołuje `JobQueueManager` dla reanalizy

---

### 🧬 **Funkcje**

```ts
type FeedbackInput = {
  jobId: string;
  sceneId: string;
  userId: string;
  message: string;
};

class FeedbackProcessor {
  static parseFeedback(input: FeedbackInput): Promise<SceneMetadataPatch>;
  static applyPatch(patch: SceneMetadataPatch): Promise<void>;
}
```

---

## 📐 MODULE: `SceneVersionStore.ts`

### 🎯 Cel:

Przechowywanie wszystkich wersji analizy danej sceny.
Zawiera zmiany techniczne, narracyjne i feedbackowe.

---

### 📦 **MongoDB Schema**

```ts
interface SceneVersion {
  _id: ObjectId;
  sceneId: string;
  version: number;
  technicalAnalysis: TechnicalAnalysis;
  narrativeValidation: NarrativeValidation;
  userFeedback: FeedbackEntry[];
  createdAt: ISODate;
  previousVersionHash?: string;
}
```

---

## 📐 MODULE: `PromptChainOrchestrator.ts`

### 🎯 Cel:

Zbudowanie promptów z odpowiednimi fragmentami scen + feedbackiem + schematem kontekstu.

---

### 🧬 **API**

```ts
type PromptInput = {
  sceneText: string;
  metadata: SceneMetadata;
  userEdits?: string[];
};

class PromptChainOrchestrator {
  static buildGeminiPrompt(input: PromptInput): string;
  static buildGPTPrompt(input: PromptInput): string;
}
```

---

## 🔬 TESTING STRATEGIA

### 🔹 `ScriptAnalysisService.test.ts`

* testuje scenariusz PDF z mockiem LLM
* sprawdza: chunking, Zod, wersjonowanie

### 🔹 `ChatWebSocketHandler.test.ts`

* symuluje klienta WebSocket
* testuje: diff, patch, error feedback

### 🔹 `FeedbackProcessor.test.ts`

* testuje parsowanie naturalnej wiadomości
* testuje: zmiany i walidację patcha

---

## 📦 Eksportowane Schematy

* `SceneMetadata` (shared-types)
* `TechnicalAnalysis`, `NarrativeValidation`
* `FeedbackEntry`
* `SceneVersion`
* `ZodSchemas` → `packages/shared-types/zodSchemas.ts`

---

## 🔄 Pipeline Rerun: Kompletna Kolejka

```ts
BullQueue.enqueue({
  type: 'reanalysis',
  sceneId: 'S3',
  trigger: 'userFeedback',
  sourceVersion: 4,
});
```

---

📘 **Ciąg Dalszy Nastąpi:**

W kolejnych tomach Design Bible pojawią się:

* **`JobQueueManager`** (BullMQ workers z retry i timeout)
* **`AnalysisDiffEngine`** (porównanie wersji scen)
* **`ExportService`** (JSON, CSV, GEXF, PDF)
* **`AuthModule`** (JWT, RBAC, CSRF)
* **`API Blueprint`** (OpenAPI 3.1 spec YAML)