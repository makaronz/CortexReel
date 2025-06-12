import type { LLMConfig, PromptConfig, AppConfig } from '@/types/analysis';

export class AdminConfigService {
  private readonly CONFIG_STORAGE_KEY = 'cortexreel_admin_config';

  /**
   * Get current LLM configuration
   */
  async getLLMConfig(): Promise<LLMConfig> {
    try {
      // Try to get from localStorage first
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_llm`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default configuration with current env values
      const defaultConfig = {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'google/gemini-1.5-pro-latest',
        temperature: 0.7,
        maxTokens: 8192,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };
      
      // Save default to localStorage
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_llm`, JSON.stringify(defaultConfig));
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching LLM config:', error);
      // Return default configuration if fetch fails
      return {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'google/gemini-1.5-pro-latest',
        temperature: 0.7,
        maxTokens: 8192,
        topP: 0.9,
        topK: 40,
        presencePenalty: 0,
        frequencyPenalty: 0
      };
    }
  }

  /**
   * Save LLM configuration
   */
  async saveLLMConfig(config: LLMConfig): Promise<void> {
    try {
      // Save to localStorage
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_llm`, JSON.stringify(config));
      
      // Also update environment variables in .env.local file
      await this.updateEnvFile('VITE_GEMINI_API_KEY', config.apiKey);
      
      console.log('LLM configuration saved successfully');
    } catch (error) {
      console.error('Error saving LLM config:', error);
      throw error;
    }
  }

  /**
   * Get current prompt configurations
   */
  async getPromptConfig(): Promise<PromptConfig> {
    try {
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_prompts`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default prompts and save them
      const defaultPrompts = this.getDefaultPrompts();
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_prompts`, JSON.stringify(defaultPrompts));
      return defaultPrompts;
    } catch (error) {
      console.error('Error fetching prompt config:', error);
      // Return default prompts if fetch fails
      return this.getDefaultPrompts();
    }
  }

  /**
   * Save prompt configurations
   */
  async savePromptConfig(config: PromptConfig): Promise<void> {
    try {
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_prompts`, JSON.stringify(config));
      console.log('Prompt configuration saved successfully');
    } catch (error) {
      console.error('Error saving prompt config:', error);
      throw error;
    }
  }

  /**
   * Get current app configuration
   */
  async getAppConfig(): Promise<AppConfig> {
    try {
      const stored = localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_app`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default configuration and save it
      const defaultConfig = {
        appName: 'CortexReel',
        maxFileSize: 10485760,
        supportedFormats: 'pdf,txt',
        debugMode: false,
        logLevel: 'info',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: false
      };
      
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_app`, JSON.stringify(defaultConfig));
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching app config:', error);
      // Return default configuration if fetch fails
      return {
        appName: 'CortexReel',
        maxFileSize: 10485760,
        supportedFormats: 'pdf,txt',
        debugMode: false,
        logLevel: 'info',
        enableOCR: true,
        enableAdvancedCharts: true,
        enableExport: true,
        enableCollaboration: false
      };
    }
  }

  /**
   * Save app configuration
   */
  async saveAppConfig(config: AppConfig): Promise<void> {
    try {
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_app`, JSON.stringify(config));
      console.log('App configuration saved successfully');
    } catch (error) {
      console.error('Error saving app config:', error);
      throw error;
    }
  }

  /**
   * Update environment file with new values
   */
  private async updateEnvFile(key: string, value: string): Promise<void> {
    try {
      // In a real application, this would make an API call to update the .env.local file
      // For now, we'll just log the change and store it in localStorage
      console.log(`Environment variable ${key} would be updated to: ${value}`);
      
      // Store env changes in localStorage for now
      const envChanges = JSON.parse(localStorage.getItem(`${this.CONFIG_STORAGE_KEY}_env`) || '{}');
      envChanges[key] = value;
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_env`, JSON.stringify(envChanges));
      
      // In a production environment, you would need a backend service to actually write to .env.local
      // This could be done via a Node.js API endpoint that writes to the file system
    } catch (error) {
      console.error('Error updating environment file:', error);
      throw error;
    }
  }

  /**
   * Get default prompt configurations
   */
  getDefaultPrompts(): PromptConfig {
    return {
      fullAnalysis: {
        id: 'fullAnalysis',
        name: 'Pełna Analiza Scenariusza',
        version: '1.0.0',
        description: 'Kompleksowa analiza wszystkich aspektów scenariusza filmowego',
        prompt: `Przeprowadź pełną, profesjonalną analizę scenariusza filmowego. Zwróć szczegółowy JSON raport zawierający wszystkie kluczowe aspekty produkcyjne:

{
  "executiveSummary": {
    "title": "tytuł scenariusza",
    "genre": "gatunek",
    "logline": "krótkie streszczenie w 1-2 zdaniach",
    "pages": liczba_stron,
    "estimatedRuntime": minuty,
    "budgetCategory": "LOW|MEDIUM|HIGH|BLOCKBUSTER",
    "productionComplexity": "SIMPLE|MODERATE|COMPLEX|EXTREMELY_COMPLEX",
    "overallRating": "ocena 1-10",
    "keyStrengths": ["mocne strony"],
    "keyWeaknesses": ["słabe strony"],
    "marketability": "ocena komercyjna 1-10"
  },
  "structuralAnalysis": {
    "actStructure": "THREE_ACT|FIVE_ACT|NON_LINEAR|OTHER",
    "plotPoints": [{
      "type": "INCITING_INCIDENT|PLOT_POINT_1|MIDPOINT|PLOT_POINT_2|CLIMAX|RESOLUTION",
      "page": numer_strony,
      "description": "opis punktu fabularnego"
    }],
    "pacing": {
      "overall": "SLOW|MODERATE|FAST|VARIABLE",
      "act1": "tempo aktu 1",
      "act2": "tempo aktu 2", 
      "act3": "tempo aktu 3",
      "pacingIssues": ["problemy z tempem"]
    },
    "narrativeCoherence": "ocena spójności 1-10"
  },
  "characterAnalysis": {
    "protagonistStrength": "ocena protagonisty 1-10",
    "characterDevelopment": "ocena rozwoju postaci 1-10",
    "dialogueQuality": "ocena dialogów 1-10",
    "castSize": {
      "principals": liczba_głównych_ról,
      "supporting": liczba_ról_drugoplanowych,
      "extras": szacowana_liczba_statystów
    },
    "diversityScore": "ocena różnorodności obsady 1-10"
  },
  "productionRequirements": {
    "locations": {
      "total": liczba_lokacji,
      "interior": liczba_wnętrz,
      "exterior": liczba_planów_zewnętrznych,
      "studio": liczba_lokacji_studyjnych,
      "practical": liczba_lokacji_naturalnych,
      "complexLocations": ["skomplikowane lokacje"]
    },
    "timeOfDay": {
      "day": liczba_scen_dziennych,
      "night": liczba_scen_nocnych,
      "dawn": liczba_scen_o_świcie,
      "dusk": liczba_scen_o_zmierzchu
    },
    "specialRequirements": {
      "stunts": boolean,
      "vfx": boolean,
      "animals": boolean,
      "children": boolean,
      "vehicles": boolean,
      "weapons": boolean,
      "intimacy": boolean,
      "specialEffects": ["efekty specjalne"]
    },
    "crewRequirements": {
      "stuntCoordinator": boolean,
      "vfxSupervisor": boolean,
      "animalHandler": boolean,
      "intimacyCoordinator": boolean,
      "specialistRoles": ["specjalistyczne role"]
    }
  },
  "budgetAnalysis": {
    "estimatedBudget": "MICRO|LOW|MEDIUM|HIGH|BLOCKBUSTER",
    "majorCostDrivers": ["główne czynniki kosztowe"],
    "potentialSavings": ["możliwe oszczędności"],
    "riskFactors": ["czynniki ryzyka budżetowego"]
  },
  "scheduleAnalysis": {
    "estimatedShootDays": liczba_dni_zdjęciowych,
    "complexityFactors": ["czynniki komplikujące harmonogram"],
    "seasonalConsiderations": ["uwagi sezonowe"],
    "weatherDependency": "NONE|LOW|MEDIUM|HIGH"
  },
  "safetyAssessment": {
    "overallRiskLevel": "LOW|MEDIUM|HIGH|EXTREME",
    "majorRisks": ["główne zagrożenia"],
    "requiredSafetyPersonnel": ["wymagany personel BHP"],
    "safetyProtocols": ["protokoły bezpieczeństwa"],
    "insuranceConsiderations": ["uwagi ubezpieczeniowe"]
  },
  "marketAnalysis": {
    "targetAudience": "grupa docelowa",
    "ageRating": "przewidywana kategoria wiekowa",
    "marketPotential": "potencjał rynkowy 1-10",
    "competitiveAnalysis": "analiza konkurencji",
    "distributionStrategy": "strategia dystrybucji"
  },
  "technicalRequirements": {
    "cameraWork": ["wymagania kamery"],
    "lighting": ["wymagania oświetleniowe"],
    "sound": ["wymagania dźwiękowe"],
    "postProduction": ["wymagania postprodukcji"]
  },
  "recommendations": {
    "scriptImprovements": ["sugestie poprawy scenariusza"],
    "productionOptimizations": ["optymalizacje produkcyjne"],
    "riskMitigation": ["łagodzenie ryzyka"],
    "nextSteps": ["następne kroki"]
  },
  "detailedBreakdown": {
    "scenes": [{
      "number": numer_sceny,
      "location": "lokacja",
      "timeOfDay": "pora dnia",
      "characters": ["postacie"],
      "complexity": "SIMPLE|MODERATE|COMPLEX",
      "estimatedTime": "szacowany czas realizacji",
      "specialRequirements": ["specjalne wymagania"],
      "risks": ["zagrożenia"],
      "notes": "dodatkowe uwagi"
    }]
  }
}`
      },
      sceneStructure: {
        id: 'sceneStructure',
        name: 'Analiza Struktury Scen',
        version: '1.0.0',
        description: 'Analizuje strukturę scen w scenariuszu',
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
        name: 'Analiza Postaci',
        version: '1.0.0',
        description: 'Analizuje postacie w scenariuszu',
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
      },
      locations: {
        id: 'locations',
        name: 'Analiza Lokacji',
        version: '1.0.0',
        description: 'Analizuje lokacje w scenariuszu',
        prompt: `Analyze screenplay locations. Return JSON array:
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
}]`
      },
      themes: {
        id: 'themes',
        name: 'Analiza Tematów',
        version: '1.0.0',
        description: 'Analizuje tematy i motywy w scenariuszu',
        prompt: `Analyze themes and narrative elements. Return JSON:
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
}`
      },
      emotionalArcs: {
        id: 'emotionalArcs',
        name: 'Analiza Łuków Emocjonalnych',
        version: '1.0.0',
        description: 'Analizuje łuki emocjonalne w scenariuszu',
        prompt: `Analyze emotional arcs throughout the screenplay. Return JSON:
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
}`
      },
      safety: {
        id: 'safety',
        name: 'Analiza Bezpieczeństwa',
        version: '1.0.0',
        description: 'Analizuje aspekty bezpieczeństwa produkcji',
        prompt: `Comprehensive safety analysis. Return JSON:
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
}`
      }
    };
  }
} 