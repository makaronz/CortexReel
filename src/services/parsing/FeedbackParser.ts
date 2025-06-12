// Parses natural language feedback from users into structured metadata diffs.
import { SceneMetadata } from '../../types/SceneAnalysisResult';
import { ChatMessage } from '../../types/ChatMessage';

// This is a placeholder. Actual implementation would involve NLP libraries or
// a dedicated LLM call for parsing complex feedback.
export class FeedbackParser {
  constructor() {
    console.log('FeedbackParser initialized.');
  }

  /**
   * Parses a user's chat message to extract intended changes to scene metadata.
   * For simple cases, regex or keyword matching might suffice.
   * For complex instructions, an LLM call might be needed.
   * @param message The user's chat message content.
   * @param currentSceneContext Optional, for context-aware parsing.
   * @returns A partial SceneMetadata object representing the desired changes.
   */
  public parse(messageContent: string, _currentSceneContext?: SceneMetadata): Partial<SceneMetadata> {
    console.log(`Parsing feedback: "${messageContent}"`);
    const changes: Partial<SceneMetadata> = {};

    // Example simple parsing logic (to be expanded significantly)
    if (messageContent.toLowerCase().includes('daylight') || messageContent.toLowerCase().includes('dawn')) {
      changes.timeOfDay = 'dawn'; // Or a more generic 'day'
    }
    if (messageContent.toLowerCase().includes('night')) {
      changes.timeOfDay = 'night';
    }
    if (messageContent.toLowerCase().includes('forest')) {
      changes.location = 'forest';
    }
    // Add more parsing rules for characters, props, etc.

    if (Object.keys(changes).length > 0) {
      console.log('Parsed changes:', changes);
    } else {
      console.log('No specific metadata changes parsed from feedback.');
    }
    return changes;
  }

  /**
   * Type guard to check if a ChatMessage contains feedback intended for parsing.
   * @param message ChatMessage object
   * @returns boolean
   */
  public static isFeedbackMessage(message: ChatMessage): boolean {
    // Simple heuristic: if it's a user message and not a command-like message.
    // This needs to be more sophisticated based on actual command patterns.
    return message.type === 'user' && !message.content.startsWith('/');
  }
} 