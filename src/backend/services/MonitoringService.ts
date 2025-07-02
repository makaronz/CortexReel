/**
 * CortexReel Backend Monitoring Service - Level 1
 * Handles frontend logs, request tracking, and business metrics
 */
import fs from 'fs/promises';
import path from 'path';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface LogEntry {
  timestamp: number;
  type: string;
  level: 'info' | 'warn' | 'error';
  data: any;
  request_id?: string;
  session_id?: string;
  user_agent?: string;
  ip?: string;
}

export interface MonitoringStats {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  gemini_calls: number;
  pdf_processed: number;
  analysis_completed: number;
  active_sessions: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

export class MonitoringService {
  private logFile: string;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 50;
  private flushInterval: NodeJS.Timeout;
  private stats: {
    requests: { count: number; totalTime: number; errors: number };
    geminiCalls: number;
    pdfProcessed: number;
    analysisCompleted: number;
    activeSessions: Set<string>;
  };

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'cortexreel-monitoring.log');
    this.stats = {
      requests: { count: 0, totalTime: 0, errors: 0 },
      geminiCalls: 0,
      pdfProcessed: 0,
      analysisCompleted: 0,
      activeSessions: new Set()
    };

    // Flush buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, 30000);

    // Ensure log directory exists
    this.ensureLogDirectory();
    
    console.log('🎬 CortexReel Backend Monitor Level 1 - ACTIVE');
  }

  private async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  async logEvent(type: string, data: any, level: 'info' | 'warn' | 'error' = 'info', requestId?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      type,
      level,
      data,
      request_id: requestId
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.bufferSize) {
      await this.flushBuffer();
    }

    // Update stats based on event type
    this.updateStats(entry);
  }

  private updateStats(entry: LogEntry) {
    switch (entry.type) {
      case 'request_complete':
        this.stats.requests.count++;
        this.stats.requests.totalTime += entry.data.duration_ms || 0;
        if (entry.data.status >= 400) {
          this.stats.requests.errors++;
        }
        break;
      
      case 'gemini_api_call':
        this.stats.geminiCalls++;
        break;
      
      case 'pdf_processing':
        this.stats.pdfProcessed++;
        break;
      
      case 'analysis_complete':
        this.stats.analysisCompleted++;
        break;
      
      case 'frontend_event':
        if (entry.data.session_id) {
          this.stats.activeSessions.add(entry.data.session_id);
        }
        break;
    }
  }

  private async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    try {
      const logLines = this.logBuffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.appendFile(this.logFile, logLines);
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to flush monitoring buffer:', error);
    }
  }

  // Request/Response logging middleware
  createLoggingMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      const requestId = (request.headers['x-request-id'] as string) || 
                       (request.headers['x-monitoring-request-id'] as string) || 
                       this.generateRequestId();
      
      // Add request ID to headers
      reply.header('x-request-id', requestId);
      
      // Log request start
      await this.logEvent('request_start', {
        method: request.method,
        url: request.url,
        user_agent: request.headers['user-agent'] as string,
        ip: request.ip,
        headers: this.sanitizeHeaders(request.headers)
      }, 'info', requestId);

      // Store timing data for response logging
      (request as any).monitoringStartTime = startTime;
      (request as any).monitoringRequestId = requestId;
    };
  }

  // Response logging hook (to be used with Fastify hooks)
  createResponseLoggingHook() {
    return async (request: any, reply: any, payload: any) => {
      const startTime = (request as any).monitoringStartTime;
      const requestId = (request as any).monitoringRequestId;
      
      if (startTime && requestId) {
        const duration = Date.now() - startTime;
        
        await this.logEvent('request_complete', {
          method: request.method,
          url: request.url,
          status: reply.statusCode,
          duration_ms: duration,
          response_size: Buffer.byteLength(payload || ''),
          content_type: reply.getHeader('content-type') as string
        }, reply.statusCode >= 400 ? 'warn' : 'info', requestId);
      }
      
      return payload;
    };
  }

  private sanitizeHeaders(headers: any) {
    const sanitized: any = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Frontend log endpoint
  createFrontendLogEndpoint() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const logData = request.body as any;
        
        // Validate log data
        if (!logData.type || !logData.timestamp) {
          return reply.code(400).send({ 
            error: 'Invalid log data - missing required fields' 
          });
        }

        // Add request context
        const enrichedData = {
          ...logData,
          ip: request.ip,
          user_agent: request.headers['user-agent']
        };

        await this.logEvent('frontend_event', enrichedData, logData.level || 'info');
        
        reply.code(200).send({ 
          status: 'logged',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error processing frontend log:', error);
        reply.code(500).send({ 
          error: 'Failed to process log entry' 
        });
      }
    };
  }

  // LangChain operation tracking
  async trackLangChainOperation(operation: string, metadata: any, requestId?: string) {
    await this.logEvent('langchain_operation', {
      operation,
      ...metadata
    }, 'info', requestId);
  }

  // PDF processing tracking
  async trackPdfProcessing(filename: string, duration: number, success: boolean, error?: string, requestId?: string) {
    await this.logEvent('pdf_processing', {
      filename,
      duration_ms: duration,
      success,
      error
    }, success ? 'info' : 'error', requestId);
  }

  // Analysis tracking
  async trackAnalysis(filename: string, sections: number, duration: number, success: boolean, error?: string, requestId?: string) {
    await this.logEvent('analysis_complete', {
      filename,
      sections,
      duration_ms: duration,
      success,
      error
    }, success ? 'info' : 'error', requestId);
  }

  // Gemini API tracking
  async trackGeminiCall(url: string, duration: number, status: number, tokenCount?: number, requestId?: string) {
    await this.logEvent('gemini_api_call', {
      url,
      duration_ms: duration,
      status,
      token_count: tokenCount
    }, status >= 400 ? 'warn' : 'info', requestId);
  }

  // Get monitoring statistics
  getStats(): MonitoringStats {
    const avgResponseTime = this.stats.requests.count > 0
      ? this.stats.requests.totalTime / this.stats.requests.count
      : 0;

    const errorRate = this.stats.requests.count > 0 
      ? (this.stats.requests.errors / this.stats.requests.count) * 100 
      : 0;

    const mem = process.memoryUsage().rss / (1024 * 1024);
    const cpu = process.cpuUsage();
    const cpuPercent = (((cpu.user + cpu.system) / 1000) / (process.uptime() * 1000)) * 100;

    return {
      total_requests: this.stats.requests.count,
      avg_response_time: Math.round(avgResponseTime),
      error_rate: Math.round(errorRate * 100) / 100,
      gemini_calls: this.stats.geminiCalls,
      pdf_processed: this.stats.pdfProcessed,
      analysis_completed: this.stats.analysisCompleted,
      active_sessions: this.stats.activeSessions.size,
      memory_usage_mb: Math.round(mem * 100) / 100,
      cpu_usage_percent: Math.round(cpuPercent * 100) / 100
    };
  }

  // Get recent logs
  async getRecentLogs(limit: number = 100): Promise<LogEntry[]> {
    try {
      const logContent = await fs.readFile(this.logFile, 'utf-8');
      const lines = logContent.trim().split('\n').filter(line => line.trim());
      const recentLines = lines.slice(-limit);
      
      return recentLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Failed to read recent logs:', error);
      return [];
    }
  }

  // Get logs by type
  async getLogsByType(type: string, limit: number = 50): Promise<LogEntry[]> {
    const allLogs = await this.getRecentLogs(1000);
    return allLogs.filter(log => log.type === type).slice(-limit);
  }

  // Get error logs
  async getErrorLogs(limit: number = 50): Promise<LogEntry[]> {
    const allLogs = await this.getRecentLogs(1000);
    return allLogs.filter(log => log.level === 'error').slice(-limit);
  }

  // Health check endpoint
  createHealthEndpoint() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = this.getStats();
      const recentErrors = await this.getErrorLogs(10);
      
      reply.send({
        status: 'healthy',
        timestamp: Date.now(),
        stats,
        recent_errors: recentErrors.length,
        log_file_size: await this.getLogFileSize()
      });
    };
  }

  private async getLogFileSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.logFile);
      return stats.size;
    } catch {
      return 0;
    }
  }

  private generateRequestId(): string {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  async shutdown() {
    clearInterval(this.flushInterval);
    await this.flushBuffer();
    console.log('🎬 CortexReel Backend Monitor - SHUTDOWN');
  }
}

// Singleton instance
let monitoringService: MonitoringService | null = null;

export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService();
  }
  return monitoringService;
}

export function shutdownMonitoringService() {
  if (monitoringService) {
    monitoringService.shutdown();
    monitoringService = null;
  }
} 