# 🚀 Playwright MCP Server - Szybki Start

**5-minutowy przewodnik uruchomienia**

## ⚡ Kroki Instalacji

### 1. Zainstaluj serwer (2 min)
```bash
npm install -g @executeautomation/playwright-mcp-server
npx playwright install chromium
```

### 2. Skonfiguruj Cursor (1 min)  
Edytuj `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "Playwright": {
      "command": "playwright-mcp-server",
      "args": ["--port", "3001"]
    }
  }
}
```

### 3. Restart Cursor (1 min)
```bash
killall Cursor
open -a Cursor
```

### 4. Test (1 min)
W Cursor chat napisz:
```
Zrób zrzut ekranu strony google.com
```

## ✅ Gotowe!

Jeśli widzisz screenshot Google - wszystko działa!

## 🎬 Dla CortexReel

Teraz możesz testować:
```
Otwórz localhost:5173 i przetestuj upload pliku PDF
```

## 📚 Więcej informacji
- Pełny przewodnik: `PLAYWRIGHT_MCP_GUIDE.md`
- Test funkcjonalności: `./playwright-mcp-test.sh` 