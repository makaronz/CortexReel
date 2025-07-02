import { describe, it, expect, beforeEach } from 'vitest';
import { getMonitoringService } from '../backend/services/MonitoringService';

describe('MonitoringService integration', () => {
  beforeEach(() => {
    // reset singleton between tests
    const service = getMonitoringService();
    (service as any).stats.requests = { count: 0, totalTime: 0, errors: 0 };
    (service as any).stats.geminiCalls = 0;
    (service as any).stats.pdfProcessed = 0;
    (service as any).stats.analysisCompleted = 0;
    (service as any).stats.activeSessions = new Set();
  });

  it('tracks pdf processing and gemini calls', async () => {
    const service = getMonitoringService();
    const startStats = service.getStats();
    await service.trackPdfProcessing('file.pdf', 100, true);
    await service.trackGeminiCall('https://api', 50, 200);
    await service.trackAnalysis('file.pdf', 27, 150, true);
    const stats = service.getStats();
    expect(stats.pdf_processed).toBe(startStats.pdf_processed + 1);
    expect(stats.gemini_calls).toBe(startStats.gemini_calls + 1);
    expect(stats.analysis_completed).toBe(startStats.analysis_completed + 1);
  });
});

