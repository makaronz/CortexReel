import Fastify from 'fastify';
import cors from '@fastify/cors';
import monitoringRoutes from './plugins/monitoringRoutes.js';

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  // Register core plugins
  await app.register(cors, { origin: true });

  // Only monitoring routes for now to isolate the issue
  await app.register(monitoringRoutes, { prefix: '/api/monitoring' });

  // Health-check
  app.get('/healthz', async () => ({ status: 'ok' }));

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then((app) => app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' }))
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('🎬 CortexReel Backend Server (Minimal) - STARTED on port 3001');
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to start minimal server:', err);
      process.exit(1);
    });
} 