/**
 * CortexReel Monitoring Routes Plugin
 * Provides monitoring endpoints for frontend logs and health checks
 */
import { FastifyPluginAsync } from 'fastify';
import { getMonitoringService } from '../services/MonitoringService';

const monitoringRoutes: FastifyPluginAsync = async (fastify) => {
  const monitoringService = getMonitoringService();

  // Add monitoring middleware to all routes
  fastify.addHook('preHandler', monitoringService.createLoggingMiddleware());
  fastify.addHook('onSend', monitoringService.createResponseLoggingHook());

  // Frontend log endpoint
  fastify.post('/api/monitoring/frontend-log', {
    schema: {
      body: {
        type: 'object',
        required: ['type', 'timestamp'],
        properties: {
          type: { type: 'string' },
          level: { type: 'string', enum: ['info', 'warn', 'error'] },
          timestamp: { type: 'number' },
          session_id: { type: 'string' },
          data: { type: 'object' }
        }
      }
    }
  }, monitoringService.createFrontendLogEndpoint());

  // Health check endpoint
  fastify.get('/api/monitoring/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'number' },
            stats: {
              type: 'object',
              properties: {
                total_requests: { type: 'number' },
                avg_response_time: { type: 'number' },
                error_rate: { type: 'number' },
                gemini_calls: { type: 'number' },
                pdf_processed: { type: 'number' },
                analysis_completed: { type: 'number' },
                active_sessions: { type: 'number' }
              }
            },
            recent_errors: { type: 'number' },
            log_file_size: { type: 'number' }
          }
        }
      }
    }
  }, monitoringService.createHealthEndpoint());

  // Get recent logs endpoint
  fastify.get('/api/monitoring/logs', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 100 },
          type: { type: 'string' },
          level: { type: 'string', enum: ['info', 'warn', 'error'] }
        }
      }
    }
  }, async (request, reply) => {
    const { limit = 100, type, level } = request.query as any;
    
    let logs;
    if (type) {
      logs = await monitoringService.getLogsByType(type, limit);
    } else if (level === 'error') {
      logs = await monitoringService.getErrorLogs(limit);
    } else {
      logs = await monitoringService.getRecentLogs(limit);
    }

    reply.send({
      logs,
      count: logs.length,
      timestamp: Date.now()
    });
  });

  // Get monitoring statistics
  fastify.get('/api/monitoring/stats', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            stats: {
              type: 'object',
              properties: {
                total_requests: { type: 'number' },
                avg_response_time: { type: 'number' },
                error_rate: { type: 'number' },
                gemini_calls: { type: 'number' },
                pdf_processed: { type: 'number' },
                analysis_completed: { type: 'number' },
                active_sessions: { type: 'number' }
              }
            },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const stats = monitoringService.getStats();
    
    reply.send({
      stats,
      timestamp: Date.now()
    });
  });

  // Manual tracking endpoint for custom events
  fastify.post('/api/monitoring/track', {
    schema: {
      body: {
        type: 'object',
        required: ['event', 'data'],
        properties: {
          event: { type: 'string' },
          data: { type: 'object' },
          level: { type: 'string', enum: ['info', 'warn', 'error'], default: 'info' }
        }
      }
    }
  }, async (request, reply) => {
    const { event, data, level = 'info' } = request.body as any;
    
    await monitoringService.logEvent('custom_event', {
      event,
      data
    }, level);

    reply.send({
      status: 'tracked',
      timestamp: Date.now()
    });
  });

  console.log('🎬 CortexReel Monitoring Routes - REGISTERED');
};

export default monitoringRoutes; 