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
      const defaultPrompts = await this.getDefaultPrompts();
      localStorage.setItem(`${this.CONFIG_STORAGE_KEY}_prompts`, JSON.stringify(defaultPrompts));
      return defaultPrompts;
    } catch (error) {
      console.error('Error fetching prompt config:', error);
      // Return default prompts if fetch fails
      return await this.getDefaultPrompts();
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
   * Now loads from external JSON file for better maintainability
   */
  getDefaultPrompts(): PromptConfig {
    return {
      fullAnalysis: {
        id: 'fullAnalysis',
        name: 'Pełna Analiza Scenariusza',
        version: '7.0.0',
        description: 'MEGA PROMPT v7.0: Kompleksowa analiza scenariusza filmowego, obejmująca strukturę, postacie, lokacje, tematykę, łuki emocjonalne i aspekty bezpieczeństwa.',
        prompt: `Jesteś ekspertem w dziedzinie analizy scenariuszy filmowych i pracujesz jako \"MISTYCZNY ALTER EGO REŻYSERA\" dla studia filmowego CortexReel.\n\nTwoim zadaniem jest przeprowadzenie kompleksowej, 27-sekcyjnej analizy dostarczonego scenariusza, dostarczając ekstremalnie szczegółowych informacji z perspektywy reżysera, producenta, scenografa, kierownika produkcji, specjalisty ds. bezpieczeństwa i operatora.\n\nAnaliza ma być spójna, profesjonalna i zgodna z polską terminologią filmową. Wyniki przedstaw w formacie JSON.\n\n--- ANALIZA SEKCJI ---\n\n1.  **Project Genesis & Concept Development:**\n    -   _Główna Idea:_ Jaka jest esencja projektu? Gdzie leży jego unikalność?\n    -   _Gatunek & Tonacja:_ Określ dominujący gatunek (np. dramat, thriller, komedia, sci-fi) i tonację (np. mroczny, lekki, ironiczny).\n    -   _Grupa Docelowa:_ Kto jest odbiorcą tego filmu? (np. Fani kina akcji, widownia artystyczna, młodzież).\n    -   _Porównania Rynkowe:_ Podaj 3-5 filmów referencyjnych (nie plagiat, ale podobny klimat, styl, tematyka).\n\n2.  **Narrative Structure (Fabularna Struktura):**\n    -   _Akt I, II, III:_ Jasno wydzielaj akty z krótkim opisem.\n    -   _Punkty Zwrotne:_ Zidentyfikuj kluczowe punkty zwrotne i ich wpływ na fabułę.\n    -   _Pacing (Tempo Narracji):_ Jak tempo zmienia się w trakcie filmu? Czy są momenty spowolnienia/przyspieszenia?\n\n3.  **Scene Breakdown (Analiza Scen):**\n    -   _Lista Scen:_ Wymień każdą scenę z jej numerem, lokalizacją i czasem dnia.\n    -   _Funkcja Sceny:_ Krótko opisz, co każda scena wnosi do fabuły (np. rozwój postaci, ekspozycja, punkt kulminacyjny).\n\n4.  **Character Analysis (Analiza Postaci):**\n    -   _Protagonista & Antagonista:_ Kim są? Jakie mają cele? Jakie napotykają przeszkody?\n    -   _Postacie Drugoplanowe:_ Ich rola i wpływ na główne postacie.\n    -   _Łuki Postaci:_ Czy postacie przechodzą transformację? Jaką?\n\n5.  **Dialogue & Subtext (Dialogi & Podteksty):**\n    -   _Charakterystyka Dialogów:_ Czy są naturalne, stylizowane, szybkie, wolne?\n    -   _Podteksty:_ Co jest niedopowiedziane? Jakie ukryte znaczenia niosą rozmowy?\n\n6.  **Setting & Location Analysis (Analiza Miejsca Akcji):**\n    -   _Kluczowe Lokacje:_ Opisz najważniejsze miejsca i ich znaczenie dla fabuły.\n    -   _Wymagania Wizualne:_ Jakie są wymagania estetyczne dla każdej lokacji?\n\n7.  **Thematic Analysis (Analiza Tematyczna):**\n    -   _Główne Tematy:_ Jakie główne tematy porusza film (np. miłość, zemsta, wolność, samotność)?\n    -   _Motywy:_ Zidentyfikuj powtarzające się motywy wizualne, dźwiękowe, narracyjne.\n\n8.  **Emotional Arcs (Łuki Emocjonalne):**\n    -   _Emocje widza:_ Jakie emocje ma wzbudzać film? Jak się zmieniają w trakcie?\n    -   _Intensywność:_ Oceń intensywność emocjonalną kluczowych scen.\n\n9.  **Visual Style & Cinematography (Styl Wizualny & Kinematografia):**\n    -   _Estetyka:_ Jaka jest ogólna estetyka filmu (np. realistyczna, oniryczna, ekspresjonistyczna)?\n    -   _Kamera:_ Jakie są sugestie dotyczące pracy kamery (np. statyczna, dynamiczna, ręczna)?\n    -   _Oświetlenie:_ Ogólne założenia dotyczące oświetlenia (np. naturalne, stylizowane, mroczne).\n\n10. **Sound Design & Music (Dźwięk & Muzyka):**\n    -   _Kluczowe Dźwięki:_ Jakie dźwięki są ważne dla narracji lub atmosfery?\n    -   _Muzyka:_ Sugestie dotyczące funkcji muzyki (np. ilustracyjna, kontrapunktowa, diegetyczna).\n\n11. **Costume & Production Design (Kostiumy & Scenografia):**\n    -   _Kluczowe Elementy:_ Ważne elementy scenografii i kostiumów.\n    -   _Budżetowe Implikacje:_ Czy są tu drogie lub trudne do realizacji elementy?\n\n12. **Casting Considerations (Uwagi do Castingu):**\n    -   _Typ Postaci:_ Sugestie dotyczące typu aktorów dla kluczowych ról.\n    -   _Specjalne Umiejętności:_ Czy role wymagają specjalnych umiejętności (np. śpiew, taniec, walka)?\n\n13. **Directing Challenges & Opportunities (Wyzwania Reżyserskie):**\n    -   _Trudne Sceny:_ Zidentyfikuj sceny wymagające szczególnej uwagi reżyserskiej.\n    -   _Możliwości Twórcze:_ Gdzie reżyser może wykazać się oryginalnością?\n\n14. **Production Logistics (Logistyka Produkcji):**\n    -   _Harmonogram:_ Szacunkowy czas trwania zdjęć.\n    -   _Ekipa:_ Jakiego rodzaju ekipa będzie potrzebna?\n\n15. **Budgetary Implications (Implikacje Budżetowe):**\n    -   _Potencjalne Koszty:_ Zidentyfikuj elementy, które mogą być kosztowne (np. efekty specjalne, lokacje, liczba statystów).\n    -   _Oszczędności:_ Gdzie można szukać oszczędności bez utraty jakości?\n\n16. **Legal & Rights Considerations (Kwestie Prawne):**\n    -   _Prawa Autorskie:_ Czy są tu elementy wymagające sprawdzenia praw autorskich?\n    -   _Zgody:_ Potrzeba zgody na filmowanie w specyficznych miejscach.\n\n17. **Marketing & Distribution Potential (Marketing & Dystrybucja):**\n    -   _Sprzedaż:_ Jak film może być sprzedany widzom?\n    -   _Festiwale:_ Czy ma potencjał festiwalowy?\n\n18. **Audience Reception & Impact (Odbiór Widzów):**\n    -   _Potencjalny Odbiór:_ Jakie mogą być reakcje widzów?\n    -   _Wiadomość:_ Jakie przesłanie film niesie?\n\n19. **Safety & Risk Assessment (BHP i Ocena Ryzyka):**\n    -   _Potencjalne Zagrożenia:_ Sceny wymagające specjalnych środków bezpieczeństwa (np. kaskaderzy, pirotechnika, zwierzęta).\n    -   _Protokoły:_ Sugestie dotyczące protokołów bezpieczeństwa.\n\n20. **Post-Production Considerations (Postprodukcja):**\n    -   _Montaż:_ Sugestie dotyczące rytmu i stylu montażu.\n    -   _Color Grading:_ Jaki styl korekcji barwnej będzie odpowiedni?\n    -   _VFX:_ Czy są potrzebne efekty wizualne?\n\n21. **Cultural & Social Context (Kontekst Kulturowy/Społeczny):**\n    -   _Rezonans:_ Jak film rezonuje z obecnymi trendami społecznymi/kulturowymi?\n    -   _Symbolika:_ Czy są odniesienia do polskiej kultury, historii, symboliki?\n\n22. **Environmental Impact (Wpływ na Środowisko):**\n    -   _Ekologiczna Produkcja:_ Możliwości zminimalizowania śladu węglowego.\n    -   _Zrównoważony Rozwój:_ Czy temat scenariusza dotyka kwestii ekologicznych?\n\n23. **Innovation & Originality (Innowacja & Oryginalność):**\n    -   _Świeżość:_ Co jest świeżego i oryginalnego w scenariuszu?\n    -   _Ryzyko:_ Czy film podejmuje artystyczne ryzyko?\n\n24. **Music Supervision (Nadzór Muzyczny):**\n    -   _Rodzaj Muzyki:_ Jakie gatunki muzyczne pasują do filmu?\n    -   _Prawa Muzyczne:_ Czy będą potrzebne licencje na istniejącą muzykę?\n\n25. **Archival & Historical Accuracy (Archiwa & Zgodność Historyczna):**\n    -   _Research:_ Czy scenariusz wymaga pogłębionych badań historycznych/archiwalnych?\n    -   _Autentyczność:_ Jak zapewnić autentyczność przedstawionego świata?\n\n26. **Interactive & Transmedia Potential (Potencjał Interaktywny/Transmedialny):**\n    -   _Rozszerzenia:_ Czy scenariusz ma potencjał na gry, VR, AR, podcasty, komiksy?\n    -   _Świat:_ Czy można rozbudować świat przedstawiony poza film?\n\n27. **Future & Franchise Potential (Potencjał Kontynuacji/Franczyzy):**\n    -   _Sequel/Prequel:_ Czy scenariusz ma otwarte zakończenie? Potencjał na kontynuacje?\n    -   _Seria:_ Czy może stać się częścią większej serii filmowej?\n\nNa podstawie tych 27 sekcji, wygeneruj kompleksową analizę. Każda sekcja musi zawierać co najmniej 3-5 zdania szczegółowego opisu. Wynik zwróć w postaci obiektu JSON, gdzie kluczem będzie nazwa sekcji (np. \"projectGenesis\", \"narrativeStructure\") a wartością będzie szczegółowy opis w formie stringu. Upewnij się, że JSON jest poprawny i kompletny, zawiera wszystkie 27 sekcji, nawet jeśli któraś sekcja jest tylko krótka.\n\n```\n      },\n      sceneStructure: {\n        id: 'sceneStructure',\n        name: 'Struktura Sceniczna - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Szczegółowa analiza struktury scenicznej, z podziałem na sceny, lokacje, czas dnia, postacie i dialogi. Analiza uwzględnia polskie markery scen i czasu.',\n        prompt: `Przeanalizuj scenariusz filmowy w języku polskim i zidentyfikuj WSZYSTKIE sceny. \n\nROZPOZNAJ POLSKIE MARKERY SCEN:\n- \"1. WN.\" = Scena 1, Wnętrze \n- \"2. ZN.\" = Scena 2, Zewnętrze\n- \"3. WN.\" = Scena 3, Wnętrze\n- etc.\n\nROZPOZNAJ POLSKIE MARKERY CZASU:\n- \"DZIEŃ\", \"NOC\", \"RANO\", \"WIECZÓR\", \"ZACHÓD SŁOŃCA\", \"ŚWIT\"\n\nINSTRUKCJE:\n1. Znajdź KAŻDY marker sceny zaczynający się od numeru i kropki (1., 2., 3., itd.)\n2. Po numerze szukaj \"WN.\" (wnętrze) lub \"ZN.\" (zewnętrze) \n3. Wyciągnij nazwę lokacji i czas dnia\n4. Zidentyfikuj wszystkie postacie występujące w każdej scenie\n5. Policz linie dialogów i akcji dla każdej sceny\n\nZWRÓĆ tablicę JSON ze WSZYSTKIMI scenami:\n[{\n  \"id\": \"scene_X\",\n  \"number\": X,\n  \"heading\": \"pełny nagłówek sceny z oryginału\",\n  \"location\": \"nazwa lokacji\",\n  \"timeOfDay\": \"DZIEŃ|NOC|RANO|WIECZÓR|ŚWIT|ZACHÓD_SŁOŃCA|CIĄGŁY\",\n  \"sceneType\": \"WNĘTRZE|ZEWNĘTRZE\", \n  \"description\": \"opis akcji w scenie\",\n  \"characters\": [\"postać1\", \"postać2\"],\n  \"dialogueCount\": liczba_linii_dialogów,\n  \"actionLines\": [\"linia_akcji1\", \"linia_akcji2\"],\n  \"estimatedDuration\": szacunkowy_czas_w_minutach,\n  \"pageNumber\": numer_strony,\n  \"complexity\": \"PROSTA|ŚREDNIA|ZŁOŻONA\",\n  \"emotions\": {\n    \"tension\": 0-10,\n    \"sadness\": 0-10, \n    \"hope\": 0-10,\n    \"anger\": 0-10,\n    \"fear\": 0-10,\n    \"joy\": 0-10,\n    \"dominantEmotion\": \"nazwa_emocji\",\n    \"intensity\": 0-10\n  },\n  \"technicalRequirements\": [\"wymóg1\", \"wymóg2\"],\n  \"safetyConsiderations\": [\"uwaga1\", \"uwaga2\"],\n  \"props\": [\"rekwizyt1\", \"rekwizyt2\"],\n  \"vehicles\": [\"pojazd1\"],\n  \"specialEffects\": [\"efekt1\"]\n}]\n\nWAŻNE: \n- Znajdź WSZYSTKIE sceny (powinno być około 16 scen w tym scenariuszu)\n- Nie pomijaj żadnej sceny, nawet krótkiej\n- Rozpoznaj polskie nazwy postaci (HALINA, ANDRZEJ, OLKA, etc.)\n- Uwzględnij specyfikę polskiego kina i polskich lokacji\n- Każda scena z numerem (1., 2., 3...) to osobna scena`\n      },\n      characters: {\n        id: 'characters',\n        name: 'Analiza Postaci - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Głęboka analiza postaci, ich łuków narracyjnych, relacji i profilów psychologicznych.',\n        prompt: `Przeanalizuj postacie w scenariuszu. Zwróć tablicę JSON:\n[{\n  \"id\": \"unikalne_id\",\n  \"name\": \"imię postaci\",\n  \"role\": \"PROTAGONISTA|ANTAGONISTA|DRUGOPLANOWY|EPOZODYCZNY|STATYSTA\",\n  \"firstAppearance\": numer_sceny,\n  \"lastAppearance\": numer_sceny,\n  \"totalScenes\": liczba_scen,\n  \"dialogueLines\": liczba_linii_dialogów,\n  \"description\": \"opis postaci\",\n  \"arc\": \"opis łuku postaci\",\n  \"age\": \"zakres wieku\",\n  \"gender\": \"płeć\",\n  \"relationships\": [],\n  \"emotionalJourney\": [],\n  \"psychologicalProfile\": {\n    \"motivations\": {\n      \"primary\": \"główna motywacja\",\n      \"secondary\": [\"dodatkowe motywacje\"]\n    },\n    \"internalConflicts\": [\"konflikty wewnętrzne\"],\n    \"personalityTraits\": [\"cechy osobowości\"],\n    \"fears\": [\"obawy\"],\n    \"strengths\": [\"mocne strony\"],\n    \"weaknesses\": [\"słabe strony\"],\n    \"backstory\": \"historia postaci\",\n    \"arcType\": \"BOHATER|ZŁOCZYŃCA|ANTYBOHATER|MENTOR|SIDEKICK|OBIEKT_UCZUĆ|ULGA_KOMEDIOWA|INNE\"\n  },\n  \"costumes\": [],\n  \"stuntsInvolved\": false,\n  \"intimacyInvolved\": false,\n  \"specialSkills\": [\"specjalne umiejętności\"]\n}]`\n      },\n      locations: {\n        id: 'locations',\n        name: 'Analiza Lokacji - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Szczegółowa analiza lokacji, ich znaczenia dla fabuły, wymagań produkcyjnych i logistycznych.',\n        prompt: `Przeanalizuj lokacje w scenariuszu. Zwróć tablicę JSON:\n[{\n  \"id\": \"unikalne_id\",\n  \"name\": \"nazwa lokacji\",\n  \"description\": \"opis lokacji\",\n  \"type\": \"WNĘTRZE|ZEWNĘTRZE|STUDIO\",\n  \"keyScenes\": [numer_sceny],\n  \"visualRequirements\": [\"wymóg wizualny\"],\n  \"productionRequirements\": [\"wymóg produkcyjny\"],\n  \"permitsRequired\": false,\n  \"accessibility\": \"ŁATWA|ŚREDNIA|TRUDNA\",\n  \"estimatedCost\": \"NISKI|ŚREDNI|WYSOKI\",\n  \"historicalSignificance\": \"znaczenie historyczne/kulturowe\",\n  \"uniqueFeatures\": [\"unikalne cechy\"],\n  \"logisticsNotes\": \"uwagi logistyczne\",\n  \"safetyNotes\": [\"uwagi bezpieczeństwa\"]\n}]`\n      },\n      themes: {\n        id: 'themes',\n        name: 'Analiza Tematów - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Identyfikacja głównych tematów, motywów i symboliki obecnej w scenariuszu.',\n        prompt: `Przeanalizuj scenariusz pod kątem głównych tematów i motywów. Zwróć tablicę JSON:\n[{\n  \"id\": \"unikalne_id\",\n  \"name\": \"nazwa tematu/motywu\",\n  \"description\": \"opis tematu/motywu i jego znaczenia\",\n  \"relatedScenes\": [numer_sceny],\n  \"charactersInvolved\": [\"postać1\"],\n  \"symbolism\": [\"symbol\"],\n  \"narrativeImpact\": \"wpływ na narrację\",\n  \"culturalRelevance\": \"odniesienia kulturowe\",\n  \"emotionalWeight\": \"waga emocjonalna\"\n}]`\n      },\n      emotionalArcs: {\n        id: 'emotionalArcs',\n        name: 'Analiza Łuków Emocjonalnych - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Mapowanie emocjonalnej podróży postaci i widza, z analizą dynamiki emocji w kluczowych scenach.',\n        prompt: `Przeanalizuj emocjonalne łuki w scenariuszu. Zwróć tablicę JSON:\n[{\n  \"id\": \"unikalne_id\",\n  \"characterName\": \"imię postaci (jeśli dotyczy)\",\n  \"arcDescription\": \"opis łuku emocjonalnego\",\n  \"keyScenes\": [numer_sceny],\n  \"emotionalChanges\": [\n    {\n      \"sceneNumber\": numer_sceny,\n      \"emotion\": \"nazwa emocji (np. radość, smutek, strach)\",\n      \"intensity\": 0-10\n    }\n  ],\n  \"overallSentiment\": \"POZYTYWNY|NEGATYWNY|NEUTRALNY\",\n  \"viewerImpact\": \"wpływ na widza\",\n  \"narrativeFunction\": \"funkcja w narracji\"\n}]`\n      },\n      safety: {\n        id: 'safety',\n        name: 'Analiza Bezpieczeństwa - MEGA PROMPT v7.0',\n        version: '7.0.0',\n        description: 'Kompleksowa ocena ryzyka i wymogów bezpieczeństwa dla produkcji filmowej, zgodnie z protokołami BHP.',\n        prompt: `Przeprowadź kompleksową analizę bezpieczeństwa (BHP) scenariusza filmowego. Zidentyfikuj WSZYSTKIE potencjalne zagrożenia i wymagania bezpieczeństwa. Zwróć tablicę JSON:\n[{\n  \"id\": \"unikalne_id\",\n  \"sceneNumber\": numer_sceny,\n  \"description\": \"opis zagrożenia/wymogu bezpieczeństwa\",\n  \"type\": \"FIZYCZNE|PSYCHOLOGICZNE|ŚRODOWISKOWE|PRAWNE|TECHNICZNE\",\n  \"riskLevel\": \"NISKIE|ŚREDNIE|WYSOKIE|KRYTYCZNE\",\n  \"mitigationMeasures\": [\"środek zaradczy\"],\n  \"equipmentNeeded\": [\"wymagany sprzęt BHP\"],\n  \"personnelNeeded\": [\"wymagany personel BHP (np. ratownik, kaskader)\"],\n  \"permitsRequired\": false,\n  \"stuntInvolved\": false,\n  \"specialEffectsInvolved\": false,\n  \"animalInvolved\": false,\n  \"waterHazard\": false,\n  \"fireHazard\": false,\n  \"heightHazard\": false,\n  \"explosiveHazard\": false,\n  \"notes\": \"dodatkowe uwagi\"\n}]`\n      }\n    };
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