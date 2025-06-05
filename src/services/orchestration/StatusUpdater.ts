// Monitors and updates job statuses via WebSocket.
// This class would listen to BullMQ job events (progress, completion, failure)
// and relay these statuses to the relevant connected user via ChatAssistantOrchestrator.

import { ChatMessage } from '../../types/ChatMessage';
import { BullMQQueueName } from '../../constants/bullmqQueues';
// import { ChatAssistantOrchestrator } from './ChatAssistantOrchestrator'; // To send messages

// Define a more specific type for job status updates if needed
export interface JobStatusUpdate {
  jobId: string;
  queueName: BullMQQueueName;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'progress';
  progress?: number; // Percentage for progress status
  message?: string; // For status messages or error details
  result?: any; // Optional result data on completion
  timestamp: string;
}

export class StatusUpdater {
  // private chatOrchestrator: ChatAssistantOrchestrator; // Injected or passed

  constructor(/* chatOrchestrator: ChatAssistantOrchestrator */) {
    // this.chatOrchestrator = chatOrchestrator;
    console.log('StatusUpdater initialized.');
    // In a backend setup, this is where you'd set up listeners for BullMQ events.
    // e.g., for each queue, listen to 'global:progress', 'global:completed', 'global:failed'.
    // this.listenToQueueEvents();
  }

  // private listenToQueueEvents(): void {
  //   Object.values(BULLMQ_QUEUES).forEach(queueName => {
  //     const queueEvents = new BullMQRealQueueEvents(queueName, { connection: { host: 'localhost', port: 6379 }});
  //     queueEvents.on('progress', ({ jobId, data }, progress) => {
  //       // Assuming job data contains userId or a way to map job to user
  //       this.sendJobStatusUpdate(jobId, queueName, 'progress', progress, data.userId);
  //     });
  //     queueEvents.on('completed', ({ jobId, returnvalue }, eventName) => {
  //       this.sendJobStatusUpdate(jobId, queueName, 'completed', 100, eventName.data.userId, undefined, returnvalue );
  //     });
  //     queueEvents.on('failed', ({ jobId, failedReason }, eventName) => {
  //       this.sendJobStatusUpdate(jobId, queueName, 'failed', 0, eventName.data.userId, failedReason);
  //     });
  //     console.log(`Listening for BullMQ events on queue "${queueName}" (simulated).`);
  //   });
  // }

  /**
   * Sends a job status update to the user via the ChatAssistantOrchestrator.
   * @param jobId The ID of the job.
   * @param queueName The name of the queue the job belongs to.
   * @param status The current status of the job.
   * @param progress Optional progress percentage (0-100).
   * @param userId The ID of the user to notify.
   * @param message Optional message or error detail.
   * @param result Optional result data on completion.
   */
  public sendJobStatusUpdate(
    jobId: string,
    queueName: BullMQQueueName,
    status: JobStatusUpdate['status'],
    userId: string, // Assuming userId is known or part of job data
    progress?: number,
    message?: string,
    result?: any
  ): void {
    const jobStatus: JobStatusUpdate = {
      jobId,
      queueName,
      status,
      progress,
      message,
      result,
      timestamp: new Date().toISOString(),
    };

    const chatMessage: ChatMessage = {
      userId: 'SYSTEM_JOB_MONITOR', // Or a specific assistant ID for system messages
      sceneId: undefined, // Job updates are typically not scene-specific unless designed so
      timestamp: jobStatus.timestamp,
      content: `Job ${jobId} (${queueName}): ${status}${progress ? ` (${progress}%)` : ''}${message ? ` - ${message}` : ''}`,
      type: 'assistant',
      // Potentially add a custom field for structured job status if ChatMessage is extended
      // customData: { jobStatus }
    };

    console.log(`Simulated: Sending job status update to user ${userId}:`, chatMessage);
    // This would call a method on ChatAssistantOrchestrator to send the message
    // this.chatOrchestrator.sendMessageToUser(userId, chatMessage);
  }

  // Example of how it might be used if a job processing function needs to report progress:
  // public reportProgress(jobId: string, queueName: BullMQQueueName, userId: string, currentProgress: number, statusMessage: string): void {
  //   this.sendJobStatusUpdate(jobId, queueName, 'progress', userId, currentProgress, statusMessage);
  // }
} 