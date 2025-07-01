# CortexReel Monitoring & Observability Proposal

**Target Application:** React SPA + LangChain Backend  
**Environment:** Development-first with production scaling path  
**Focus:** Film industry workflow monitoring + AI analysis pipeline observability

---

## 🎯 Executive Summary

CortexReel jako profesjonalna aplikacja do analizy scenariuszy filmowych wymaga monitoringu dostosowanego do:
- **AI/LLM pipeline performance** (Gemini API, LangChain processing)  
- **File processing workflows** (PDF upload, OCR, analysis)
- **User experience metrics** (loading times, error rates)
- **Development efficiency** (debugging, performance optimization)

**Rekomendacja:** Implementacja 3-poziomowa - od prostego dev setup do enterprise observability.

---

## 📊 Level 1: Essential Dev Monitoring (QUICK SETUP - 30 min)

### **Target:** Local development, debugging, podstawowe metryki

#### **Frontend Monitoring**
```typescript
// public/monitor.js - Browser monitoring script
class CortexReelMonitor {
  constructor() {
    this.initErrorTracking();
    this.initPerformanceTracking();
    this.initLLMCallTracking();
  }

  initErrorTracking() {
    window.addEventListener('error', (e) => {
      this.sendLog({
        type: 'js_error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        timestamp: Date.now(),
        url: window.location.href
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.sendLog({
        type: 'promise_rejection',
        reason: e.reason?.toString(),
        timestamp: Date.now(),
        url: window.location.href
      });
    });
  }

  initPerformanceTracking() {
    // Track PDF processing times
    window.cortexreel_track_pdf = (filename, startTime) => {
      const duration = Date.now() - startTime;
      this.sendLog({
        type: 'pdf_processing',
        filename,
        duration_ms: duration,
        timestamp: Date.now()
      });
    };

    // Track analysis completion
    window.cortexreel_track_analysis = (sections, totalTime) => {
      this.sendLog({
        type: 'analysis_complete',
        sections_count: sections,
        total_time_ms: totalTime,
        timestamp: Date.now()
      });
    };
  }

  initLLMCallTracking() {
    // Override fetch for Gemini API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const isGeminiCall = url.includes('generativeai.googleapis.com');
      
      if (isGeminiCall) {
        const startTime = Date.now();
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;
          
          this.sendLog({
            type: 'gemini_api_call',
            status: response.status,
            duration_ms: duration,
            timestamp: Date.now()
          });
          
          return response;
        } catch (error) {
          this.sendLog({
            type: 'gemini_api_error',
            error: error.message,
            duration_ms: Date.now() - startTime,
            timestamp: Date.now()
          });
          throw error;
        }
      }
      
      return originalFetch(...args);
    };
  }

  sendLog(data) {
    // Send to local endpoint
    fetch('/api/monitoring/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {}); // Silent fail for monitoring
  }
}

// Initialize monitoring
new CortexReelMonitor();
```

#### **Backend Monitoring Middleware**
```typescript
// src/backend/middleware/monitoring.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';

interface LogEntry {
  timestamp: number;
  type: string;
  data: any;
  request_id?: string;
}

export class MonitoringService {
  private logFile = path.join(process.cwd(), 'logs', 'cortexreel-monitoring.log');

  async logEvent(type: string, data: any, requestId?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      type,
      data,
      request_id: requestId
    };

    // Append to log file
    await fs.appendFile(this.logFile, JSON.stringify(entry) + '\n');
  }

  // Request/Response logging middleware
  createLoggingMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      const requestId = request.headers['x-request-id'] || Math.random().toString(36);
      
      // Log request
      await this.logEvent('request_start', {
        method: request.method,
        url: request.url,
        user_agent: request.headers['user-agent'],
        ip: request.ip
      }, requestId);

      // Hook into response
      reply.addHook('onSend', async (request, reply, payload) => {
        const duration = Date.now() - startTime;
        
        await this.logEvent('request_complete', {
          method: request.method,
          url: request.url,
          status: reply.statusCode,
          duration_ms: duration,
          response_size: Buffer.byteLength(payload)
        }, requestId);
        
        return payload;
      });
    };
  }

  // LangChain processing monitoring
  async trackLangChainOperation(operation: string, metadata: any) {
    await this.logEvent('langchain_operation', {
      operation,
      ...metadata
    });
  }

  // API endpoint for frontend logs
  createFrontendLogEndpoint() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const logData = request.body as any;
      await this.logEvent('frontend_event', logData);
      reply.code(200).send({ status: 'logged' });
    };
  }
}
```

#### **Quick Setup Commands**
```bash
# Create monitoring infrastructure
mkdir -p logs
mkdir -p monitoring/dashboards

# Install lightweight monitoring dependencies  
npm install --save-dev @types/node
npm install winston rotating-file-stream

# Start monitoring
echo "🎬 CortexReel Monitoring Level 1 - ACTIVE"
```

---

## 📈 Level 2: Advanced Dev Monitoring (COMPREHENSIVE - 2 hours setup)

### **Target:** Performance optimization, detailed debugging, team collaboration

#### **Real-time Dashboard**
```typescript
// monitoring/dashboard/server.ts - Simple Express dashboard
import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';

class CortexReelDashboard {
  private app = express();
  private wss = new WebSocketServer({ port: 3001 });
  private logFile = path.join(process.cwd(), 'logs', 'cortexreel-monitoring.log');

  constructor() {
    this.setupRoutes();
    this.watchLogFile();
  }

  setupRoutes() {
    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard.html'));
    });

    // API endpoints
    this.app.get('/api/stats', async (req, res) => {
      const stats = await this.calculateStats();
      res.json(stats);
    });

    this.app.get('/api/logs', async (req, res) => {
      const logs = await this.getRecentLogs();
      res.json(logs);
    });
  }

  async calculateStats() {
    const logs = await this.getRecentLogs();
    
    const stats = {
      total_requests: logs.filter(l => l.type === 'request_complete').length,
      avg_response_time: this.calculateAvgResponseTime(logs),
      error_rate: this.calculateErrorRate(logs),
      gemini_calls: logs.filter(l => l.type === 'gemini_api_call').length,
      pdf_processed: logs.filter(l => l.type === 'pdf_processing').length,
      analysis_completed: logs.filter(l => l.type === 'analysis_complete').length
    };

    return stats;
  }

  watchLogFile() {
    fs.watchFile(this.logFile, () => {
      this.broadcastUpdate();
    });
  }

  broadcastUpdate() {
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({ type: 'log_update' }));
      }
    });
  }
}

new CortexReelDashboard();
```

#### **Performance Profiler dla LangChain**
```typescript
// src/backend/services/LangChainProfiler.ts
export class LangChainProfiler {
  private static instance: LangChainProfiler;
  private operations: Map<string, any[]> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new LangChainProfiler();
    }
    return this.instance;
  }

  startOperation(operationId: string, metadata: any) {
    const operation = {
      id: operationId,
      start_time: Date.now(),
      metadata,
      checkpoints: []
    };
    
    this.operations.set(operationId, operation);
    return operation;
  }

  checkpoint(operationId: string, checkpointName: string, data?: any) {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.checkpoints.push({
        name: checkpointName,
        timestamp: Date.now(),
        duration_from_start: Date.now() - operation.start_time,
        data
      });
    }
  }

  endOperation(operationId: string, result?: any) {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.end_time = Date.now();
      operation.total_duration = operation.end_time - operation.start_time;
      operation.result = result;
      
      // Log to monitoring
      this.logOperationComplete(operation);
      this.operations.delete(operationId);
      
      return operation;
    }
  }

  private logOperationComplete(operation: any) {
    // Send to monitoring service
    console.log(`[LANGCHAIN PROFILER] ${operation.id} completed in ${operation.total_duration}ms`);
  }
}

// Usage w LangChainRAGService
export class LangChainRAGService {
  private profiler = LangChainProfiler.getInstance();

  async analyzeScreenplayFile(filePath: string, userId?: string) {
    const operationId = `analysis_${Date.now()}`;
    const operation = this.profiler.startOperation(operationId, {
      file_path: filePath,
      user_id: userId
    });

    try {
      this.profiler.checkpoint(operationId, 'document_loading_start');
      const docs = await this.loadDocument(filePath);
      this.profiler.checkpoint(operationId, 'document_loading_complete', { docs_count: docs.length });

      this.profiler.checkpoint(operationId, 'embedding_start');
      await this.ingestToVectorStore(docs);
      this.profiler.checkpoint(operationId, 'embedding_complete');

      this.profiler.checkpoint(operationId, 'analysis_start');
      const result = await this.runAnalysis(docs);
      this.profiler.checkpoint(operationId, 'analysis_complete');

      return this.profiler.endOperation(operationId, result);
    } catch (error) {
      this.profiler.endOperation(operationId, { error: error.message });
      throw error;
    }
  }
}
```

---

## 🚀 Level 3: Production Observability (ENTERPRISE - 1 day setup)

### **Target:** Production monitoring, alerting, compliance, scaling

#### **Docker Compose dla Observability Stack**
```yaml
# docker-compose.observability.yml
version: '3.8'
services:
  # CortexReel services
  cortexreel-frontend:
    build: .
    ports:
      - "5173:5173"
    environment:
      - VITE_MONITORING_ENABLED=true
      - VITE_OTEL_ENDPOINT=http://otel-collector:4318

  cortexreel-backend:
    build: ./src/backend
    ports:
      - "3000:3000"
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - MONITORING_LOG_LEVEL=info

  # Observability stack
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.91.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./monitoring/otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC receiver
      - "4318:4318"   # OTLP HTTP receiver
    depends_on:
      - loki
      - tempo
      - prometheus

  prometheus:
    image: prom/prometheus:v2.48.0
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/loki

  tempo:
    image: grafana/tempo:2.3.0
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./monitoring/tempo.yaml:/etc/tempo.yaml
      - tempo_data:/tmp/tempo
    ports:
      - "3200:3200"   # tempo
      - "4317"        # otlp grpc

  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=cortexreel123
    volumes:
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  loki_data:
  tempo_data:
  grafana_data:
```

#### **OpenTelemetry Instrumentation**
```typescript
// src/backend/instrumentation/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Create trace exporter
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
});

// Create log exporter
const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
});

// SDK configuration
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'cortexreel-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  logRecordProcessor: logExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Too verbose for file operations
      },
    }),
  ],
});

// Initialize the SDK
sdk.start();

export default sdk;
```

#### **CortexReel-specific Metrics**
```typescript
// src/backend/metrics/cortexreel-metrics.ts
import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-otlp-grpc';

export class CortexReelMetrics {
  private meter = metrics.getMeter('cortexreel', '1.0.0');
  
  // Business metrics
  public readonly pdfProcessingDuration = this.meter.createHistogram('cortexreel_pdf_processing_duration_ms', {
    description: 'Time taken to process PDF files',
    unit: 'ms'
  });

  public readonly analysisRequestsTotal = this.meter.createCounter('cortexreel_analysis_requests_total', {
    description: 'Total number of analysis requests'
  });

  public readonly geminiApiCallsTotal = this.meter.createCounter('cortexreel_gemini_api_calls_total', {
    description: 'Total number of Gemini API calls'
  });

  public readonly analysisErrorsTotal = this.meter.createCounter('cortexreel_analysis_errors_total', {
    description: 'Total number of analysis errors'
  });

  // LangChain metrics
  public readonly langchainOperationDuration = this.meter.createHistogram('cortexreel_langchain_operation_duration_ms', {
    description: 'Duration of LangChain operations',
    unit: 'ms'
  });

  public readonly vectorStoreOperations = this.meter.createCounter('cortexreel_vector_store_operations_total', {
    description: 'Total vector store operations'
  });

  // User experience metrics
  public readonly userSessionDuration = this.meter.createHistogram('cortexreel_user_session_duration_ms', {
    description: 'User session duration',
    unit: 'ms'
  });

  // Track business events
  trackPdfProcessing(durationMs: number, success: boolean, fileSize: number) {
    this.pdfProcessingDuration.record(durationMs, {
      success: success.toString(),
      file_size_bucket: this.getFileSizeBucket(fileSize)
    });
  }

  trackAnalysisRequest(sections: number, llmModel: string) {
    this.analysisRequestsTotal.add(1, {
      sections_count: sections.toString(),
      llm_model: llmModel
    });
  }

  trackGeminiApiCall(durationMs: number, status: number, tokenCount?: number) {
    this.geminiApiCallsTotal.add(1, {
      status_code: status.toString(),
      token_bucket: tokenCount ? this.getTokenBucket(tokenCount) : 'unknown'
    });
  }

  private getFileSizeBucket(sizeBytes: number): string {
    if (sizeBytes < 1024 * 1024) return 'small'; // < 1MB
    if (sizeBytes < 5 * 1024 * 1024) return 'medium'; // < 5MB
    return 'large'; // >= 5MB
  }

  private getTokenBucket(tokens: number): string {
    if (tokens < 1000) return 'small';
    if (tokens < 10000) return 'medium';
    if (tokens < 50000) return 'large';
    return 'xlarge';
  }
}
```

---

## 🎛️ Grafana Dashboards dla CortexReel

### **1. Application Overview Dashboard**
```json
{
  "dashboard": {
    "title": "CortexReel - Application Overview",
    "panels": [
      {
        "title": "Analysis Requests per Hour",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cortexreel_analysis_requests_total[1h])",
            "legendFormat": "Requests/hour"
          }
        ]
      },
      {
        "title": "PDF Processing Performance",
        "type": "heatmap",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, cortexreel_pdf_processing_duration_ms_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Gemini API Health",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(cortexreel_gemini_api_calls_total{status_code=\"200\"}[5m]) / rate(cortexreel_gemini_api_calls_total[5m])",
            "legendFormat": "Success Rate"
          }
        ]
      }
    ]
  }
}
```

### **2. Film Industry Workflow Dashboard**
```json
{
  "dashboard": {
    "title": "CortexReel - Film Industry Insights",
    "panels": [
      {
        "title": "Script Analysis by Type",
        "type": "piechart",
        "targets": [
          {
            "expr": "cortexreel_analysis_requests_total",
            "legendFormat": "{{script_type}}"
          }
        ]
      },
      {
        "title": "Average Analysis Time by Sections",
        "type": "bargauge",
        "targets": [
          {
            "expr": "avg(cortexreel_langchain_operation_duration_ms) by (sections_count)",
            "legendFormat": "{{sections_count}} sections"
          }
        ]
      }
    ]
  }
}
```

---

## 📋 Quick Implementation Guide

### **Level 1 (30 minutes)**
```bash
# 1. Add monitoring script to public/index.html
cp monitoring/level1/monitor.js public/

# 2. Install dependencies
npm install winston rotating-file-stream

# 3. Add monitoring middleware to backend
cp monitoring/level1/monitoring.ts src/backend/middleware/

# 4. Create log directory
mkdir -p logs

# 5. Start development with monitoring
npm run dev
```

### **Level 2 (2 hours)**
```bash
# 1. Setup dashboard server
npm install express ws
cp -r monitoring/level2/* ./monitoring/

# 2. Start monitoring dashboard
cd monitoring && npm start

# 3. Open dashboard
open http://localhost:3001
```

### **Level 3 (1 day)**
```bash
# 1. Install OpenTelemetry dependencies
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node

# 2. Setup observability stack
docker-compose -f docker-compose.observability.yml up -d

# 3. Configure Grafana dashboards
./scripts/setup-grafana-dashboards.sh

# 4. Access Grafana
open http://localhost:3001 (admin/cortexreel123)
```

---

## 🎯 Rekomendacja dla CortexReel

**Start with Level 1** - implementuj podstawowy monitoring w 30 minut
**Upgrade to Level 2** gdy potrzebujesz głębszej analizy performance
**Scale to Level 3** przy przygotowaniu do produkcji lub zespołowej pracy

Każdy level zachowuje kompatybilność wsteczną i można łatwo przeprowadzić upgrade.

Chcesz żebym przygotował konkretną implementację któregoś z poziomów? 