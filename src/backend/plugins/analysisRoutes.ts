import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Queue } from 'bullmq';
import { createBullQueue } from '../utils/queueFactory';
import { AnalysisJobPayload } from '../../types/jobs';
import { analysisQueueName } from '../../constants/bullmqQueues';

interface AnalysisRoutesOpts {
  prefix?: string;
}

export const registerAnalysisRoutes: FastifyPluginAsync<AnalysisRoutesOpts> = async (
  app: FastifyInstance,
) => {
  // BullMQ queue
  const analysisQueue: Queue<AnalysisJobPayload> = createBullQueue(analysisQueueName);

  // POST /analysis/upload – multipart form {file}
  app.post<{ Body: never }>(
    '/upload',
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      // Persist temporarily to disk/minio – placeholder local tmp
      const tempDir = path.resolve('/tmp', 'uploads');
      await fs.mkdir(tempDir, { recursive: true });
      const tempPath = path.join(tempDir, `${Date.now()}-${data.filename}`);
      await fs.writeFile(tempPath, await data.toBuffer());

      // Enqueue analysis job
      const job = await analysisQueue.add('analyzeScreenplay', {
        filepath: tempPath,
        originalName: data.filename,
        userId: request.headers['x-user-id'] as string | undefined,
      });

      return { jobId: job.id };
    },
  );

  // GET /analysis/:id/status
  app.get<{ Params: { id: string } }>('/:id/status', async (request, reply) => {
    const { id } = request.params;
    const job = await analysisQueue.getJob(id);
    if (!job) return reply.code(404).send({ error: 'Job not found' });
    const state = await job.getState();
    const progress = job.progress || 0;
    return { state, progress, result: job.returnvalue ?? null };
  });

  // GET /analysis/:id/result
  app.get<{ Params: { id: string } }>('/:id/result', async (request, reply) => {
    const { id } = request.params;
    const job = await analysisQueue.getJob(id);
    if (!job) return reply.code(404).send({ error: 'Job not found' });
    if (job.finishedOn) {
      const result = await job.returnvalue;
      return { result };
    }
    return reply.code(202).send({ status: 'processing' });
  });
}; 