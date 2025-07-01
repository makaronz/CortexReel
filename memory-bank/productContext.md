# Product Context - CortexReel Standalone

## Problem do Rozwiązania

### Obecny Stan Branży Filmowej
Profesjonaliści branży filmowej (reżyserzy, producenci, operatorzy kamery, koordynatorzy bezpieczeństwa) muszą ręcznie analizować scenariusze pod kątem:
- Wymagań technicznych i logistycznych
- Analizy ryzyka i bezpieczeństwa  
- Planowania budżetu i zasobów
- Koordynacji postaci i lokacji

**Problemy obecnych rozwiązań:**
- Brak narzędzi do kompleksowej analizy scenariuszy
- Ręczna analiza zajmuje dni/tygodnie
- Błędy w planowaniu prowadzą do przekroczeń budżetu
- Brak standaryzacji w analizie ryzyka
- Współpraca między działami utrudniona przez różne formaty danych

## Nasza Propozycja Wartości

### Główne Korzyści
1. **Oszczędność Czasu:** Z tygodni ręcznej analizy do 5-10 minut automatycznej
2. **Kompleksowość:** 27 sekcji analizy pokrywających wszystkie aspekty produkcji
3. **Dokładność:** AI-powered analiza zmniejsza błędy ludzkie
4. **Standaryzacja:** Jednolity format analizy dla całej branży
5. **Role-Based Views:** Każda rola widzi tylko istotne dla niej informacje

### Unikalne Funkcje
- **Multi-Strategy PDF Parsing:** Bezpośrednia ekstrakcja + OCR fallback
- **27-Section Analysis:** Najbardziej komprehensywna analiza na rynku
- **Film Industry Focus:** Specjalizacja w profesjonalnych workflow'ach
- **Real-time Processing:** Live progress tracking podczas analizy
- **Interactive Visualizations:** Zaawansowane wykresy i dashboardy

## Grupa Docelowa

### Pierwotni Użytkownicy
1. **Reżyserzy** - analiza postaci, emocji, struktury narracyjnej
2. **Producenci** - budżet, harmonogram, ryzyko, zasoby  
3. **Operatorzy Kamery** - wymagania techniczne, oświetlenie, lokacje
4. **Koordynatorzy Bezpieczeństwa** - analiza ryzyka, kaskady, broń

### Rozszerzenie w Przyszłości
- Script supervisors
- Production designers  
- VFX supervisors
- Sound engineers
- First/Second ADs

## Sposób Działania

### User Journey
1. **Upload scenariusza** - przeciągnij PDF (do 10MB)
2. **Automatyczne parsowanie** - ekstrakcja tekstu + OCR fallback
3. **Wybór roli** - personalizacja widoku
4. **AI Analysis** - 27 sekcji analizy przez Gemini AI
5. **Interactive Dashboard** - eksploracja wyników
6. **Export** - PDF/CSV/JSON dla różnych działów

### Kluczowe User Stories
- **Jako reżyser** chcę analizować łuki emocjonalne postaci aby lepiej planować reżyserię
- **Jako producent** chcę szybko identyfikować główne koszty i ryzyka aby precyzyjnie budżetować
- **Jako operator kamery** chcę wiedzieć o wymaganiach technicznych każdej sceny aby planować sprzęt
- **Jako koordynator bezpieczeństwa** chcę identyfikować wszystkie potencjalne zagrożenia aby zapewnić bezpieczeństwo

## Metryki Sukcesu

### Krótkoterminowe (3 miesiące)
- Czas analizy scenariusza: <10 minut
- Accuracy analizy: >90% zgodność z ekspercką oceną
- User satisfaction: >4.5/5 w ankietach

### Długoterminowe (12 miesięcy)  
- Adoption w studiach filmowych: >50% użytkowników powraca
- ROI dla użytkowników: >300% oszczędności czasu
- Industry standard: uznanie jako standard branżowy

## Różnicowanie od Konkurencji

### Przewagi Konkurencyjne
1. **Specialized for Film Industry** - inne narzędzia są generic
2. **27 Comprehensive Sections** - najbardziej kompletna analiza
3. **AI-Powered Accuracy** - Google Gemini zapewnia wysoką jakość
4. **Role-Based Filtering** - personalizacja dla każdej roli filmowej
5. **Offline Capability** - działanie bez internetu po pierwszym załadowaniu

### Potencjalni Konkurenci
- WriterDuet (focus na pisanie, nie analizę)
- StudioBinder (breakdown sheets, ale ręczne)
- MovieMagic Scheduling (scheduling, nie analiza)
- **Nasza przewaga:** Jedyny kompleksowy AI-powered analyzer scenariuszy 

## User Input/Output Surface Mapping

This section outlines all known points of interaction with the CortexReel system, fulfilling the mandatory requirement for a user I/O surface map.

### UI Endpoints (Client-Side Routes)
- **`/` (Login Screen):**
  - **Input:** User password.
  - **Output:** Authentication state change, redirects to `/upload`.
- **`/upload` (File Upload View):**
  - **Input:** Drag-and-drop or file selection of a PDF file.
  - **Output:** Initiates parsing and analysis, displays progress, redirects to `/analysis/:id`.
- **`/analysis/:id` (Analysis Dashboard):**
  - **Input:** User selection of role (Director, Producer, etc.), interaction with charts and data tables.
  - **Output:** Displays 27 sections of analysis results in role-specific dashboards and visualizations.
- **`/admin` (Admin Dashboard):**
  - **Input:** Changes to LLM configuration, prompts, and application settings.
  - **Output:** Saves configuration to `localStorage`, provides real-time feedback via UI notifications.

### API Call Entry Points (External Integrations)
- **`Google Gemini AI API`:**
  - **Input:**
    - `scriptText`: The full text of the screenplay.
    - `llmConfig`: Dynamic configuration object (model, temperature, maxTokens, etc.).
    - `promptConfig`: The specific prompt for one of the 27 analysis sections.
  - **Output:** A structured JSON response containing the analysis for the requested section. This is the primary external output of the system. 