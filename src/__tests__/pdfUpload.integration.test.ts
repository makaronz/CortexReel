import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../backend/server';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
  await app.listen({ port: 3002 });
});

afterAll(async () => {
  await app.close();
});

describe('PDF upload & 27-section analysis (integration)', () => {
  it('should upload KRAKSA.pdf, process it, and return all 27 sections', async () => {
    const pdfPath = path.resolve(__dirname, '../../KRAKSA.pdf');
    const fileExists = fs.existsSync(pdfPath);
    expect(fileExists).toBe(true);

    // 1. Upload PDF
    const uploadRes = await request('http://localhost:3002')
      .post('/analysis/upload')
      .attach('file', pdfPath);
    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.jobId).toBeDefined();
    const jobId = uploadRes.body.jobId;

    // 2. Poll status until done
    let status = 'waiting';
    let result: any = null;
    for (let i = 0; i < 60; i++) { // max 60s
      const statusRes = await request('http://localhost:3002')
        .get(`/analysis/${jobId}/status`);
      expect(statusRes.status).toBe(200);
      status = statusRes.body.state;
      if (status === 'completed' && statusRes.body.result) {
        result = statusRes.body.result;
        break;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    expect(result).toBeDefined();

    // 3. Pobierz wynik przez /result (opcjonalnie)
    const resultRes = await request('http://localhost:3002')
      .get(`/analysis/${jobId}/result`);
    expect(resultRes.status).toBe(200);
    expect(resultRes.body.result).toBeDefined();
    const analysis = resultRes.body.result;

    // 4. Sprawdź obecność 27 sekcji
    const expectedSections = [
      'metadata', 'scenes', 'characters', 'locations', 'themes', 'emotionalArcs',
      'safety', 'budget', 'technical', 'production', 'visualStyle', 'dialogue',
      'structure', 'pacing', 'genre', 'tone', 'conflicts', 'relationships',
      'subplots', 'motifs', 'symbolism', 'foreshadowing', 'worldbuilding',
      'historicalContext', 'culturalContext', 'audience', 'distribution', 'marketing'
    ];
    for (const section of expectedSections) {
      expect(analysis).toHaveProperty(section);
    }
    // Log fragment for debug
    console.log('Fragment analizy:', JSON.stringify(analysis.metadata || analysis, null, 2));
  }, 120_000); // timeout 2 min
}); 