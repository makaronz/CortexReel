import { Worker, Job } from 'bullmq';
import { AnalysisJobPayload } from '../../types/jobs';
import { analysisQueueName } from '../../constants/bullmqQueues';
import { LangChainRAGService } from '../services/LangChainRAGService';
import { connection } from '../utils/queueFactory';

export const analysisWorker = new Worker<AnalysisJobPayload>(
  analysisQueueName,
  async (job: Job<AnalysisJobPayload>) => {
    const { filepath, originalName, userId } = job.data;
    const service = new LangChainRAGService();

    // TODO: implement method analyzeScreenplayFile
    const analysisResult = await service.analyzeScreenplayFile(filepath, {
      filename: originalName,
      userId,
    });

    return analysisResult;
  },
  { connection },
);

analysisWorker.on('completed', (job) => {
  // eslint-disable-next-line no-console
  console.log(`Analysis job ${job.id} completed`);
});

analysisWorker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`Analysis job ${job?.id} failed`, err);
}); 