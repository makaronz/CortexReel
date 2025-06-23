import type { CompleteAnalysis, AnalysisProgress } from '@/types/analysis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { retryAsync } from '@/services/llm/retry';

/**
 * WebWorker performing multi-step analysis using the Gemini LLM.
 * Receives script text and returns structured analysis results.
 */

// Global configuration variables (passed from main thread)
let globalLLMConfig: any = null;
let globalPromptConfig: any = null;

interface WorkerInput {
  scriptText: string;
  filename: string;
  llmConfig?: any;
  promptConfig?: any;
}

// Initialize Gemini AI with dynamic configuration
const getGeminiAPI = () => {
  const llmConfig = getLLMConfig();
  
  // Priority: 1. Configuration API key, 2. Environment fallback
  const apiKey = llmConfig.apiKey || 
                 (globalThis as any).process?.env?.GEMINI_API_KEY || 
                 (globalThis as any).process?.env?.API_KEY ||
                 (self as any).VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('🚨 Gemini API key not found. Please set API key in Admin Dashboard → LLM Configuration.');
  }
  
  console.log('🔑 Using API key from:', llmConfig.apiKey ? 'admin configuration' : 'environment variables');
  return new GoogleGenerativeAI(apiKey);
};

// Get LLM configuration (passed from main thread)
const getLLMConfig = () => {
  if (globalLLMConfig) {
    console.log('✅ Using LLM configuration from main thread:', globalLLMConfig.model);
    return {
      model: globalLLMConfig.model || 'google/gemini-1.5-pro-latest',
      apiKey: globalLLMConfig.apiKey || null,
      temperature: globalLLMConfig.temperature ?? 0.7,
      maxTokens: globalLLMConfig.maxTokens ?? 4096,
      topP: globalLLMConfig.topP ?? 0.9,
      topK: globalLLMConfig.topK ?? 40,
      presencePenalty: globalLLMConfig.presencePenalty ?? 0,
      frequencyPenalty: globalLLMConfig.frequencyPenalty ?? 0
    };
  }
  
  // EMERGENCY FALLBACK ONLY - Configuration should always be passed
  console.warn('⚠️ No LLM configuration passed to worker - using emergency defaults');
  return {
    model: 'google/gemini-1.5-pro-latest',
    apiKey: null,
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.9,
    topK: 40,
    presencePenalty: 0,
    frequencyPenalty: 0
  };
};

// Get prompt configuration (passed from main thread)
const getPromptConfig = () => {
  if (globalPromptConfig) {
    console.log('✅ Using custom prompts from admin configuration');
    return globalPromptConfig;
  }
  
  // EMERGENCY FALLBACK ONLY - Prompts should always be passed
  console.warn('⚠️ No prompt configuration passed to worker - using emergency defaults');
  return getDefaultPrompts();
};

// Extract default prompts to separate function for reusability
const getDefaultPrompts = () => {
  return {
    sceneStructure: {
      id: 'sceneStructure',
      name: 'Scene Structure Analysis',
      version: '1.0.0',
      description: 'Analyzes screenplay scenes for structure and metadata',
      prompt: `Analyze screenplay scenes. Return JSON array with scenes:
[{
  "id": "unique_id",
  "number": scene_number,
  "heading": "full scene heading",
  "location": "location name",
  "timeOfDay": "DAY|NIGHT|DAWN|DUSK|CONTINUOUS|MORNING|AFTERNOON|EVENING",
  "sceneType": "INTERIOR|EXTERIOR",
  "description": "scene description",
  "characters": ["character1", "character2"],
  "dialogueCount": number_of_dialogue_lines,
  "actionLines": ["action1", "action2"],
  "estimatedDuration": minutes,
  "pageNumber": page,
  "complexity": "LOW|MEDIUM|HIGH",
  "emotions": {
    "tension": 0-10,
    "sadness": 0-10,
    "hope": 0-10,
    "anger": 0-10,
    "fear": 0-10,
    "joy": 0-10,
    "dominantEmotion": "emotion_name",
    "intensity": 0-10
  },
  "technicalRequirements": [],
  "safetyConsiderations": [],
  "props": ["prop1", "prop2"],
  "vehicles": ["vehicle1"],
  "specialEffects": ["effect1"]
}]`
    },
    characters: {
      id: 'characters',
      name: 'Character Analysis',
      version: '1.0.0',
      description: 'Analyzes characters and their development',
      prompt: `Analyze screenplay characters. Return JSON array:
[{
  "id": "unique_id",
  "name": "character name",
  "role": "PROTAGONIST|ANTAGONIST|SUPPORTING|MINOR|EXTRA",
  "firstAppearance": scene_number,
  "lastAppearance": scene_number,
  "totalScenes": count,
  "dialogueLines": count,
  "description": "character description",
  "arc": "character arc description",
  "age": "age range",
  "gender": "gender",
  "relationships": [],
  "emotionalJourney": [],
  "psychologicalProfile": {
    "motivations": {
      "primary": "main motivation",
      "secondary": ["secondary motivations"]
    },
    "internalConflicts": ["conflicts"],
    "personalityTraits": ["traits"],
    "fears": ["fears"],
    "strengths": ["strengths"],
    "weaknesses": ["weaknesses"],
    "backstory": "background",
    "arcType": "HERO|VILLAIN|ANTI_HERO|MENTOR|SIDEKICK|LOVE_INTEREST|COMIC_RELIEF|OTHER"
  },
  "costumes": [],
  "stuntsInvolved": false,
  "intimacyInvolved": false,
  "specialSkills": ["skills"]
}]`
    }
  };
};

/**
 * Sends a progress update message to the main thread with the current analysis section, completion status, estimated time remaining, and an empty error list.
 *
 * @param section - The name of the current analysis section
 * @param current - The current section number being processed (1-based)
 * @param total - The total number of analysis sections
 */

function updateProgress(section: string, current: number, total: number) {
  self.postMessage({
    type: 'progress',
    payload: {
      currentSection: section,
      sectionsComplete: current - 1,
      totalSections: total,
      percentage: Math.round(((current - 1) / total) * 100),
      estimatedTimeRemaining: (total - current + 1) * 2000, // rough estimate
      errors: [],
    } as AnalysisProgress,
  });
}

/**
 * Sends a prompt and screenplay text to the Gemini LLM, returning the parsed JSON response.
 *
 * Validates input, applies retry logic for transient failures, truncates overly long input, and attempts to clean and parse the LLM's response as JSON. Throws an error if the input is empty or if a valid JSON response cannot be obtained.
 *
 * @param prompt - The prompt template to send to the LLM
 * @param scriptText - The screenplay text to analyze
 * @returns The parsed JSON result from the LLM
 */
async function analyzeWithPrompt(prompt: string, scriptText: string): Promise<any> {
  if (!scriptText.trim()) throw new Error('Empty script text provided to LLM');
  try {
    const llmConfig = getLLMConfig();
    const genAI = getGeminiAPI();
    
    // Extract model name from the full model path (e.g., 'google/gemini-2.5-pro' -> 'gemini-2.5-pro')
    let modelName = llmConfig.model;
    if (modelName.includes('/')) {
      const parts = modelName.split('/');
      modelName = parts[parts.length - 1];
      console.log(`Stripped provider prefix, using model name: ${modelName}`);
    }
    
    console.log(`Using LLM model: ${modelName} (from config: ${llmConfig.model})`);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: llmConfig.temperature,
        maxOutputTokens: llmConfig.maxTokens,
        topP: llmConfig.topP,
        topK: llmConfig.topK
      }
    });

    if (scriptText.length > llmConfig.maxTokens * 4) {
      console.warn('Input script too long, truncating to fit token limit');
      scriptText = scriptText.slice(0, llmConfig.maxTokens * 4);
    }
    
    const fullPrompt = `${prompt}

Script text to analyze:
${scriptText}

Please respond with ONLY valid JSON, no additional text or formatting.`;

    const result = await retryAsync(() => model.generateContent(fullPrompt), 3, 1000);
    const response = await result.response;
    const text = response.text();
    
    // Clean up response to ensure it's valid JSON
    let cleanedText = text.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    // Remove any trailing non-JSON content that might be after the valid JSON
    const firstBraceIndex = cleanedText.indexOf('{');
    const lastBraceIndex = cleanedText.lastIndexOf('}');
    
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      cleanedText = cleanedText.substring(firstBraceIndex, lastBraceIndex + 1);
    }
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response text for debugging:', cleanedText.substring(0, 1000) + '...');
      
      // Attempt to find a JSON object or array in the text
      const jsonRegex = /({.*})|(\[.*\])/s;
      const match = cleanedText.match(jsonRegex);
      
      if (match) {
        const potentialJson = match[1] || match[2];
        try {
          console.warn("Attempting to parse extracted JSON from messy response...");
          return JSON.parse(potentialJson);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError, 'Extracted text:', potentialJson);
        }
      }
      
      throw new Error(`Invalid JSON response from Gemini API, and no fallback JSON found. Response starts with: ${cleanedText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.error('Gemini API call error in worker:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during Gemini API call in worker');
  }
}

function postPartialResult(sectionName: string, data: any) {
  self.postMessage({
    type: 'partial_result',
    payload: {
      section: sectionName,
      data: data
    }
  });
}

function extractArrayFromResult(result: any): any[] {
  if (Array.isArray(result)) {
    return result;
  }
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    // Find the first property that is an array
    const key = Object.keys(result).find(k => Array.isArray(result[k]));
    if (key) {
      console.warn(`LLM returned an object instead of an array. Using the array from key: "${key}"`);
      return result[key];
    }
  }
  console.warn(`Expected an array from LLM, but got something else. Returning empty array. Received:`, result);
  return []; // Return empty array to prevent downstream errors
}

// --- Poszczególne metody analizy (skopiowane z GeminiAnalysisService z pełnymi promptami) ---

async function analyzeMetadata(scriptText: string, filename: string) {
  const prompt = `Analyze this screenplay and extract metadata. Return JSON with:
  {
    "title": "detected or filename",
    "genre": "primary genre",
    "tone": "overall tone",
    "language": "detected language",
    "pageCount": estimated_pages,
    "wordCount": estimated_words,
    "characterCount": total_chars,
    "estimatedReadingTime": minutes,
    "format": "PDF|TXT|FOUNTAIN|FINAL_DRAFT"
  }`;
  const result = await analyzeWithPrompt(prompt, scriptText);
  return {
    ...result,
    // filename: filename, // filename jest już częścią obiektu CompleteAnalysis, nie trzeba go tu dublować
    format: result.format || 'PDF'
  };
}

async function analyzeSceneStructure(scriptText: string) {
  const promptConfig = getPromptConfig();
  const scenePrompt = promptConfig.sceneStructure?.prompt || getDefaultPrompts().sceneStructure.prompt;
  
  console.log('🎬 Analyzing scene structure with prompt version:', promptConfig.sceneStructure?.version || 'default');
  return await analyzeWithPrompt(scenePrompt, scriptText);
}

async function analyzeCharacters(scriptText: string) {
  const promptConfig = getPromptConfig();
  const charactersPrompt = promptConfig.characters?.prompt || getDefaultPrompts().characters.prompt;
  
  console.log('👥 Analyzing characters with prompt version:', promptConfig.characters?.version || 'default');
  return await analyzeWithPrompt(charactersPrompt, scriptText);
}

async function analyzeLocations(scriptText: string) {
  const promptConfig = getPromptConfig();
  const prompt = promptConfig.locations?.prompt || `Analyze screenplay locations. Return JSON array:
  [{
    "id": "unique_id",
    "name": "location name",
    "type": "INTERIOR|EXTERIOR|MIXED",
    "category": "RESIDENTIAL|COMMERCIAL|INDUSTRIAL|NATURAL|TRANSPORTATION|INSTITUTIONAL|OTHER",
    "scenes": [scene_numbers],
    "description": "location description",
    "requiresPermit": boolean,
    "permitType": "permit type if required",
    "accessibility": "EASY|MODERATE|DIFFICULT",
    "powerAvailable": boolean,
    "parkingAvailable": boolean,
    "weatherDependency": "NONE|LOW|HIGH",
    "baseRentalCost": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "specialRequirements": ["requirements"]
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeProps(scriptText: string) {
  const prompt = `Analyze screenplay props. Return JSON array:
  [{
    "id": "unique_id",
    "name": "prop name",
    "category": "WEAPON|VEHICLE|FURNITURE|TECHNOLOGY|COSTUME|FOOD|DOCUMENT|OTHER",
    "scenes": [scene_numbers],
    "description": "prop description",
    "importance": "BACKGROUND|FEATURED|KEY_STORY|HERO_PROP",
    "quantity": number,
    "specialRequirements": ["requirements"],
    "cost": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "availability": "EASY|MODERATE|DIFFICULT|CUSTOM"
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeVehicles(scriptText: string) {
  const prompt = `Analyze screenplay vehicles. Return JSON array with vehicle-specific props:
  [{
    "id": "unique_id",
    "name": "vehicle name",
    "category": "VEHICLE",
    "vehicleType": "CAR|TRUCK|MOTORCYCLE|BOAT|AIRCRAFT|BICYCLE|OTHER",
    "scenes": [scene_numbers],
    "description": "vehicle description",
    "importance": "BACKGROUND|FEATURED|KEY_STORY|HERO_PROP",
    "quantity": number,
    "specialRequirements": ["requirements"],
    "cost": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "availability": "EASY|MODERATE|DIFFICULT|CUSTOM",
    "drivingRequired": boolean,
    "stuntsInvolved": boolean,
    "modifications": ["modifications"],
    "insurance": "STANDARD|SPECIAL|EXTREME"
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeWeapons(scriptText: string) {
  const prompt = `Analyze screenplay weapons. Return JSON array:
  [{
    "id": "unique_id",
    "name": "weapon name",
    "category": "WEAPON",
    "weaponType": "FIREARM|BLADE|BLUNT|EXPLOSIVE|OTHER",
    "scenes": [scene_numbers],
    "description": "weapon description",
    "importance": "BACKGROUND|FEATURED|KEY_STORY|HERO_PROP",
    "quantity": number,
    "specialRequirements": ["requirements"],
    "cost": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "availability": "EASY|MODERATE|DIFFICULT|CUSTOM",
    "functional": boolean,
    "permits": ["required permits"],
    "training": ["required training"],
    "storage": ["storage requirements"]
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeLighting(scriptText: string) {
  const prompt = `Analyze lighting requirements for each scene. Return JSON array:
  [{
    "sceneId": "scene_id",
    "timeOfDay": "time period",
    "mood": "lighting mood",
    "style": "NATURAL|DRAMATIC|SOFT|HIGH_KEY|LOW_KEY|MIXED",
    "equipment": ["lighting equipment"],
    "specialNotes": ["notes"],
    "complexity": "SIMPLE|MODERATE|COMPLEX"
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeDifficultScenes(scriptText: string) {
  const prompt = `Identify difficult/complex scenes. Return JSON array:
  [{
    "sceneId": "scene_id",
    "sceneNumber": number,
    "difficultyFactors": ["factors"],
    "riskLevel": "LOW|MEDIUM|HIGH|EXTREME",
    "specialPersonnel": ["required personnel"],
    "permits": ["required permits"],
    "insurance": ["insurance needs"],
    "preparation": ["preparation steps"],
    "alternatives": ["alternative approaches"]
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzePermits(scriptText: string) {
  const prompt = `Analyze permit requirements. Return JSON array:
  [{
    "type": "LOCATION|WEAPON|EXPLOSIVE|ANIMAL|AIRCRAFT|TRAFFIC|FIRE|OTHER",
    "description": "permit description",
    "scenes": [scene_numbers],
    "authority": "issuing authority",
    "leadTime": "time needed",
    "cost": "LOW|MEDIUM|HIGH|VERY_HIGH",
    "complexity": "SIMPLE|MODERATE|COMPLEX",
    "required": boolean
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeEquipment(scriptText: string) {
  const prompt = `Analyze equipment requirements. Return JSON array:
  [{
    "category": "CAMERA|LIGHTING|SOUND|GRIP|ELECTRICAL|SPECIAL",
    "item": "equipment name",
    "scenes": [scene_numbers],
    "quantity": number,
    "duration": "rental period",
    "alternatives": ["alternative equipment"],
    "cost": "LOW|MEDIUM|HIGH|VERY_HIGH"
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeRisks(scriptText: string) {
  const prompt = `Analyze production risks. Return JSON array:
  [{
    "id": "unique_id",
    "category": "SAFETY|WEATHER|PERMIT|TALENT|EQUIPMENT|LOCATION|BUDGET",
    "description": "risk description",
    "probability": "LOW|MEDIUM|HIGH",
    "impact": "LOW|MEDIUM|HIGH|CRITICAL",
    "scenes": [affected_scenes],
    "mitigation": ["mitigation strategies"],
    "contingency": ["contingency plans"]
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeRelationships(scriptText: string) {
  const prompt = `Analyze character relationships. Return JSON array:
  [{
    "id": "unique_id",
    "character1": "character name",
    "character2": "character name",
    "type": "ROMANTIC|FAMILY|FRIENDSHIP|PROFESSIONAL|ANTAGONISTIC|MENTOR|OTHER",
    "strength": 0-10,
    "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|COMPLEX",
    "evolution": "IMPROVING|DETERIORATING|STABLE|VOLATILE",
    "keyScenes": [scene_numbers],
    "description": "relationship description",
    "conflictLevel": 0-10
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeThemes(scriptText: string) {
  const promptConfig = getPromptConfig();
  const prompt = promptConfig.themes?.prompt || `Analyze themes and narrative elements. Return JSON:
  {
    "primaryThemes": ["main themes"],
    "secondaryThemes": ["secondary themes"],
    "motifs": ["recurring motifs"],
    "symbols": ["symbols"],
    "narrativeStructure": "structure description",
    "genreElements": ["genre elements"],
    "toneShifts": [{
      "sceneNumber": number,
      "from": "original tone",
      "to": "new tone",
      "reason": "reason for shift"
    }]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeEmotionalArcs(scriptText: string) {
  const promptConfig = getPromptConfig();
  const prompt = promptConfig.emotionalArcs?.prompt || `Analyze emotional arcs throughout the screenplay. Return JSON:
  {
    "overall": [{
      "sceneNumber": number,
      "tension": 0-10,
      "sadness": 0-10,
      "hope": 0-10,
      "anger": 0-10,
      "fear": 0-10,
      "joy": 0-10,
      "dominantEmotion": "emotion name",
      "intensity": 0-10,
      "turningPoint": boolean,
      "description": "arc description"
    }],
    "byCharacter": {},
    "keyMoments": [],
    "statistics": {
      "averageTension": number,
      "emotionalRange": number,
      "turningPoints": number,
      "dominantEmotions": {}
    }
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzePsychology(scriptText: string) {
  const prompt = `Analyze psychological aspects. Return JSON:
  {
    "characterProfiles": {},
    "overallThemes": ["psychological themes"],
    "psychologicalTensions": ["tensions"],
    "characterDynamics": ["dynamics"],
    "narrativeThemes": ["narrative themes"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeResources(scriptText: string) {
  const prompt = `Analyze resource planning requirements. Return JSON:
  {
    "crewRequirements": {"role": count},
    "equipmentNeeds": [],
    "locationDays": {"location": days},
    "talentDays": {"character": days},
    "specialistDays": {"specialist": days}
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzePacing(scriptText: string) {
  const prompt = `Analyze script pacing. Return JSON:
  {
    "overallPacing": "SLOW|MODERATE|FAST|VARIABLE",
    "actBreakdown": [{
      "act": number,
      "sceneCount": number,
      "estimatedMinutes": number,
      "pacing": "pacing description",
      "keyEvents": ["events"]
    }],
    "rhythmPattern": ["pattern elements"],
    "climaxPoints": [scene_numbers],
    "pacingIssues": ["identified issues"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeTechnical(scriptText: string) {
  const prompt = `Analyze technical requirements. Return JSON array:
  [{
    "category": "CAMERA|LIGHTING|SOUND|SPECIAL_EFFECTS|EQUIPMENT",
    "item": "requirement name",
    "priority": "LOW|MEDIUM|HIGH|CRITICAL",
    "description": "requirement description",
    "scenes": [scene_numbers]
  }]`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeBudget(scriptText: string) {
  const prompt = `Analyze budget implications. Return JSON:
  {
    "overallComplexity": "LOW|MEDIUM|HIGH|EXTREME",
    "flags": [{
      "category": "category name",
      "description": "flag description",
      "estimatedCost": "LOW|MEDIUM|HIGH|VERY_HIGH",
      "scenes": [scene_numbers],
      "mitigation": "mitigation strategy",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL"
    }],
    "costDrivers": ["main cost factors"],
    "savingOpportunities": ["cost saving opportunities"],
    "riskFactors": ["budget risk factors"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeChecklist(scriptText: string) {
  const prompt = `Generate production checklist. Return JSON:
  {
    "preProduction": [{
      "task": "task name",
      "department": "responsible department",
      "deadline": "deadline",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "completed": false
    }],
    "production": [{
      "day": number,
      "scenes": [scene_numbers],
      "requirements": ["requirements"],
      "specialNotes": ["notes"]
    }],
    "postProduction": [{
      "task": "task name",
      "department": "responsible department",
      "dependencies": ["dependencies"],
      "estimatedTime": "time estimate"
    }]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeExtras(scriptText: string) {
  const prompt = `Analyze extra/background actor requirements. Return JSON:
  {
    "scenes": [{
      "sceneNumber": number,
      "extraCount": number,
      "description": "scene description",
      "specialRequirements": ["requirements"],
      "wardrobe": ["wardrobe needs"]
    }],
    "totalExtras": number,
    "specialtyExtras": ["specialty requirements"],
    "castingNotes": ["casting notes"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeSafety(scriptText: string) {
  const promptConfig = getPromptConfig();
  const prompt = promptConfig.safety?.prompt || `Comprehensive safety analysis. Return JSON:
  {
    "overallAssessment": {
      "overallRiskLevel": "LOW|MEDIUM|HIGH|EXTREME",
      "risks": [],
      "requiredPersonnel": ["safety personnel"],
      "requiredEquipment": ["safety equipment"],
      "protocols": ["safety protocols"],
      "insurance": ["insurance requirements"],
      "medicalRequirements": ["medical requirements"]
    },
    "sceneSpecificRisks": [{
      "sceneNumber": number,
      "risks": [],
      "protocols": ["protocols for this scene"]
    }],
    "requiredTraining": ["training requirements"],
    "emergencyProcedures": ["emergency procedures"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeIntimacy(scriptText: string) {
  const prompt = `Analyze intimacy coordination needs. Return JSON:
  {
    "scenesRequiring": [scene_numbers],
    "coordinatorRequired": boolean,
    "protocolsNeeded": ["protocols"],
    "consentDocuments": ["required documents"],
    "specialConsiderations": ["considerations"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeAnimals(scriptText: string) {
  const prompt = `Analyze animal coordination requirements. Return JSON:
  {
    "animalsInvolved": [{
      "animal": "animal type",
      "scenes": [scene_numbers],
      "requirements": ["requirements"],
      "safety": ["safety considerations"]
    }],
    "trainerRequired": boolean,
    "permits": ["required permits"],
    "welfare": ["welfare requirements"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzeStunts(scriptText: string) {
  const prompt = `Analyze stunt coordination requirements. Return JSON:
  {
    "stuntsRequired": [{
      "sceneNumber": number,
      "description": "stunt description",
      "complexity": "SIMPLE|MODERATE|COMPLEX|EXTREME",
      "personnel": ["required personnel"],
      "equipment": ["required equipment"],
      "safety": ["safety measures"]
    }],
    "coordinatorRequired": boolean,
    "insurance": ["insurance requirements"],
    "rehearsals": ["rehearsal requirements"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}

async function analyzePostProduction(scriptText: string) {
  const prompt = `Analyze post-production requirements. Return JSON:
  {
    "editingNotes": ["editing considerations"],
    "vfxRequirements": [{
      "sceneNumber": number,
      "description": "vfx description",
      "complexity": "SIMPLE|MODERATE|COMPLEX",
      "software": ["required software"]
    }],
    "soundDesign": ["sound design notes"],
    "colorGrading": ["color grading notes"],
    "musicNotes": ["music and score notes"]
  }`;
  return await analyzeWithPrompt(prompt, scriptText);
}


// --- Główna funkcja wykonywana przez workera po otrzymaniu wiadomości ---
async function performFullAnalysis(scriptText: string, filename: string): Promise<CompleteAnalysis> {
  const startTime = Date.now();
  
  let partialAnalysis: Partial<CompleteAnalysis> = {};
  
  updateProgress('Script Metadata', 1, 27);
  const metadata = await analyzeMetadata(scriptText, filename);
  partialAnalysis.metadata = metadata;
  postPartialResult('metadata', metadata);
  
  updateProgress('Scene Structure', 2, 27);
  const scenes = extractArrayFromResult(await analyzeSceneStructure(scriptText));
  partialAnalysis.scenes = scenes;
  postPartialResult('scenes', scenes);

  updateProgress('Character Details', 3, 27);
  const characters = extractArrayFromResult(await analyzeCharacters(scriptText));
  partialAnalysis.characters = characters;
  postPartialResult('characters', characters);

  updateProgress('Location Details', 4, 27);
  const locations = extractArrayFromResult(await analyzeLocations(scriptText));
  partialAnalysis.locations = locations;
  postPartialResult('locations', locations);
  
  updateProgress('Props Analysis', 5, 27);
  const props = extractArrayFromResult(await analyzeProps(scriptText));
  partialAnalysis.props = props;
  postPartialResult('props', props);

  updateProgress('Vehicle Requirements', 6, 27);
  const vehicles = extractArrayFromResult(await analyzeVehicles(scriptText));
  partialAnalysis.vehicles = vehicles;
  postPartialResult('vehicles', vehicles);

  updateProgress('Weapon Management', 7, 27);
  const weapons = extractArrayFromResult(await analyzeWeapons(scriptText));
  partialAnalysis.weapons = weapons;
  postPartialResult('weapons', weapons);

  updateProgress('Lighting Schemes', 8, 27);
  const lighting = extractArrayFromResult(await analyzeLighting(scriptText));
  partialAnalysis.lighting = lighting;
  postPartialResult('lighting', lighting);

  updateProgress('Difficult Scenes', 9, 27);
  const difficultScenes = extractArrayFromResult(await analyzeDifficultScenes(scriptText));
  partialAnalysis.difficultScenes = difficultScenes;
  postPartialResult('difficultScenes', difficultScenes);

  updateProgress('Permit Requirements', 10, 27);
  const permits = extractArrayFromResult(await analyzePermits(scriptText));
  partialAnalysis.permits = permits;
  postPartialResult('permits', permits);

  updateProgress('Equipment Requirements', 11, 27);
  const equipment = extractArrayFromResult(await analyzeEquipment(scriptText));
  partialAnalysis.equipment = equipment;
  postPartialResult('equipment', equipment);

  updateProgress('Production Risks', 12, 27);
  const risks = extractArrayFromResult(await analyzeRisks(scriptText));
  partialAnalysis.risks = risks;
  postPartialResult('risks', risks);

  updateProgress('Character Relationships', 13, 27);
  const relationships = extractArrayFromResult(await analyzeRelationships(scriptText));
  partialAnalysis.relationships = relationships;
  postPartialResult('relationships', relationships);

  updateProgress('Theme Analysis', 14, 27);
  const themes = await analyzeThemes(scriptText);
  partialAnalysis.themes = themes;
  postPartialResult('themes', themes);

  updateProgress('Emotional Arcs', 15, 27);
  const emotionalArcs = await analyzeEmotionalArcs(scriptText);
  partialAnalysis.emotionalArcs = emotionalArcs;
  postPartialResult('emotionalArcs', emotionalArcs);

  updateProgress('Psychological Analysis', 16, 27);
  const psychology = await analyzePsychology(scriptText);
  partialAnalysis.psychology = psychology;
  postPartialResult('psychology', psychology);

  updateProgress('Resource Planning', 17, 27);
  const resources = await analyzeResources(scriptText);
  partialAnalysis.resources = resources;
  postPartialResult('resources', resources);

  updateProgress('Pacing Analysis', 18, 27);
  const pacing = await analyzePacing(scriptText);
  partialAnalysis.pacing = pacing;
  postPartialResult('pacing', pacing);

  updateProgress('Technical Requirements', 19, 27);
  const technical = extractArrayFromResult(await analyzeTechnical(scriptText));
  partialAnalysis.technical = technical;
  postPartialResult('technical', technical);

  updateProgress('Budget Analysis', 20, 27);
  const budget = await analyzeBudget(scriptText);
  partialAnalysis.budget = budget;
  postPartialResult('budget', budget);

  updateProgress('Production Checklist', 21, 27);
  const checklist = await analyzeChecklist(scriptText);
  partialAnalysis.checklist = checklist;
  postPartialResult('checklist', checklist);

  updateProgress('Extra Requirements', 22, 27);
  const extras = await analyzeExtras(scriptText);
  partialAnalysis.extras = extras;
  postPartialResult('extras', extras);

  updateProgress('Comprehensive Safety', 23, 27);
  const safety = await analyzeSafety(scriptText);
  partialAnalysis.safety = safety;
  postPartialResult('safety', safety);

  updateProgress('Intimacy Coordination', 24, 27);
  const intimacy = await analyzeIntimacy(scriptText);
  partialAnalysis.intimacy = intimacy;
  postPartialResult('intimacy', intimacy);

  updateProgress('Animal Coordination', 25, 27);
  const animals = await analyzeAnimals(scriptText);
  partialAnalysis.animals = animals;
  postPartialResult('animals', animals);

  updateProgress('Stunt Coordination', 26, 27);
  const stunts = await analyzeStunts(scriptText);
  partialAnalysis.stunts = stunts;
  postPartialResult('stunts', stunts);

  updateProgress('Post-Production Notes', 27, 27);
  const postProduction = await analyzePostProduction(scriptText);
  partialAnalysis.postProduction = postProduction;
  postPartialResult('postProduction', postProduction);


  const analysis: CompleteAnalysis = {
    id: crypto.randomUUID(),
    filename,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    ...partialAnalysis
  } as CompleteAnalysis;

  console.log(`Worker analysis completed in ${Date.now() - startTime}ms`);
  return analysis;
}

// --- Główna logika workera ---
self.onmessage = async (event: MessageEvent<WorkerInput>) => {
  const { scriptText, filename, llmConfig, promptConfig } = event.data;

  if (!scriptText || !filename) {
    self.postMessage({ type: 'error', payload: 'Missing scriptText or filename in worker input' });
    return;
  }

  try {
    globalLLMConfig = llmConfig || null;
    globalPromptConfig = promptConfig || null;

    const analysisResult = await performFullAnalysis(scriptText, filename);
    self.postMessage({ type: 'success', payload: analysisResult });
  } catch (error) {
    console.error('Error in Gemini Analysis Worker:', error);
    self.postMessage({ type: 'error', payload: error instanceof Error ? error.message : 'Unknown worker error' });
  }
}; 