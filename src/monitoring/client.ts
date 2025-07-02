export function initMonitoring() {
  const send = async (type: string, data: any, level: 'info' | 'warn' | 'error' = 'info') => {
    try {
      await fetch('/api/monitoring/frontend-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          level,
          timestamp: Date.now(),
          session_id: sessionStorage.getItem('cortexreel_session') || undefined,
          data
        })
      });
    } catch {
      // ignore network errors
    }
  };

  (window as any).__cortexreel_pdf_start = {};
  (window as any).__cortexreel_analysis_start = {};

  (window as any).cortexreel_track_pdf_start = (filename: string) => {
    const id = `pdf_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    (window as any).__cortexreel_pdf_start[id] = Date.now();
    send('pdf_processing_start', { filename });
    return id;
  };

  (window as any).cortexreel_track_pdf_complete = (id: string, success: boolean, error?: string) => {
    const start = (window as any).__cortexreel_pdf_start[id];
    const duration = start ? Date.now() - start : 0;
    delete (window as any).__cortexreel_pdf_start[id];
    send('pdf_processing', { duration_ms: duration, success, error });
  };

  (window as any).cortexreel_track_analysis_start = (filename: string, sections: number) => {
    const id = `analysis_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    (window as any).__cortexreel_analysis_start[id] = Date.now();
    send('analysis_start', { filename, sections });
    return id;
  };

  (window as any).cortexreel_track_analysis_complete = (id: string, sections: number, success: boolean, error?: string) => {
    const start = (window as any).__cortexreel_analysis_start[id];
    const duration = start ? Date.now() - start : 0;
    delete (window as any).__cortexreel_analysis_start[id];
    send('analysis_complete', { total_sections: sections, completed_sections: sections, success, total_time_ms: duration, error });
  };

  (window as any).cortexreel_track_gemini = (duration: number, status: number) => {
    send('gemini_api_call', { duration_ms: duration, status });
  };

  (window as any).cortexreel_track_custom = (event: string, data: any) => {
    send(event, data);
  };
}

