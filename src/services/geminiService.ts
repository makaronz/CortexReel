import type { CompleteAnalysis, AnalysisProgress } from '@/types/analysis';
import { AdminConfigService } from './AdminConfigService';

// Monitoring integration functions
const trackAnalysisStart = (filename: string, sections: number) => {
  if ((window as any).cortexreel_track_analysis_start) {
    return (window as any).cortexreel_track_analysis_start(filename, sections);
  }
  return null;
};

const trackAnalysisComplete = (id: string | null, sectionsCompleted: number, success: boolean, error?: string) => {
  if (id && (window as any).cortexreel_track_analysis_complete) {
    (window as any).cortexreel_track_analysis_complete(id, sectionsCompleted, success, error);
  }
};

const trackCustomEvent = (eventName: string, data: any) => {
  if ((window as any).cortexreel_track_custom) {
    (window as any).cortexreel_track_custom(eventName, data);
  }
};

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
      // Start monitoring analysis
      const analysisId = trackAnalysisStart(filename, 27); // 27 sections in MEGA PROMPT v7.0
      const startTime = Date.now();
      
      trackCustomEvent('analysis_started', {
        filename,
        script_length: scriptText.length,
        timestamp: Date.now()
      });

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
          console.log('📨 Message from Gemini Analysis Worker:', type, payload ? Object.keys(payload) : 'No payload');
          
          if (type === 'success') {
            console.log('✅ Analysis completed successfully. Scenes array length:', payload.scenes?.length || 0);
            
            // Track successful analysis completion
            const duration = Date.now() - startTime;
            trackAnalysisComplete(analysisId, 27, true);
            trackCustomEvent('analysis_completed', {
              filename,
              duration_ms: duration,
              scenes_count: payload.scenes?.length || 0,
              success: true
            });
            
            resolve(payload as CompleteAnalysis);
            this.cleanupWorker();
          } else if (type === 'partial_result') {
            console.log(`📨 Partial result for section: ${payload.section}`);
            if (payload.section === 'scenes') {
              console.log('🎬 Received scenes data:', {
                dataType: typeof payload.data,
                isArray: Array.isArray(payload.data),
                length: Array.isArray(payload.data) ? payload.data.length : 'N/A',
                sample: Array.isArray(payload.data) && payload.data.length > 0 ? payload.data[0] : 'Empty or not array'
              });
            }
            
            if (this.onPartialResult) {
              this.onPartialResult(payload.section, payload.data);
            }
          } else if (type === 'error') {
            console.error('❌ Error message from Gemini Analysis Worker:', payload);
            
            // Track failed analysis
            const duration = Date.now() - startTime;
            trackAnalysisComplete(analysisId, 0, false, payload as string);
            trackCustomEvent('analysis_failed', {
              filename,
              duration_ms: duration,
              error: payload as string,
              success: false
            });
            
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
