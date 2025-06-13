import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { BullMQQueueName } from '../../constants/bullmqQueues';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
export { connection };

export function createBullQueue<T = any>(name: BullMQQueueName) {
  return new Queue<T>(name, { connection });
} 