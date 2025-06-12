// Corresponds to the REAL-TIME MESSAGING & PROTOCOL DEFINITION
// Defines the structure for chat messages exchanged via WebSocket.

export interface ChatMessage {
  userId: string;
  sceneId?: string; // Optional: message might be general or related to a specific scene
  timestamp: string; // ISO 8601 format
  content: string;
  type: 'user' | 'assistant'; // Specifies the origin of the message
}

// Consider adding a more specific type for parsed feedback if needed
// export interface ParsedFeedback {
//   targetSceneId?: string;
//   updates: Partial<SceneMetadata>; // Example, adjust based on SceneMetadata type
//   originalMessage: ChatMessage;
// } 