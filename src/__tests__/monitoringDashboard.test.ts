import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Monitoring Dashboard', () => {
  it('should contain the expected title and metrics placeholders', () => {
    const filePath = path.join(__dirname, '..', '..', 'monitoring', 'dashboard.html');
    const html = fs.readFileSync(filePath, 'utf-8');
    expect(html).toContain('<title>CortexReel Monitoring Dashboard</title>');
    expect(html).toContain('id="memory-usage"');
    expect(html).toContain('id="cpu-usage"');
  });
});
