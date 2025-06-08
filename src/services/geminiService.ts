import type { CompleteAnalysis, AnalysisProgress } from '@/types/analysis';

export class GeminiAnalysisService {
  private onProgress?: (progress: AnalysisProgress) => void;
  private worker: Worker | null = null;

  constructor(progressCallback?: (progress: AnalysisProgress) => void) {
    if (progressCallback) {
      this.onProgress = progressCallback;
    }
  }

  async analyzeScreenplay(
    scriptText: string,
    filename: string,
  ): Promise<CompleteAnalysis> {
    return new Promise<CompleteAnalysis>((resolve, reject) => {
      if (this.worker) {
        console.log('Terminating previous Gemini Analysis Worker...');
        this.worker.terminate();
      }

      console.log('Creating new Gemini Analysis Worker...');
      this.worker = new Worker(new URL('../workers/geminiAnalysis.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event: MessageEvent) => {
        try {
          const { type, payload } = event.data;
          console.log('Message from Gemini Analysis Worker:', type, payload ? Object.keys(payload) : 'No payload');
          
          if (type === 'success') {
            resolve(payload as CompleteAnalysis);
            this.cleanupWorker();
          } else if (type === 'error') {
            console.error('Error message from Gemini Analysis Worker:', payload);
            reject(new Error(payload as string));
            this.cleanupWorker();
          } else if (type === 'progress') {
            if (this.onProgress) {
              this.onProgress(payload as AnalysisProgress);
            }
          }
        } catch (error) {
          console.error('Failed to process worker message:', error, event.data);
          reject(new Error('Failed to process worker message'));
          this.cleanupWorker();
        }
      };

      this.worker.onerror = (error: ErrorEvent) => {
        console.error('Unhandled error in GeminiAnalysisService (from worker):', error);
        reject(new Error(`Gemini Analysis Worker unhandled error: ${error.message || 'Unknown worker error'}`));
        this.cleanupWorker();
      };

      console.log('Posting message to Gemini Analysis Worker:', { scriptTextLength: scriptText.length, filename });
      this.worker.postMessage({ scriptText, filename });
    });
  }

  private cleanupWorker(): void {
    if (this.worker) {
      console.log('Cleaning up Gemini Analysis Worker...');
      this.worker.terminate();
      this.worker = null;
    }
  }
} 