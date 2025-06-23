# 🎭 Playwright MCP Server - Przewodnik Konfiguracji i Użytkowania

**Przewodnik dla zespołu CortexReel**  
Data: $(date +%Y-%m-%d)  
Wersja: 1.0

## 📋 Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Instalacja i Konfiguracja](#instalacja-i-konfiguracja)
3. [Użytkowanie w Cursor](#użytkowanie-w-cursor)
4. [Dostępne Funkcjonalności](#dostępne-funkcjonalności)
5. [Testowanie CortexReel](#testowanie-cortexreel)
6. [Przykłady Użycia](#przykłady-użycia)
7. [Rozwiązywanie Problemów](#rozwiązywanie-problemów)
8. [Najlepsze Praktyki](#najlepsze-praktyki)

---

## 🎯 Wprowadzenie

Playwright MCP Server to potężne narzędzie do automatyzacji przeglądarek, które integruje się z Cursor IDE i umożliwia:

- **Automatyczne testowanie** aplikacji CortexReel w przeglądarce
- **Tworzenie zrzutów ekranu** funkcjonalności
- **Automatyzację przepływów pracy** dla filmowców
- **Testowanie UI/UX** bez pisania kodu

### 🎬 Korzyści dla Zespołu CortexReel

- **Testowanie scenariuszy analizy**: Automatyczne przesyłanie plików PDF i sprawdzanie wyników
- **Dokumentacja wizualna**: Automatyczne zrzuty ekranu funkcjonalności
- **QA automatyczne**: Sprawdzanie responsywności i poprawności UI
- **Demo dla klientów**: Automatyczne tworzenie materiałów demonstracyjnych

---

## 🛠 Instalacja i Konfiguracja

### Krok 1: Instalacja Node.js i npm
```bash
# macOS (Homebrew)
brew install node npm

# Sprawdzenie instalacji
node --version    # v24.2.0+
npm --version     # v11.3.0+
```

### Krok 2: Instalacja Playwright MCP Server
```bash
# Instalacja globalna
npm install -g @executeautomation/playwright-mcp-server

# Instalacja Playwright Test
npm install -g @playwright/test

# Instalacja przeglądarek
npx playwright install chromium firefox webkit
```

### Krok 3: Konfiguracja Cursor MCP

**Lokalizacja pliku konfiguracyjnego:**
- macOS: `~/.cursor/mcp.json`
- Windows: `%APPDATA%/Cursor/mcp.json`
- Linux: `~/.cursor/mcp.json`

**Zawartość pliku `mcp.json`:**
```json
{
  "mcpServers": {
    "Playwright": {
      "command": "playwright-mcp-server",
      "args": ["--port", "3001"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "/Users/{username}/Library/Caches/ms-playwright"
      }
    }
  }
}
```

### Krok 4: Restart Cursor
Po dodaniu konfiguracji:
1. Zamknij Cursor całkowicie
2. Poczekaj 5 sekund
3. Uruchom Cursor ponownie
4. Sprawdź dostępność MCP w ustawieniach

---

## 🎯 Użytkowanie w Cursor

### Aktywacja MCP Serwera
1. Otwórz Cursor
2. Wejdź w **Settings** → **MCP**
3. Sprawdź czy **Playwright** jest aktywny
4. Jeśli nie - kliknij **Refresh** lub **Restart MCP Servers**

### Podstawowe Komendy

**W chcie z Cursor AI:**
```
Zrób zrzut ekranu strony CortexReel na localhost:5173
```

```
Przetestuj upload PDF na stronie i sprawdź czy analiza się uruchamia
```

```
Automatycznie wypełnij formularz testowy danymi filmowymi
```

---

## ⚡ Dostępne Funkcjonalności

### 🌐 Nawigacja i Kontrola Przeglądarki

| Funkcja | Opis | Przykład użycia |
|---------|------|-----------------|
| `navigate_to` | Otwiera stronę web | Przejście do CortexReel dashboard |
| `go_back` | Wraca do poprzedniej strony | Nawigacja w procesie analizy |
| `reload_page` | Odświeża stronę | Reset stanu aplikacji |
| `wait_for_load` | Czeka na załadowanie | Oczekiwanie na wyniki analizy |

### 📸 Zrzuty Ekranu i Dokumentacja

| Funkcja | Opis | Przypadek użycia CortexReel |
|---------|------|----------------------------|
| `screenshot` | Pełny zrzut ekranu strony | Dokumentacja interfejsu |
| `screenshot_element` | Zrzut konkretnego elementu | Screeny dashboardów analizy |
| `pdf_screenshot` | Eksport do PDF | Raporty dla klientów filmowych |

### 🖱 Interakcja z Elementami

| Funkcja | Opis | Aplikacja w CortexReel |
|---------|------|------------------------|
| `click_element` | Klikanie przycisków/linków | Uruchamianie analizy |
| `double_click` | Podwójne kliknięcie | Otwieranie szczegółów scen |
| `right_click` | Menu kontekstowe | Dodatkowe opcje |
| `hover_element` | Najechanie myszą | Podgląd tooltipów |

### 📝 Formularze i Dane

| Funkcja | Opis | Użycie |
|---------|------|--------|
| `fill_form` | Wypełnianie pól formularza | Konfiguracja analizy |
| `upload_file` | Przesyłanie plików | Upload scenariuszy PDF |
| `select_option` | Wybór z listy rozwijanej | Wybór roli użytkownika |
| `check_checkbox` | Zaznaczanie opcji | Ustawienia eksportu |

### 🔍 Analiza Zawartości

| Funkcja | Opis | Zastosowanie |
|---------|------|--------------|
| `get_page_content` | Pobieranie HTML | Sprawdzanie wyników analizy |
| `extract_text` | Wyciąganie tekstu | Weryfikacja generowanych raportów |
| `find_elements` | Znajdowanie elementów | Lokalizacja przycisków/pól |
| `get_page_title` | Tytuł strony | Weryfikacja nawigacji |

### 🕒 Oczekiwanie i Synchronizacja

| Funkcja | Opis | Kiedy używać |
|---------|------|--------------|
| `wait_for_element` | Czeka na pojawienie się elementu | Ładowanie wyników AI |
| `wait_for_text` | Czeka na konkretny tekst | Komunikaty o ukończeniu |
| `wait_for_url` | Czeka na zmianę URL | Przekierowania po analizie |
| `wait_for_timeout` | Pauza czasowa | Czas na przetwarzanie AI |

### 🧪 JavaScript i Zaawansowane

| Funkcja | Opis | Zaawansowane użycie |
|---------|------|---------------------|
| `execute_script` | Wykonywanie JS | Manipulacja danymi w DOM |
| `evaluate_expression` | Ewaluacja wyrażeń | Pobieranie stanu aplikacji |
| `inject_css` | Dodawanie stylów | Testy wizualne |
| `set_viewport` | Ustawienie rozdzielczości | Testy responsywności |

---

## 🎬 Testowanie CortexReel

### Scenariusz 1: Test Pełnego Przepływu Analizy
```markdown
**Prompt dla Cursor AI:**

Przetestuj pełny przepływ analizy scenariusza w CortexReel:
1. Otwórz localhost:5173
2. Zaloguj się jako Director
3. Prześlij przykładowy plik PDF scenariusza
4. Sprawdź czy rozpoczyna się analiza (spinner/progress)
5. Poczekaj na wyniki analizy (max 2 minuty)
6. Zrób zrzut ekranu dashboardu z wynikami
7. Sprawdź czy wszystkie sekcje analizy zostały wypełnione
8. Wyeksportuj wyniki do PDF
```

### Scenariusz 2: Test Konfiguracji Admin Panel
```markdown
**Prompt dla Cursor AI:**

Przetestuj panel administracyjny CortexReel:
1. Przejdź do /admin
2. Sprawdź zakładkę "LLM Configuration"
3. Zmień model z Gemini na GPT-4
4. Zapisz konfigurację
5. Przejdź do "Prompts Management"
6. Edytuj prompt dla analizy scen
7. Zapisz zmiany
8. Zrób zrzuty ekranu każdej zakładki
```

### Scenariusz 3: Test Responsywności
```markdown
**Prompt dla Cursor AI:**

Przetestuj responsywność CortexReel na różnych rozdzielczościach:
1. Ustaw viewport na 1920x1080 (desktop)
2. Zrób zrzut ekranu głównego dashboardu
3. Zmień na 768x1024 (tablet)
4. Sprawdź czy menu jest dostępne
5. Ustaw 375x667 (mobile)
6. Sprawdź czy upload plików działa
7. Porównaj wszystkie screeny
```

---

## 💡 Przykłady Użycia

### Test Automatyczny Upload Scenariusza
```javascript
// Przykład kodu JS do wstrzyknięcia
const testUpload = async () => {
    // Symulacja przesłania pliku
    const fileInput = document.querySelector('input[type="file"]');
    const uploadButton = document.querySelector('.upload-button');
    
    // Sprawdzenie czy elementy istnieją
    if (fileInput && uploadButton) {
        console.log('✅ Elementy upload znalezione');
        return true;
    } else {
        console.log('❌ Elementy upload nie znalezione');
        return false;
    }
};
```

### Automatyczne Testowanie Dashboardów
```markdown
**Sekwencja testowa:**

1. navigate_to("http://localhost:5173")
2. wait_for_element(".login-form")
3. fill_form("#role-selector", "Director")
4. click_element(".login-button")
5. wait_for_url("*/dashboard")
6. screenshot("dashboard-director-view.png")
7. click_element(".role-toggle")
8. select_option("#role-select", "Producer")
9. screenshot("dashboard-producer-view.png")
```

---

## 🚨 Rozwiązywanie Problemów

### Problem 1: Serwer MCP nie uruchamia się
**Objawy:** Brak dostępności narzędzi Playwright w Cursor

**Rozwiązanie:**
```bash
# Sprawdź czy serwer jest zainstalowany
which playwright-mcp-server

# Reinstalacja jeśli brak
npm uninstall -g @executeautomation/playwright-mcp-server
npm install -g @executeautomation/playwright-mcp-server

# Restart Cursor
killall Cursor
open -a Cursor
```

### Problem 2: Przeglądarki nie uruchamiają się
**Objawy:** Błędy "Browser not found" lub timeout

**Rozwiązanie:**
```bash
# Reinstalacja przeglądarek
npx playwright install --force

# Sprawdzenie ścieżek
npx playwright list
```

### Problem 3: Konfiguracja MCP nie działa
**Objawy:** Serwer nie pojawia się w Settings → MCP

**Rozwiązanie:**
```bash
# Sprawdź syntaks JSON
cat ~/.cursor/mcp.json | jq .

# Popraw uprawnienia
chmod 644 ~/.cursor/mcp.json

# Sprawdź logi Cursor
tail -f ~/.cursor/logs/main.log
```

### Problem 4: Timeout podczas testowania CortexReel
**Objawy:** Testy przerywane po 30 sekundach

**Rozwiązanie:**
```markdown
Zwiększ timeout w promptach:
"Poczekaj maksymalnie 3 minuty na zakończenie analizy AI"
"Ustaw timeout na 180 sekund dla przetwarzania PDF"
```

---

## 🏆 Najlepsze Praktyki

### 1. Planowanie Testów
- **Przygotuj dane testowe**: Używaj zawsze tych samych przykładowych scenariuszy PDF
- **Dokumentuj oczekiwania**: Jasno określ co powinno się stać w każdym kroku
- **Testuj systematycznie**: Jedna funkcjonalność na raz

### 2. Niezawodność Testów
```markdown
**Zawsze używaj wait_for_element** przed interakcją:
- wait_for_element(".upload-button") PRZED click_element(".upload-button")
- wait_for_text("Analysis complete") PRZED screenshot("results.png")
```

### 3. Organizacja Zrzutów Ekranu
```
screenshots/
├── ui-tests/
│   ├── dashboard-director.png
│   ├── dashboard-producer.png
│   └── admin-panel.png
├── functionality-tests/
│   ├── upload-process.png
│   ├── analysis-results.png
│   └── export-options.png
└── responsive-tests/
    ├── desktop-1920x1080.png
    ├── tablet-768x1024.png
    └── mobile-375x667.png
```

### 4. Raportowanie Błędów
```markdown
**Template zgłoszenia błędu:**

**Kroki do reprodukcji:**
1. navigate_to("localhost:5173")
2. click_element(".specific-button")
3. wait_for_element(".expected-result")

**Oczekiwany rezultat:** Element powinien się pojawić
**Aktualny rezultat:** Element nie pojawił się po 30s
**Screenshot:** attached-error-screenshot.png
**Logi konsoli:** [załącz logi z developer tools]
```

### 5. Automatyzacja Ciągła
```bash
# Skrypt codziennego smoke testu
#!/bin/bash
echo "🔍 CortexReel Daily Smoke Test"
cursor --mcp-run "
Wykonaj podstawowy test CortexReel:
1. Otwórz aplikację
2. Sprawdź czy strona się ładuje (timeout 10s)
3. Sprawdź czy upload form jest dostępny
4. Zrób screenshot i zapisz jako daily-check-$(date +%Y%m%d).png
"
```

---

## 📞 Wsparcie i Kontakt

### Dokumentacja
- **Oficjalna dokumentacja**: https://executeautomation.github.io/mcp-playwright/
- **GitHub**: https://github.com/executeautomation/mcp-playwright
- **Przykłady**: Sekcja examples w repo

### Zespół CortexReel
- **Główny kontakt**: Zobacz README.md projektu
- **Issues**: GitHub Issues w repo CortexReel
- **Testy**: Folder `__tests__/` w projekcie

### Przydatne Komendy
```bash
# Status serwera MCP
ps aux | grep playwright

# Logi Cursor MCP
tail -f ~/.cursor/logs/mcp.log

# Test connectivity
curl -X POST http://localhost:3001/health
```

---

## 🎯 Następne Kroki

### Dla Zespołu:
1. **Przejście przez ten przewodnik** każdej osoby w zespole
2. **Test instalacji** na wszystkich maszynach deweloperskich
3. **Utworzenie suite testów** dla kluczowych funkcjonalności CortexReel
4. **Zaplanowanie automatycznych testów** w pipeline CI/CD

### Dla Projektu:
1. **Integracja z GitHub Actions** dla automatycznych UI testów
2. **Rozszerzenie testów** o więcej scenariuszy filmowych
3. **Monitoring jakości** interfejsu użytkownika
4. **Dokumentacja wizualna** dla klientów

---

**© 2025 CortexReel Team - Playwright MCP Integration Guide** 