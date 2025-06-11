# CortexReel - Project Brief

## Podstawowe Informacje

**Nazwa projektu:** CortexReel  
**Typ aplikacji:** React TypeScript SPA  
**Główny cel:** Profesjonalna platforma analizy scenariuszy filmowych z 27 sekcjami analizy  
**Grupa docelowa:** Profesjonaliści branży filmowej (reżyserzy, producenci, operatorzy kamery, koordynatorzy bezpieczeństwa)

## Kluczowe Wymagania

### Funkcjonalne
1. **Upload i parsowanie plików PDF scenariuszy**
   - Obsługa plików do 10MB
   - Bezpośrednia ekstrakcja tekstu + fallback OCR (Tesseract.js)
   - Walidacja formatu i rozmiaru

2. **27-sekcyjna analiza przy użyciu Google Gemini AI**
   - Metadata scenariusza
   - Struktura scen  
   - Analiza postaci i relacji
   - Lokacje i wymagania techniczne
   - Analiza budżetu i ryzyka
   - Koordynacja bezpieczeństwa i kaskaderów
   - Analiza emocjonalna i psychologiczna

3. **Wizualizacje i dashboardy**
   - Interactive charts (Recharts)
   - Role-based filtering (different views for different film roles)
   - Responsive design with Material-UI

4. **Session Management**
   - Analysis history with persistence (Zustand)
   - Results export (PDF, CSV, JSON)
   - Autentykacja (obecnie proste hasło)

### Niefunkcjonalne
- **Wydajność:** Web Workers dla przetwarzania PDF/OCR
- **Bezpieczeństwo:** Klucz API Gemini w zmiennych środowiskowych
- **UX:** Dark mode jako domyślny (standard branży filmowej)
- **Accessibility:** WCAG 2.1 AA compliance
- **Responsywność:** Mobile-first design

## Kluczowe Ograniczenia

1. **Przetwarzanie po stronie klienta** - całość analizy w przeglądarce
2. **Klucz API Gemini** - obecnie w env variables (potencjalne ryzyko bezpieczeństwa)
3. **Brak backendu** - wszystko w localStorage i pamięci
4. **Dependency na Google Gemini** - zewnętrzny serwis krytyczny dla funkcjonalności

## Sukces Projektu

Projekt będzie uznany za udany, gdy:
- Profesjonaliści filmowi będą mogli analizować scenariusze w <5 minut
- Wszystkie 27 sekcji będą działać niezawodnie  
- Wizualizacje będą użyteczne i intuitive dla każdej roli filmowej
- Aplikacja będzie działać offline po pierwszym załadowaniu
- Export wyników będzie kompatybilny z workflow'ami produkcyjnymi

## Główne Ryzyka

1. **Limity API Gemini** - quota/rate limiting
2. **Rozmiar plików PDF** - OCR może być wolny dla dużych plików
3. **Kompatybilność przeglądarek** - szczególnie Web Workers i PDF.js
4. **Bezpieczeństwo klucza API** - ekspozycja w client-side kodzie 