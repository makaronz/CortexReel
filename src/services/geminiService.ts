import type { CompleteAnalysis, AnalysisProgress } from '@/types/analysis';
import { AdminConfigService } from './AdminConfigService';

export class GeminiAnalysisService {
  private onProgress?: (progress: AnalysisProgress) => void;
  private onPartialResult?: (section: string, data: any) => void;
  private worker: Worker | null = null;

  constructor(
    progressCallback?: (progress: AnalysisProgress) => void,
    partialResultCallback?: (section: string, data: any) => void
  ) {
    if (progressCallback) {
      this.onProgress = progressCallback;
    }
    if (partialResultCallback) {
      this.onPartialResult = partialResultCallback;
    }
  }

  async analyzeScreenplay(
    scriptText: string,
    filename: string,
  ): Promise<CompleteAnalysis> {
    return new Promise<CompleteAnalysis>(async (resolve, reject) => {
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
          } else if (type === 'partial_result') {
            if (this.onPartialResult) {
              this.onPartialResult(payload.section, payload.data);
            }
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

      try {
        // Get current configuration from AdminConfigService
        const adminConfigService = new AdminConfigService();
        const llmConfig = await adminConfigService.getLLMConfig();
        const promptConfig = await adminConfigService.getPromptConfig();
        
        console.log('Posting message to Gemini Analysis Worker:', {
          scriptTextLength: scriptText.length,
          filename,
          llmConfig: llmConfig.model,
          promptsCount: Object.keys(promptConfig).length
        });

        this.worker.postMessage({
          scriptText,
          filename,
          llmConfig,
          promptConfig
        });
      } catch (error) {
        console.error('Failed to load configuration:', error);
        reject(new Error('Failed to load configuration'));
        this.cleanupWorker();
      }
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
