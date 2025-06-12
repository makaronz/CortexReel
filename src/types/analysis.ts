// Admin and Configuration Types

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export interface PromptConfig {
  [key: string]: {
    id: string;
    name: string;
    prompt: string;
    version: string;
    description: string;
  };
}

export interface AppConfig {
  appName: string;
  maxFileSize: number;
  supportedFormats: string;
  debugMode: boolean;
  logLevel: string;
  enableOCR: boolean;
  enableAdvancedCharts: boolean;
  enableExport: boolean;
  enableCollaboration: boolean;
}

// Core Analysis Types for CortexReel

export interface ScriptMetadata {
  title: string;
  genre: string;
  tone: string;
  language: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number;
  alternativeTitles?: string[];
  author?: string;
  version?: string;
  format: 'PDF' | 'TXT' | 'FOUNTAIN' | 'FINAL_DRAFT';
}

export interface SceneStructure {
  id: string;
  number: number;
  heading: string; // Full scene heading: INT./EXT. LOCATION - TIME
  location: string;
  timeOfDay: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK' | 'CONTINUOUS' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  sceneType: 'INTERIOR' | 'EXTERIOR';
  description: string;
  characters: string[];
  dialogueCount: number;
  actionLines: string[];
  estimatedDuration: number; // in minutes
  pageNumber: number;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedShootingDays?: number;
  emotions: EmotionalData;
  technicalRequirements: TechnicalRequirement[];
  safetyConsiderations: SafetyNote[];
  props: string[];
  vehicles: string[];
  specialEffects: string[];
}

export interface CharacterDetail {
  id: string;
  name: string;
  role: 'PROTAGONIST' | 'ANTAGONIST' | 'SUPPORTING' | 'MINOR' | 'EXTRA';
  firstAppearance: number;
  lastAppearance: number;
  totalScenes: number;
  dialogueLines: number;
  description: string;
  arc: string;
  age?: string;
  gender?: string;
  relationships: CharacterRelationship[];
  emotionalJourney: EmotionalArcPoint[];
  psychologicalProfile: PsychologicalProfile;
  costumes: CostumeRequirement[];
  stuntsInvolved: boolean;
  intimacyInvolved: boolean;
  specialSkills: string[];
}

export interface LocationDetail {
  id: string;
  name: string;
  type: 'INTERIOR' | 'EXTERIOR' | 'MIXED';
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'NATURAL' | 'TRANSPORTATION' | 'INSTITUTIONAL' | 'OTHER';
  scenes: number[];
  description: string;
  requiresPermit: boolean;
  permitType?: string;
  accessibility: 'EASY' | 'MODERATE' | 'DIFFICULT';
  powerAvailable: boolean;
  parkingAvailable: boolean;
  weatherDependency: 'NONE' | 'LOW' | 'HIGH';
  baseRentalCost: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  specialRequirements: string[];
}

export interface EmotionalData {
  tension: number; // 0-10
  sadness: number;
  hope: number;
  anger: number;
  fear: number;
  joy: number;
  dominantEmotion: string;
  intensity: number; // 0-10
}

export interface EmotionalArcPoint {
  sceneNumber: number;
  character?: string;
  tension: number;
  sadness: number;
  hope: number;
  anger: number;
  fear: number;
  joy: number;
  dominantEmotion: string;
  intensity: number;
  turningPoint: boolean;
  description?: string;
}

export interface EmotionalArcData {
  overall: EmotionalArcPoint[];
  byCharacter: { [characterName: string]: EmotionalArcPoint[] };
  keyMoments: EmotionalArcPoint[];
  statistics: {
    averageTension: number;
    emotionalRange: number;
    turningPoints: number;
    dominantEmotions: { [emotion: string]: number };
  };
}

export interface CharacterRelationship {
  id: string;
  character1: string;
  character2: string;
  type: 'ROMANTIC' | 'FAMILY' | 'FRIENDSHIP' | 'PROFESSIONAL' | 'ANTAGONISTIC' | 'MENTOR' | 'OTHER';
  strength: number; // 0-10
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'COMPLEX';
  evolution: 'IMPROVING' | 'DETERIORATING' | 'STABLE' | 'VOLATILE';
  emotionalIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VOLATILE';
  keyScenes: number[];
  description: string;
  conflictLevel: number; // 0-10
}

export interface PsychologicalProfile {
  motivations: {
    primary: string;
    secondary: string[];
  };
  internalConflicts: string[];
  personalityTraits: string[];
  fears: string[];
  strengths: string[];
  weaknesses: string[];
  backstory: string;
  arcType: 'HERO' | 'VILLAIN' | 'ANTI_HERO' | 'MENTOR' | 'SIDEKICK' | 'LOVE_INTEREST' | 'COMIC_RELIEF' | 'OTHER';
}

export interface PsychologicalAnalysis {
  characterProfiles: { [characterName: string]: PsychologicalProfile };
  overallThemes: string[];
  psychologicalTensions: string[];
  characterDynamics: string[];
  narrativeThemes: string[];
}

export interface TechnicalRequirement {
  category: 'CAMERA' | 'LIGHTING' | 'SOUND' | 'SPECIAL_EFFECTS' | 'EQUIPMENT';
  item: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  scenes: number[];
}

export interface SafetyNote {
  type: 'STUNT' | 'WEAPON' | 'FIRE' | 'WATER' | 'HEIGHT' | 'ANIMAL' | 'CHEMICAL' | 'MEDICAL' | 'GENERAL';
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  mitigationRequired: string[];
  personnelRequired: string[];
  equipmentRequired: string[];
}

export interface PropDetail {
  id: string;
  name: string;
  category: 'WEAPON' | 'VEHICLE' | 'FURNITURE' | 'TECHNOLOGY' | 'COSTUME' | 'FOOD' | 'DOCUMENT' | 'OTHER';
  scenes: number[];
  description: string;
  importance: 'BACKGROUND' | 'FEATURED' | 'KEY_STORY' | 'HERO_PROP';
  quantity: number;
  specialRequirements: string[];
  cost: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  availability: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'CUSTOM';
}

export interface VehicleDetail extends PropDetail {
  vehicleType: 'CAR' | 'TRUCK' | 'MOTORCYCLE' | 'BOAT' | 'AIRCRAFT' | 'BICYCLE' | 'OTHER';
  drivingRequired: boolean;
  stuntsInvolved: boolean;
  modifications: string[];
  insurance: 'STANDARD' | 'SPECIAL' | 'EXTREME';
}

export interface WeaponDetail extends PropDetail {
  weaponType: 'FIREARM' | 'BLADE' | 'BLUNT' | 'EXPLOSIVE' | 'OTHER';
  functional: boolean;
  permits: string[];
  training: string[];
  storage: string[];
}

export interface LightingScheme {
  sceneId: string;
  timeOfDay: string;
  mood: string;
  style: 'NATURAL' | 'DRAMATIC' | 'SOFT' | 'HIGH_KEY' | 'LOW_KEY' | 'MIXED';
  equipment: string[];
  specialNotes: string[];
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
}

export interface DifficultScene {
  sceneId: string;
  sceneNumber: number;
  difficultyFactors: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  specialPersonnel: string[];
  permits: string[];
  insurance: string[];
  preparation: string[];
  alternatives: string[];
}

export interface PermitRequirement {
  type: 'LOCATION' | 'WEAPON' | 'EXPLOSIVE' | 'ANIMAL' | 'AIRCRAFT' | 'TRAFFIC' | 'FIRE' | 'OTHER';
  description: string;
  scenes: number[];
  authority: string;
  leadTime: string;
  cost: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  required: boolean;
}

export interface EquipmentRequirement {
  category: 'CAMERA' | 'LIGHTING' | 'SOUND' | 'GRIP' | 'ELECTRICAL' | 'SPECIAL';
  item: string;
  scenes: number[];
  quantity: number;
  duration: string; // rental period
  alternatives: string[];
  cost: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  leadTimeDays?: number;
}

export interface ProductionRisk {
  id: string;
  category: 'SAFETY' | 'WEATHER' | 'PERMIT' | 'TALENT' | 'EQUIPMENT' | 'LOCATION' | 'BUDGET';
  description: string;
  likelihood: number; // 1-5
  severity: number; // 1-5
  scenes: number[];
  mitigation: string[];
  contingency: string[];
}

export interface SafetyAnalysis {
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  risks: ProductionRisk[];
  requiredPersonnel: string[];
  requiredEquipment: string[];
  protocols: string[];
  insurance: string[];
  medicalRequirements: string[];
}

export interface ThemeAnalysis {
  primaryThemes: string[];
  secondaryThemes: string[];
  motifs: string[];
  symbols: string[];
  narrativeStructure: string;
  genreElements: string[];
  toneShifts: Array<{
    sceneNumber: number;
    from: string;
    to: string;
    reason: string;
  }>;
}

export interface ResourcePlanning {
  crewRequirements: { [role: string]: number };
  equipmentNeeds: EquipmentRequirement[];
  locationDays: { [location: string]: number };
  talentDays: { [character: string]: number };
  specialistDays: { [specialist: string]: number };
}

export interface PacingAnalysis {
  overallPacing: 'SLOW' | 'MODERATE' | 'FAST' | 'VARIABLE';
  actBreakdown: Array<{
    act: number;
    sceneCount: number;
    estimatedMinutes: number;
    pacing: string;
    keyEvents: string[];
  }>;
  rhythmPattern: string[];
  climaxPoints: number[];
  pacingIssues: string[];
}

export interface BudgetFlag {
  category: string;
  description: string;
  estimatedCost: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  scenes: number[];
  mitigation?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface BudgetAnalysis {
  overallComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  flags: BudgetFlag[];
  costDrivers: string[];
  savingOpportunities: string[];
  riskFactors: string[];
  targetBudget?: number;
  currency: string; // e.g., 'USD', 'EUR'
}

export interface ProductionScheduleEntry {
  id: string;
  taskName: string;
  start: string; // ISO Date string
  end: string; // ISO Date string
  progress: number; // 0-100
  dependencies?: string[]; // array of task ids
  type: 'task' | 'milestone';
  department: string;
  scenes: number[];
}

export interface ProductionChecklist {
  preProduction: Array<{
    task: string;
    department: string;
    deadline: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    completed: boolean;
  }>;
  production: Array<{
    day: number;
    scenes: number[];
    requirements: string[];
    specialNotes: string[];
  }>;
  postProduction: Array<{
    task: string;
    department: string;
    dependencies: string[];
    estimatedTime: string;
  }>;
}

export interface ExtraRequirements {
  scenes: Array<{
    sceneNumber: number;
    extraCount: number;
    description: string;
    specialRequirements: string[];
    wardrobe: string[];
  }>;
  totalExtras: number;
  specialtyExtras: string[];
  castingNotes: string[];
}

export interface ComprehensiveSafety {
  overallAssessment: SafetyAnalysis;
  sceneSpecificRisks: Array<{
    sceneNumber: number;
    risks: SafetyNote[];
    protocols: string[];
  }>;
  requiredTraining: string[];
  emergencyProcedures: string[];
}

export interface IntimacyCoordination {
  scenesRequiring: number[];
  coordinatorRequired: boolean;
  protocolsNeeded: string[];
  consentDocuments: string[];
  specialConsiderations: string[];
}

export interface AnimalCoordination {
  animalsInvolved: Array<{
    animal: string;
    scenes: number[];
    requirements: string[];
    safety: string[];
  }>;
  trainerRequired: boolean;
  permits: string[];
  welfare: string[];
}

export interface StuntCoordination {
  stuntsRequired: Array<{
    sceneNumber: number;
    description: string;
    complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'EXTREME';
    personnel: string[];
    equipment: string[];
    safety: string[];
  }>;
  coordinatorRequired: boolean;
  insurance: string[];
  rehearsals: string[];
}

export interface PostProductionNotes {
  editingNotes: string[];
  vfxRequirements: Array<{
    sceneNumber: number;
    description: string;
    complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
    software: string[];
  }>;
  soundDesign: string[];
  colorGrading: string[];
  musicNotes: string[];
}

export interface CostumeRequirement {
  character: string;
  scenes: number[];
  description: string;
  period: string;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  specialRequirements: string[];
  duplicates: number;
}

// Main Complete Analysis Interface
export interface CompleteAnalysis {
  id: string;
  filename: string;
  createdAt: string;
  lastModified: string;
  
  // 27 Analysis Sections
  metadata: ScriptMetadata;
  scenes: SceneStructure[];
  characters: CharacterDetail[];
  locations: LocationDetail[];
  props: PropDetail[];
  vehicles: VehicleDetail[];
  weapons: WeaponDetail[];
  lighting: LightingScheme[];
  difficultScenes: DifficultScene[];
  permits: PermitRequirement[];
  equipment: EquipmentRequirement[];
  risks: ProductionRisk[];
  relationships: CharacterRelationship[];
  themes: ThemeAnalysis;
  emotionalArcs: EmotionalArcData;
  psychology: PsychologicalAnalysis;
  resources: ResourcePlanning;
  pacing: PacingAnalysis;
  technical: TechnicalRequirement[];
  budget: BudgetAnalysis;
  checklist: ProductionChecklist;
  extras: ExtraRequirements;
  safety: ComprehensiveSafety;
  intimacy: IntimacyCoordination;
  animals: AnimalCoordination;
  stunts: StuntCoordination;
  postProduction: PostProductionNotes;
  productionSchedule?: ProductionScheduleEntry[];
}

// Analysis Progress Tracking
export interface AnalysisProgress {
  currentSection: string;
  sectionsComplete: number;
  totalSections: number;
  percentage: number;
  estimatedTimeRemaining: number;
  errors: string[];
}

// Film Industry Roles
export enum FilmRole {
  DIRECTOR = 'Director',
  PRODUCER = 'Producer',
  CINEMATOGRAPHER = 'Cinematographer',
  PRODUCTION_DESIGNER = 'Production Designer',
  COSTUME_DESIGNER = 'Costume Designer',
  SCRIPT_SUPERVISOR = 'Script Supervisor',
  FIRST_AD = 'First AD',
  SECOND_AD = 'Second AD',
  SOUND_ENGINEER = 'Sound Engineer',
  SAFETY_COORDINATOR = 'Safety Coordinator',
  STUNT_COORDINATOR = 'Stunt Coordinator',
  VFX_SUPERVISOR = 'VFX Supervisor',
  GAFFER = 'Gaffer',
  KEY_GRIP = 'Key Grip'
}

// Analysis History
export interface AnalysisHistoryEntry {
  id: string;
  filename: string;
  analysis: CompleteAnalysis;
  timestamp: number;
  analysisType: string;
  version: string;
  fileSize: number;
  processingTime: number;
}

// Export Configuration
export interface ExportConfig {
  format: 'PDF' | 'CSV' | 'JSON' | 'EXCEL' | 'WORD';
  sections: string[];
  role?: FilmRole;
  customization: {
    includeDiagrams: boolean;
    includeStatistics: boolean;
    includeRawData: boolean;
    template?: string;
  };
} 