import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Architecture Diagrams', () => {
  const dir = path.join(__dirname, '..', '..', 'diagrams');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md');

  it('all diagrams contain mermaid code blocks', () => {
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      expect(content).toMatch(/```mermaid/);
    }
  });
});
