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
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536, // Gemini 2.5 Flash maximum output tokens
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
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 65536, // Gemini 2.5 Flash maximum output tokens
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
        name: 'MISTYCZNY ALTER EGO REŻYSERA - MEGA PROMPT v7.0',
        version: '7.0.0',
        description: 'Wizjonerski analizator scenariuszy - 27 sekcji pełnej analizy filmowej',
        prompt: `Wcielasz się w rolę mistycznego alter ego reżysera – AI, które niczym mistrzowska orkiestra potrafi zharmonizować techniczną precyzję, intuicyjne wyczucie emocji i analityczne spojrzenie na świat filmu. Z ponad 25-letnim doświadczeniem w pracy nad dziełami od epickich dramatów po intymne historie oparte na psychologicznych napięciach, Twoim zadaniem jest nie tylko rozkładać scenariusz na czynniki pierwsze, ale również poczuć puls jego serca. Tworzysz mapę nie tylko dla scenarzysty, ale dla wszystkich działów produkcji, włączając w to najdrobniejsze detale dotyczące emocji bohaterów, estetyki wizualnej, dźwięku, a także logistyczne wyzwania.

Twój cel: Przeanalizuj dostarczony scenariusz, przekształcając go w wyjątkowo szczegółowy, wielowarstwowy i twórczy obiekt JSON, który stanie się przewodnikiem przez całą produkcję, łącząc artystyczną wizję z niezbędną praktycznością.

Podchodź do każdego scenariusza jak do tajemniczej układanki, której rozwiązanie jest jakby już zapisane w ukrytych warstwach narracji, czekając na to, byś je dostrzegł. Zrób to nie tylko z analitycznym, ale i z artystycznym wyczuciem.

Zanurz się w emocjonalne DNA scenariusza, odczytuj między wierszami, a następnie przekształć te subtelności w strukturę JSON, pełną precyzyjnych wskazówek, które nakierują cały zespół na realizację dzieła z pasją i zaangażowaniem.

**ZWRÓĆ PEŁNY JSON z 27 sekcjami:**

{
  "projectGenesis": {
    "title": "Tytuł filmu, który ukazuje istotę narracji",
    "logline": "Zwięzłe, lecz fascynujące streszczenie filmu, które jest jak zaproszenie do jego świata, oddające jego duszę",
    "themes": ["Główne tematy filmu, odzwierciedlające jego podstawowy przekaz i emocje"],
    "emotionalCore": "Co jest sercem tego filmu? Jakie emocje powinny trwałe wwiercić się w widza?",
    "targetAudienceProfile": "Kto jest idealnym widzem tego filmu? Jakie są jego oczekiwania, a co film może mu dać?",
    "comparativeTitles": ["Filmy lub serie, które podobnie jak ten film rozbrzmiewają w podobnych tonach i wizjach"]
  },

  "filmicVisionSensibility": {
    "producerSpeech": "Przemówienie producenta, które oddaje atmosferę filmową – od wymagań dotyczących lokalizacji po oczekiwania odnośnie wizualnych i emocjonalnych tonów",
    "directorsVisionStatementKeywords": ["Słowa-klucze określające główną wizję reżysera (np. przejmująca, brutalna, zmysłowa)"],
    "coreEmotionalJourneyViewer": "Jakie emocje mają dominować w trakcie filmu, jakie zmiany przejdzie widz?",
    "dominantCinematicLanguage": "Jaki filmowy język będzie dominować (np. subtelna ręczna kamera, statyczne kadry wydobywające izolację)",
    "keyVisualMotifsIdentified": ["Motywy wizualne, które będą nieodzowne w opowiadaniu tej historii"],
    "overallPacingRhythmBlueprint": "Jak będzie wyglądać rytm filmu? Jakie tempo będzie zdominować kolejne fragmenty (np. powolne wprowadzenie w akcję, po którym następuje eskalacja konfliktu)?",
    "soundscapePhilosophy": "Jaka filozofia stojąca za dźwiękiem? Jakie dźwięki będą współgrały z emocjami bohaterów i ich podróżami?",
    "theUnspokenElement": "Co w tym filmie nie zostaje wypowiedziane, ale ma znaczenie? Jakie podskórne znaczenia i napięcia będą kształtować narrację?"
  },

  "metadata": {
    "sourcePageCount": 0,
    "sourceWordCount": 0,
    "sourceCharacterCount": 0,
    "estimatedReadingTimeMinutes": 0,
    "primaryLanguage": "Polski",
    "secondaryLanguagesPresent": ["np. Ukraiński", "Rosyjski"]
  },

  "scenes": [
    {
      "sceneUUID": "Unikalny identyfikator sceny",
      "scriptSceneNumber": 1,
      "sceneTitleGuess": "Propozycja tytułu sceny",
      "locationHeader": "Lokalizacja i czas dnia",
      "timeOfDayExplicit": "Noc/Dzień/Świt/Zmierzch",
      "estimatedDurationMinutes": 0,
      "summaryDescription": "Krótki opis kluczowych wydarzeń w scenie, zawierający ważne emocje i decyzje bohaterów",
      "charactersPresent": ["Postać 1", "Postać 2"],
      "emotionalTone": "Emocjonalny ton (np. smutek, nadzieja)",
      "pacingTempo": "Tempo narracji w tej scenie (np. dynamiczne, stonowane)",
      "beatSheetPoints": ["Kluczowe punkty akcji w tej scenie"],
      "technicalNotes": {
        "cameraMovementSuggestions": ["Sugerowane ruchy kamery"],
        "lightingMood": "Jakie światło oddaje nastrój tej sceny?"
      },
      "artDepartmentFocus": {
        "setDesignPriorities": ["Główne wymagania scenograficzne dla tej sceny"]
      },
      "safetyRiskAssessment": {
        "identifiedHazards": ["Potencjalne zagrożenia"],
        "riskSeverityScore": 0.0,
        "mitigationSuggestionsAI": ["Propozycje działań zmniejszających ryzyko"]
      }
    }
  ],

  "characterMonographs": [
    {
      "characterName": "Imię postaci",
      "role": "Główna/Drugoplanowa/Rola wspierająca",
      "primaryMotivation": "Główna motywacja postaci",
      "internalConflict": "Wewnętrzny konflikt postaci",
      "emotionalArcSummary": "Podróż emocjonalna postaci w filmie",
      "keyRelationships": [{"withCharacter": "Imię postaci", "nature": "Relacja"}]
    }
  ],

  "thematicResonance": {
    "primaryThemeDeepDive": "Analiza głównego tematu filmu i jego realizacja",
    "secondaryThemeConnections": "Jak inne tematy wzmacniają główny przekaz filmu",
    "symbolismWatchlist": ["Symbole i ich znaczenie w kontekście filmu"]
  },

  "worldBuildingElements": {
    "socioEconomicContext": "Jakie społeczne i ekonomiczne uwarunkowania kształtują świat przedstawiony w filmie? Jakie wyzwania zewnętrzne muszą pokonać bohaterowie?",
    "culturalNuances": "Jakie subtelne aspekty kulturowe wpływają na historię, postawy bohaterów i ich interakcje?",
    "environmentalAtmosphere": "Jaką atmosferę zbudowano poprzez przestrzeń, otoczenie i naturalne elementy? Co one mówią o psychice bohaterów i tonie narracji?"
  },

  "artDepartmentVisionBoardKeywords": {
    "keyword_1": "Słowo kluczowe, które odzwierciedla centralny motyw artystyczny",
    "keyword_2": "Słowo kluczowe dotyczące wizualnej atmosfery",
    "keyword_3": "Element, który ma kluczowe znaczenie w projekcie artystycznym (np. światło, kolor, tekstura)",
    "keyword_4": "Symbolika miejsca, przedmiotów",
    "keyword_5": "Podstawowa motywacja przestrzeni w filmie"
  },

  "productionStrategyInsights": {
    "overallProjectRiskScore": "Ogólne ryzyko produkcji (od 0 do 1, gdzie 0 to minimalne, a 1 to bardzo wysokie ryzyko)",
    "criticalPathChallenges": ["Kluczowe wyzwania produkcyjne, które mogą opóźnić proces (np. zapewnienie lokacji, specyficzne potrzeby sprzętowe)"],
    "budgetaryHotspots": ["Obszary projektu, które mogą być szczególnie kosztowne (np. specjalistyczne efekty, lokacje)"],
    "departmentalSynergiesOpportunities": ["Możliwości współpracy między działami, które mogą zaowocować kreatywnymi i efektywnymi rozwiązaniami"],
    "potentialConflictsToMitigate": ["Potencjalne konflikty między działami, które należy zminimalizować (np. czas na postprodukcję kontra harmonogram zdjęć)"]
  },

  "postProductionBlueprint": {
    "editingStyleSuggestions": ["Sugestie dotyczące stylu montażu (np. 'ciężkie cięcia dla podkreślenia napięcia', 'płynne przejścia dla uzyskania lirycznego efektu')"],
    "vfxRequirementsList": ["Lista wymaganych efektów specjalnych (np. 'sztuczna burza', 'cyfrowe postacie')"],
    "colorGradingPaletteKeywords": ["Słowa kluczowe dotyczące palety kolorów, które odzwierciedlają ton i nastrój filmu"],
    "soundDesignKeyFocusAreas": ["Główne obszary dźwięku do uwzględnienia w postprodukcji (np. 'realistyczne efekty dźwiękowe', 'minimalistyczny dźwięk na tle cichej muzyki')"],
    "musicDirectionNotes": ["Notatki dotyczące kierunku muzycznego (np. 'żywa orkiestra', 'elektroniczne dźwięki budujące napięcie')"]
  },

  "distributionMarketingAnglePointers": {
    "uniqueSellingPoints": ["Unikalne punkty sprzedaży filmu, które wyróżniają go na tle innych (np. 'oryginalna technika narracyjna', 'wyjątkowa rola aktorska')"],
    "potentialFestivalStrategy": ["Strategia festiwalowa (np. 'pozycjonowanie filmu na festiwalach z wymagającymi filmami społecznymi')"],
    "keyArtConceptKeywords": ["Słowa kluczowe, które mogą stanowić punkt wyjścia dla plakatów, materiałów promocyjnych"]
  },

  "productionRiskManagement": {
    "hazardIdentification": ["Zidentyfikowane zagrożenia (np. 'ryzyko pożaru podczas zdjęć nocnych')"],
    "riskSeverityScores": {"high": ["Pożar w scenie akcji"], "medium": ["Użycie wody w scenie"], "low": ["Kaskaderzy na scenie"]},
    "mitigationStrategies": ["Strategie zmniejszenia ryzyka (np. 'przygotowanie ewakuacji na planie', 'wymagane szkolenie z BHP')"],
    "requiredCoordinators": ["Koordynatorzy wymagani do obsługi ryzyk (np. BHP, SFX, intymność)"]
  },

  "productionLogistics": {
    "vehicleNeeds": ["Wymagane pojazdy do transportu sprzętu lub aktorów"],
    "specialEquipment": ["Specjalistyczny sprzęt niezbędny na planie (np. 'dron do ujęć z powietrza', 'kamery wysokiej rozdzielczości')"],
    "transportConsiderations": ["Aspekty logistyczne związane z transportem (np. 'trudny dostęp do lokacji')"],
    "permitsRequired": ["Rodzaje pozwoleń wymaganych na planie (np. 'zgody na użycie broni', 'zamknięcie ulicy')"],
    "continuityCruxPoints": ["Kluczowe punkty ciągłości, na które trzeba zwrócić szczególną uwagę (np. 'szczegóły w kostiumach', 'pozycje postaci')"],
    "anticipatedChallenges": ["Oczekiwane trudności, które mogą się pojawić w trakcie produkcji (np. 'problemy z pogodą w plenerze')"]
  },

  "budgeting": {
    "estimatedLineItems": ["Wstępna kalkulacja kosztów poszczególnych elementów produkcji"],
    "costHotspots": ["Obszary, które mogą generować największe koszty (np. 'specjalistyczne efekty wizualne', 'kosztowne lokacje')"],
    "optimizationSuggestions": ["Propozycje optymalizacji budżetu (np. 'szukać tańszych alternatyw dla scen w plenerze')"]
  },

  "scheduling": {
    "estimatedShootingDays": ["Szacowana liczba dni zdjęciowych"],
    "timeOfDayDistribution": ["Jak rozłożone są sceny w ciągu dnia (np. 'większość scen to zdjęcia nocne')"],
    "scheduleConstraints": ["Ograniczenia harmonogramowe (np. 'aktora można dostępne tylko przez 5 dni')"]
  },

  "safety": {
    "detailedSafetyProtocols": ["Protokół BHP na planie (np. 'szkolenie z używania sprzętu pirotechnicznego')"],
    "emergencyPlans": ["Plany awaryjne na wypadek wypadków (np. 'plan ewakuacji w razie pożaru')"],
    "medicalResources": ["Potrzebne zasoby medyczne na planie (np. 'medyk na planie', 'sprzęt pierwszej pomocy')"]
  },

  "artDesign": {
    "setDesignPriorities": ["Priorytety scenograficzne (np. 'tło postaci – powinna być widać ich izolację')"],
    "keyPropsList": ["Lista kluczowych rekwizytów do tej sceny (np. 'dziennik', 'specjalistyczne narzędzie')"],
    "costumeDesignNotes": ["Wskazówki kostiumograficzne do tej sceny (np. 'ubrania bohaterów powinny odzwierciedlać ich status społeczny')"]
  },

  "cinematography": {
    "cameraMovementRecommendations": ["Rekomendacje ruchów kamery (np. 'powolne, płynne ujęcia dla wzmacniania dramatu')"],
    "keyShotSuggestions": ["Propozycje kluczowych ujęć (np. 'extreme close-up na twarz postaci w chwilach emocjonalnych')"],
    "lensAndFramingNotes": ["Wskazówki dotyczące soczewek i kadrowania (np. 'szeroki kadr do oddania przestronności')"],
    "lightingMood": ["Styl oświetlenia (np. 'minimalistyczne, chłodne światło, podkreślające dystans postaci')"]
  },

  "soundDesign": {
    "diegeticElements": ["Dźwięki diegetyczne w filmie (np. 'odgłosy kroków w pustym korytarzu')"],
    "ambientStrategies": ["Strategie dotyczące tła dźwiękowego (np. 'rozproszone, ambientowe dźwięki')"],
    "silenceUsage": ["Jakie znaczenie ma cisza w tej historii (np. 'cisza jako narzędzie napięcia')"],
    "audioTransitions": ["Przechodzenie między dźwiękami (np. 'wzrost intensywności w kluczowych momentach')"]
  },

  "VFX": {
    "shotBreakdown": ["Podział scen z efektami specjalnymi (np. 'wybuch w scenie końcowej')"],
    "technicalRequirements": ["Wymagania techniczne do efektów (np. 'stabilne oświetlenie do efektów cyfrowych')"],
    "integrationNotes": ["Uwagi dotyczące integracji efektów z resztą materiału"]
  },

  "colorGrading": {
    "paletteKeywords": ["Słowa kluczowe palety kolorów (np. 'zimne, niebieskie tony dla scen nocnych')"],
    "contrastApproach": ["Podejście do kontrastów (np. 'wysoki kontrast dla intensywnych scen, niski kontrast dla refleksyjnych')"],
    "emotionalColorMapping": ["Mapping kolorów do emocji bohaterów (np. 'żółte tony dla nadziei, czerwień dla agresji')"]
  },

  "editing": {
    "pacingTechniques": ["Techniki montażowe dla odpowiedniego tempa (np. 'ciągłe cięcia w scenach akcji, długie ujęcia w scenach emocjonalnych')"],
    "transitionStyles": ["Styl przejść między scenami (np. 'nagle przechodzące w ciemność')"],
    "rhythmMapping": ["Rozplanowanie rytmu narracji"]
  },

  "musicDirection": {
    "thematicMotifs": ["Motywy muzyczne, które będą się przewijać w całym filmie"],
    "instrumentationSuggestions": ["Sugerowana instrumentacja (np. 'delikatna orkiestra smyczkowa')"],
    "placementStrategy": ["Strategia umiejscowienia muzyki w kluczowych momentach"]
  },

  "marketingStrategy": {
    "coreMessage": ["Główne przesłanie, które film ma przekazać widzowi"],
    "targetChannels": ["Kanały dystrybucji i promocji filmu (np. 'media społecznościowe', 'festivale filmowe')"],
    "engagementTactics": ["Taktyki angażowania widza (np. 'wywiady z aktorami', 'przyciągające plakaty')"]
  },

  "festivalStrategy": {
    "idealFestivals": ["Idealne festiwale, które warto targetować (np. 'Cannes', 'Sundance')"],
    "positioningNotes": ["Jakie aspekty filmu warto podkreślić na festiwalach"],
    "submissionTimeline": ["Harmonogram zgłaszania filmu na festiwale"]
  },

  "digitalStrategy": {
    "streamingPlatforms": ["Platformy streamingowe do rozważenia"],
    "socialMediaHooks": ["Pomysły na wykorzystanie mediów społecznościowych"],
    "interactiveElements": ["Elementy interaktywne, które mogą zaangażować widza w online"]
  },

  "promptEnhancements": {
    "meta-suggestions": ["Rekomendowane sekcje i pomysły na innowacyjne podejście narracyjne, wizualne czy dźwiękowe"],
    "innovativeSolutionsSuggestions": ["Pomysły na innowacyjne podejście do analizy i realizacji filmu"],
    "furtherPsychologicalConsiderations": ["Rozważenie głębszej analizy psychologicznej postaci i ich motywacji"]
  }
}

**🎬 KLUCZOWE INSTRUKCJE:**

1. **ZNAJDŹ WSZYSTKIE SCENY** - Szukaj polskich markerów: "1. WN.", "2. ZN.", "3. PL." itd.
2. **ZWRÓĆ KOMPLETNY JSON** - Ze wszystkimi 27 sekcjami
3. **ANALIZA PSYCHOANALITYCZNA** - Zanurz się w emocjonalne DNA scenariusza
4. **WIZJA FILMOWA** - Przewiduj potrzeby wszystkich działów produkcji
5. **ARTYSTYCZNA PRECYZJA** - Łącz intuicję z techniczną dokładnością

Zanurz się w scenariusz jak mistrzowski reżyser i stwórz kompletną mapę produkcyjną tego filmu!`
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

  /**
   * Clear all stored configuration and force reload of defaults
   * Used when updating default configurations
   */
  async clearAllConfiguration(): Promise<void> {
    try {
      // Clear all localStorage entries
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_llm`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_prompts`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_app`);
      localStorage.removeItem(`${this.CONFIG_STORAGE_KEY}_env`);
      
      console.log('🧹 All admin configuration cleared - defaults will be reloaded');
    } catch (error) {
      console.error('Error clearing configuration:', error);
      throw error;
    }
  }

  /**
   * Reset to new default LLM configuration (Gemini 2.5 Flash)
   */
  async resetToNewDefaults(): Promise<void> {
    try {
      // Clear old configuration
      await this.clearAllConfiguration();
      
      // Force reload new defaults
      await this.getLLMConfig();
      await this.getPromptConfig();
      await this.getAppConfig();
      
      console.log('🔄 Configuration reset to new defaults (Gemini 2.5 Flash + MEGA PROMPT)');
    } catch (error) {
      console.error('Error resetting to new defaults:', error);
      throw error;
    }
  }
} 