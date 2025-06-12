// Defines the main structure for storing and exchanging screenplay analysis results.
// This schema integrates technical analysis, narrative validation, and user feedback.

import { ChatMessage } from './ChatMessage';

// Placeholder for actual SceneMetadata structure, to be defined based on Gemini 2.5 Pro output
// and feedback parsing requirements.
export interface SceneMetadata {
  location: string;
  timeOfDay: string;
  characters: string[];
  entryExit: string[]; // Who enters/exits the scene
  props: string[];
  continuityChecks: string[]; // Notes on continuity from Gemini
  // Add other fields as necessary from Gemini's structural analysis
}

// Placeholder for technical analysis results from Gemini 2.5 Pro
export interface TechnicalAnalysis {
  sceneId: string;
  sceneNumber: number; // Or string if scene numbers are like '5A'
  metadata: SceneMetadata;
  temporalInconsistencies?: string[]; // Detected by Gemini
  spatialInconsistencies?: string[]; // Detected by Gemini
  // ... other structural details
}

// Placeholder for narrative validation results from the secondary model (GPT-4o/Claude)
export interface NarrativeValidation {
  emotionalArcEvaluation?: string; // Summary or detailed points
  thematicAlignment?: string;
  characterRelationshipDynamics?: string;
  dialogueTensionAnalysis?: string;
  behavioralConsistencyNotes?: string[];
  // ... other narrative insights
}

// Metadata about the analysis process itself
export interface AnalysisRunMetadata {
  promptVersion: string; // e.g., "2.1.0"
  sourceModel: string; // e.g., "gemini-2.5-pro"
  validatorModel?: string; // e.g., "gpt-4o", "claude-3-opus"
  analysisTimestamp: string; // ISO 8601
  // ... any other relevant metadata for traceability
}

// The complete analysis result for a single scene, or potentially aggregated for the whole script.
export interface SceneAnalysisResult {
  sceneId: string; // Unique identifier for the scene
  scriptId: string; // Identifier for the screenplay this scene belongs to
  userId: string; // Identifier for the user who initiated the analysis

  technicalAnalysis: TechnicalAnalysis;
  narrativeValidation?: NarrativeValidation; // Optional if not yet run or not applicable

  userFeedback: ChatMessage[]; // History of user feedback related to this scene
  version: number; // For version control of the analysis data
  lastUpdated: string; // ISO 8601

  runMetadata: AnalysisRunMetadata;
}

// Overall structure for a full screenplay analysis, which might be a collection of SceneAnalysisResult
// or a more complex object.
export interface FullScreenplayAnalysis {
  scriptId: string;
  userId: string;
  title?: string;
  scenes: SceneAnalysisResult[];
  globalNarrativeValidation?: NarrativeValidation; // For whole-script level narrative checks
  overallRunMetadata: AnalysisRunMetadata;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  versionHistory?: Array<{ version: number; timestamp: string; changes: string[] }>; // Simplified change log
}

// Note: All data structures should be validated using Zod schemas
// before being processed or stored.
// Example (to be defined in a Zod schema file):
// import { z } from 'zod';
// export const SceneMetadataSchema = z.object({ ... }); 