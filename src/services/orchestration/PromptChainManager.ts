// Manages prompt templates, versions, and prepares prompts for LLM calls.
// This could load prompts from files or a database and handle variable substitution.

interface PromptTemplate {
  id: string;
  version: string;
  text: string; // The raw template string, e.g., "Analyze the following scene: {{scene_text}}"
  requiredVariables: string[]; // e.g., ["scene_text"]
  modelAffinity?: string[]; // e.g., ["gemini-2.5-pro", "gpt-4o"]
}

export class PromptChainManager {
  private promptTemplates: Map<string, PromptTemplate>; // Keyed by template id

  constructor() {
    this.promptTemplates = new Map();
    this.loadPromptTemplates(); // Or this could be done on demand
    console.log('PromptChainManager initialized.');
  }

  private loadPromptTemplates(): void {
    // Placeholder: In a real app, load from files (e.g., /packages/prompts/)
    // or a configuration store/database.
    const exampleSceneAnalysisPrompt: PromptTemplate = {
      id: 'sceneAnalysis_v2',
      version: '2.1.0',
      text: "Perform a structural analysis of the following scene:\n\n{{scene_text}}\n\nIdentify location, time of day, characters present, entries/exits, key props, and any continuity issues with previous scenes if context provided.",
      requiredVariables: ['scene_text'],
      modelAffinity: ['gemini-2.5-pro'],
    };
    const exampleNarrativeValidationPrompt: PromptTemplate = {
      id: 'narrativeValidation',
      version: '1.0.0',
      text: "Review the following scene for emotional arc, thematic alignment, character consistency, and dialogue tension:\n\n{{scene_text}}\n\nConsider the following summary of prior events if available: {{previous_summary}}",
      requiredVariables: ['scene_text'], // previous_summary is optional
      modelAffinity: ['gpt-4o', 'claude-3-opus'],
    };

    this.promptTemplates.set(exampleSceneAnalysisPrompt.id, exampleSceneAnalysisPrompt);
    this.promptTemplates.set(exampleNarrativeValidationPrompt.id, exampleNarrativeValidationPrompt);
    console.log('Loaded example prompt templates:', this.promptTemplates.keys());

    // TODO: Implement actual loading from /packages/prompts/ based on file system or import.
    // Example: scan /packages/prompts/*.prompt.txt, parse metadata if embedded.
  }

  /**
   * Retrieves a specific prompt template by ID.
   * @param templateId The ID of the prompt template (e.g., 'sceneAnalysis_v2').
   * @returns The PromptTemplate object or undefined if not found.
   */
  public getPromptTemplate(templateId: string): PromptTemplate | undefined {
    return this.promptTemplates.get(templateId);
  }

  /**
   * Gets a formatted prompt string by substituting variables into a template.
   * @param templateId The ID of the prompt template.
   * @param variables An object containing key-value pairs for variable substitution.
   * @returns The formatted prompt string or null if template not found or variables missing.
   */
  public getPrompt(templateId: string, variables: Record<string, string | undefined>): string | null {
    const template = this.getPromptTemplate(templateId);
    if (!template) {
      console.error(`Prompt template "${templateId}" not found.`);
      return null;
    }

    let promptText = template.text;
    for (const reqVar of template.requiredVariables) {
      if (variables[reqVar] === undefined || variables[reqVar] === null) {
        console.warn(`Required variable "${reqVar}" not provided for template "${templateId}". Using empty string.`);
        promptText = promptText.replace(new RegExp(`{{${reqVar}}}`, 'g'), '');
      } else {
        promptText = promptText.replace(new RegExp(`{{${reqVar}}}`, 'g'), variables[reqVar]!);
      }
    }

    // Replace optional variables if present
    for (const varName in variables) {
        if (variables[varName] !== undefined && !template.requiredVariables.includes(varName)) {
            promptText = promptText.replace(new RegExp(`{{${varName}}}`, 'g'), variables[varName]!);
        }
    }
    // Clean up any unreplaced optional {{variables}}
    promptText = promptText.replace(/{{[^}]+}}/g, ''); // Remove any unfulfilled optional placeholders

    return promptText;
  }

  // TODO: Add methods for listing available prompts, managing versions, etc.
  // TODO: Add method to get prompt metadata for logging (version, model affinity).
  public getPromptMetadata(templateId: string): { version: string, modelAffinity?: string[] } | null {
    const template = this.getPromptTemplate(templateId);
    if (!template) return null;
    return { version: template.version, modelAffinity: template.modelAffinity };
  }
} 