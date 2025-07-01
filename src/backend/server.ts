import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { registerAnalysisRoutes } from './plugins/analysisRoutes';
import monitoringRoutes from './plugins/monitoringRoutes';
import '../backend/workers/analysisProcessor';

// BullMQ & Redis will be configured in their own modules
// eslint-disable-next-line import/no-extraneous-dependencies

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  // Register core plugins
  await app.register(cors, { origin: true });
  await app.register(websocket);
  await app.register(multipart, { limits: { fileSize: 1024 * 1024 * 50 } }); // 50 MB

  // Domain-specific routes
  await app.register(registerAnalysisRoutes, { prefix: '/analysis' });
  await app.register(monitoringRoutes, { prefix: '/api/monitoring' });

  // Health-check
  app.get('/healthz', async () => ({ status: 'ok' }));

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then((app) => app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' }))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
} 