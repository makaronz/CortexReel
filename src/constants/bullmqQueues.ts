// Defines constants for BullMQ queue names used in the system.
// This ensures consistency when referring to queues across different modules.

export const BULLMQ_QUEUES = {
  FULL_ANALYSIS: 'fullAnalysis',
  PARTIAL_VALIDATION: 'partialValidation',
  EMOTION_RECHECK: 'emotionRecheck',
  ANALYSIS_UPLOAD: 'analysisUpload',
  // Add other queue names as the system evolves
  // e.g., WEAVIATE_INDEXING: 'weaviateIndexing'
} as const;

// Type for queue names to ensure type safety
export type BullMQQueueName = typeof BULLMQ_QUEUES[keyof typeof BULLMQ_QUEUES];

export const analysisQueueName = BULLMQ_QUEUES.ANALYSIS_UPLOAD; 