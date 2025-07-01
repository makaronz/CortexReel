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

// Helper function tests
describe("Test utilities and helpers", () => {
  it("should validate expected sections array", () => {
    const expectedSections = [
      "metadata", "scenes", "characters", "locations", "themes", "emotionalArcs",
      "safety", "budget", "technical", "production", "visualStyle", "dialogue",
      "structure", "pacing", "genre", "tone", "conflicts", "relationships",
      "subplots", "motifs", "symbolism", "foreshadowing", "worldbuilding",
      "historicalContext", "culturalContext", "audience", "distribution", "marketing"
    ];
    
    expect(expectedSections).toHaveLength(27);
    expect(expectedSections).not.toContain("");
    expect(expectedSections).not.toContain(null);
    expect(expectedSections).not.toContain(undefined);
    
    // Check for duplicates
    const uniqueSections = new Set(expectedSections);
    expect(uniqueSections.size).toBe(expectedSections.length);
  });

  it("should validate PDF file path construction", () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    expect(pdfPath).toContain("KRAKSA.pdf");
    expect(path.isAbsolute(pdfPath)).toBe(true);
    expect(path.extname(pdfPath)).toBe(".pdf");
  });

  it("should validate server port configuration", () => {
    const testPort = 3002;
    expect(testPort).toBeGreaterThan(1000);
    expect(testPort).toBeLessThan(65536);
    expect(Number.isInteger(testPort)).toBe(true);
  });

  it("should validate timeout values are reasonable", () => {
    const pollingTimeout = 120000; // 2 minutes
    const maxPollingAttempts = 60;
    const pollingInterval = 1000; // 1 second
    
    expect(pollingTimeout).toBeGreaterThan(0);
    expect(maxPollingAttempts).toBeGreaterThan(0);
    expect(pollingInterval).toBeGreaterThan(0);
    expect(maxPollingAttempts * pollingInterval).toBeLessThanOrEqual(pollingTimeout);
  });
});

describe("PDF upload integration test - Error handling and edge cases", () => {
  it("should handle missing file upload gracefully", async () => {
    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload");
    expect(uploadRes.status).toBe(400);
    expect(uploadRes.body).toHaveProperty("error");
    expect(uploadRes.body.error).toContain("No file uploaded");
  });

  it("should handle non-PDF file upload", async () => {
    // Create a temporary text file
    const tempFilePath = path.resolve(__dirname, "../../temp_test_file.txt");
    fs.writeFileSync(tempFilePath, "This is not a PDF file");
    
    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", tempFilePath);
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    expect(uploadRes.status).toBe(400);
    expect(uploadRes.body).toHaveProperty("error");
    expect(uploadRes.body.error).toContain("PDF");
  });

  it("should handle corrupted PDF file", async () => {
    // Create a corrupted PDF file
    const corruptedPdfPath = path.resolve(__dirname, "../../corrupted.pdf");
    fs.writeFileSync(corruptedPdfPath, "This is not a valid PDF content");
    
    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", corruptedPdfPath);
    
    // Clean up temp file
    fs.unlinkSync(corruptedPdfPath);
    
    expect([400, 422, 500]).toContain(uploadRes.status);
  });

  it("should handle non-existent job ID for status check", async () => {
    const fakeJobId = "non-existent-job-id-12345";
    const statusRes = await request("http://localhost:3002")
      .get(`/analysis/${fakeJobId}/status`);
    expect(statusRes.status).toBe(404);
    expect(statusRes.body).toHaveProperty("error");
    expect(statusRes.body.error).toContain("not found");
  });

  it("should handle non-existent job ID for result retrieval", async () => {
    const fakeJobId = "non-existent-job-id-67890";
    const resultRes = await request("http://localhost:3002")
      .get(`/analysis/${fakeJobId}/result`);
    expect(resultRes.status).toBe(404);
  });

  it("should handle malformed job ID in status endpoint", async () => {
    const malformedJobId = "../../malicious-path";
    const statusRes = await request("http://localhost:3002")
      .get(`/analysis/${encodeURIComponent(malformedJobId)}/status`);
    expect([400, 404]).toContain(statusRes.status);
  });

  it("should handle malformed job ID in result endpoint", async () => {
    const malformedJobId = "../../../etc/passwd";
    const resultRes = await request("http://localhost:3002")
      .get(`/analysis/${encodeURIComponent(malformedJobId)}/result`);
    expect([400, 404]).toContain(resultRes.status);
  });

  it("should handle empty job ID gracefully", async () => {
    const statusRes = await request("http://localhost:3002")
      .get("/analysis//status");
    expect([400, 404]).toContain(statusRes.status);
  });

  it("should handle concurrent upload requests", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadPromises = [];
    for (let i = 0; i < 3; i++) {
      uploadPromises.push(
        request("http://localhost:3002")
          .post("/analysis/upload")
          .attach("file", pdfPath)
      );
    }

    const results = await Promise.all(uploadPromises);
    for (const result of results) {
      expect(result.status).toBe(200);
      expect(result.body.jobId).toBeDefined();
    }

    // Verify all job IDs are unique
    const jobIds = results.map(r => r.body.jobId);
    const uniqueJobIds = new Set(jobIds);
    expect(uniqueJobIds.size).toBe(jobIds.length);
  });

  it("should handle empty PDF file", async () => {
    // Create an empty PDF file
    const emptyPdfPath = path.resolve(__dirname, "../../empty.pdf");
    fs.writeFileSync(emptyPdfPath, "");
    
    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", emptyPdfPath);
    
    // Clean up
    fs.unlinkSync(emptyPdfPath);
    
    expect([400, 422, 500]).toContain(uploadRes.status);
  });

  it("should handle large file upload (within limits)", async () => {
    // Create a larger dummy PDF-like file (but not too large)
    const largePdfPath = path.resolve(__dirname, "../../large_test.pdf");
    const largeContent = Buffer.alloc(5 * 1024 * 1024, "a"); // 5MB
    fs.writeFileSync(largePdfPath, largeContent);
    
    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", largePdfPath);
    
    // Clean up
    fs.unlinkSync(largePdfPath);
    
    // Should either accept or reject with appropriate status
    expect([200, 400, 413, 422]).toContain(uploadRes.status);
  }, 30000);
});

describe("PDF upload integration test - Data validation and API consistency", () => {
  it("should maintain consistent API response format for uploads", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body).toHaveProperty("jobId");
    expect(typeof uploadRes.body.jobId).toBe("string");
    expect(uploadRes.body.jobId.length).toBeGreaterThan(0);
    
    // Verify jobId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uploadRes.body.jobId).toMatch(uuidRegex);
  });

  it("should maintain consistent API response format for status checks", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    // Check status response format
    const statusRes = await request("http://localhost:3002")
      .get(`/analysis/${jobId}/status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toHaveProperty("state");
    expect(["waiting", "processing", "completed", "failed"]).toContain(statusRes.body.state);
    expect(statusRes.body).toHaveProperty("createdAt");
  });

  it("should validate that all required sections have meaningful content", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    // Wait for completion
    let result: any = null;
    for (let i = 0; i < 60; i++) {
      const statusRes = await request("http://localhost:3002")
        .get(`/analysis/${jobId}/status`);
      if (statusRes.body.state === "completed" && statusRes.body.result) {
        result = statusRes.body.result;
        break;
      }
      if (statusRes.body.state === "failed") {
        throw new Error("Analysis failed");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    expect(result).toBeDefined();

    // Check that each section contains meaningful data
    const expectedSections = [
      "metadata", "scenes", "characters", "locations", "themes", "emotionalArcs",
      "safety", "budget", "technical", "production", "visualStyle", "dialogue",
      "structure", "pacing", "genre", "tone", "conflicts", "relationships",
      "subplots", "motifs", "symbolism", "foreshadowing", "worldbuilding",
      "historicalContext", "culturalContext", "audience", "distribution", "marketing"
    ];

    for (const section of expectedSections) {
      expect(result).toHaveProperty(section);
      expect(result[section]).toBeDefined();
      // Ensure section is not empty or just whitespace
      if (typeof result[section] === "string") {
        expect(result[section].trim().length).toBeGreaterThan(0);
      } else if (typeof result[section] === "object" && result[section] !== null) {
        expect(Object.keys(result[section]).length).toBeGreaterThan(0);
      }
    }
  }, 120000);

  it("should validate section data types and structure", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    // Wait for completion
    let result: any = null;
    for (let i = 0; i < 60; i++) {
      const statusRes = await request("http://localhost:3002")
        .get(`/analysis/${jobId}/status`);
      if (statusRes.body.state === "completed" && statusRes.body.result) {
        result = statusRes.body.result;
        break;
      }
      if (statusRes.body.state === "failed") {
        throw new Error("Analysis failed");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    expect(result).toBeDefined();

    // Validate metadata structure
    if (result.metadata) {
      expect(typeof result.metadata).toBe("object");
    }

    // Validate characters structure (should be array or object)
    if (result.characters) {
      expect(["object", "string"]).toContain(typeof result.characters);
    }

    // Validate scenes structure
    if (result.scenes) {
      expect(["object", "string"]).toContain(typeof result.scenes);
    }

    // Validate that numeric fields are properly formatted
    if (result.budget && typeof result.budget === "object") {
      // Budget should contain numeric values if structured
      Object.values(result.budget).forEach(value => {
        if (typeof value === "string" && value.match(/^d+(.d+)?$/)) {
          expect(parseFloat(value as string)).not.toBeNaN();
        }
      });
    }
  }, 120000);

  it("should ensure all sections have reasonable content length", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    // Wait for completion
    let result: any = null;
    for (let i = 0; i < 60; i++) {
      const statusRes = await request("http://localhost:3002")
        .get(`/analysis/${jobId}/status`);
      if (statusRes.body.state === "completed" && statusRes.body.result) {
        result = statusRes.body.result;
        break;
      }
      if (statusRes.body.state === "failed") {
        throw new Error("Analysis failed");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    expect(result).toBeDefined();

    const expectedSections = [
      "metadata", "scenes", "characters", "locations", "themes", "emotionalArcs",
      "safety", "budget", "technical", "production", "visualStyle", "dialogue",
      "structure", "pacing", "genre", "tone", "conflicts", "relationships",
      "subplots", "motifs", "symbolism", "foreshadowing", "worldbuilding",
      "historicalContext", "culturalContext", "audience", "distribution", "marketing"
    ];

    for (const section of expectedSections) {
      const sectionData = result[section];
      if (typeof sectionData === "string") {
        // String content should be meaningful (not just placeholder text)
        expect(sectionData.length).toBeGreaterThan(10);
        expect(sectionData).not.toMatch(/^(TODO|TBD|N/A|null|undefined)$/i);
      } else if (Array.isArray(sectionData)) {
        // Arrays should have content
        expect(sectionData.length).toBeGreaterThan(0);
      } else if (typeof sectionData === "object" && sectionData !== null) {
        // Objects should have properties
        expect(Object.keys(sectionData).length).toBeGreaterThan(0);
      }
    }
  }, 120000);
});

describe("PDF upload integration test - Performance and reliability", () => {
  it("should handle timeout scenarios gracefully", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    // Check status immediately (should be waiting or processing)
    const immediateStatusRes = await request("http://localhost:3002")
      .get(`/analysis/${jobId}/status`);
    expect(immediateStatusRes.status).toBe(200);
    expect(["waiting", "processing"]).toContain(immediateStatusRes.body.state);
  });

  it("should handle multiple sequential uploads efficiently", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const startTime = Date.now();
    const jobIds: string[] = [];

    // Upload 3 files sequentially
    for (let i = 0; i < 3; i++) {
      const uploadRes = await request("http://localhost:3002")
        .post("/analysis/upload")
        .attach("file", pdfPath);
      expect(uploadRes.status).toBe(200);
      jobIds.push(uploadRes.body.jobId);
    }

    const uploadTime = Date.now() - startTime;
    expect(uploadTime).toBeLessThan(30000); // Should complete within 30 seconds
    expect(jobIds).toHaveLength(3);
    
    // Verify all job IDs are unique
    const uniqueJobIds = new Set(jobIds);
    expect(uniqueJobIds.size).toBe(3);
  }, 60000);

  it("should provide consistent response times for status checks", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    const responseTimes: number[] = [];
    
    // Check status 5 times and measure response time
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const statusRes = await request("http://localhost:3002")
        .get(`/analysis/${jobId}/status`);
      const responseTime = Date.now() - startTime;
      
      expect(statusRes.status).toBe(200);
      responseTimes.push(responseTime);
      
      await new Promise(r => setTimeout(r, 1000));
    }

    // All response times should be reasonable (under 5 seconds)
    responseTimes.forEach(time => {
      expect(time).toBeLessThan(5000);
    });
    
    // Calculate average response time
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    expect(avgResponseTime).toBeLessThan(2000); // Average should be under 2 seconds
  }, 30000);

  it("should handle job state transitions correctly", async () => {
    const pdfPath = path.resolve(__dirname, "../../KRAKSA.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.log("Skipping test - KRAKSA.pdf not found");
      return;
    }

    const uploadRes = await request("http://localhost:3002")
      .post("/analysis/upload")
      .attach("file", pdfPath);
    expect(uploadRes.status).toBe(200);
    const jobId = uploadRes.body.jobId;

    const seenStates = new Set<string>();
    let finalState = "";
    
    // Monitor state transitions
    for (let i = 0; i < 60; i++) {
      const statusRes = await request("http://localhost:3002")
        .get(`/analysis/${jobId}/status`);
      expect(statusRes.status).toBe(200);
      
      const currentState = statusRes.body.state;
      seenStates.add(currentState);
      
      if (currentState === "completed" || currentState === "failed") {
        finalState = currentState;
        break;
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }

    // Verify valid state progression
    expect(["completed", "failed"]).toContain(finalState);
    expect(seenStates.size).toBeGreaterThan(0);
    
    // Ensure we saw at least the initial state
    expect(seenStates.has("waiting") || seenStates.has("processing")).toBe(true);
  }, 120000);
});
}); 