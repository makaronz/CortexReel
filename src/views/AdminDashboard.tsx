import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { AdminConfigService } from '@/services/AdminConfigService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

interface PromptConfig {
  [key: string]: {
    id: string;
    name: string;
    prompt: string;
    version: string;
    description: string;
  };
}

interface AppConfig {
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

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    apiKey: '',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    topK: 40,
    presencePenalty: 0,
    frequencyPenalty: 0
  });
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({});
  const [appConfig, setAppConfig] = useState<AppConfig>({
    appName: 'CortexReel',
    maxFileSize: 10485760,
    supportedFormats: 'pdf,txt',
    debugMode: false,
    logLevel: 'info',
    enableOCR: true,
    enableAdvancedCharts: true,
    enableExport: true,
    enableCollaboration: false
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [expandedPrompt, setExpandedPrompt] = useState<string | false>(false);

  const configService = new AdminConfigService();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const [llm, prompts, app] = await Promise.all([
        configService.getLLMConfig(),
        configService.getPromptConfig(),
        configService.getAppConfig()
      ]);
      
      setLlmConfig(llm);
      setPromptConfig(prompts);
      setAppConfig(app);
      
      setSnackbar({ open: true, message: 'Konfiguracja załadowana pomyślnie', severity: 'success' });
    } catch (error) {
      console.error('Error loading configurations:', error);
      setSnackbar({ open: true, message: 'Błąd podczas ładowania konfiguracji', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (type: 'llm' | 'prompts' | 'app') => {
    setLoading(true);
    try {
      switch (type) {
        case 'llm':
          await configService.saveLLMConfig(llmConfig);
          break;
        case 'prompts':
          await configService.savePromptConfig(promptConfig);
          break;
        case 'app':
          await configService.saveAppConfig(appConfig);
          break;
      }
      
      setSnackbar({ open: true, message: 'Konfiguracja zapisana pomyślnie', severity: 'success' });
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSnackbar({ open: true, message: 'Błąd podczas zapisywania konfiguracji', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePromptAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPrompt(isExpanded ? panel : false);
  };

  const updatePrompt = (promptId: string, field: string, value: string) => {
    setPromptConfig(prev => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [field]: value
      }
    }));
  };

  const availableModels = [
    // OpenAI Models
    'openai/o3-pro',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo',
    
    // Google Gemini Models
    'google/gemini-2.5-pro-preview',
    'google/gemini-2.5-flash-preview-05-20',
    'google/gemini-1.5-pro',
    'google/gemini-1.5-flash',
    'google/gemini-2.0-flash-exp',
    'google/gemma-3n-e4b-it',
    
    // Anthropic Claude Models
    'anthropic/claude-opus-4',
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku',
    
    // Mistral Models
    'mistralai/magistral-medium-2506',
    'mistralai/magistral-small-2506',
    'mistralai/devstral-small',
    'mistralai/mistral-large',
    'mistralai/mistral-medium',
    'mistralai/mistral-small',
    
    // DeepSeek Models
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-distill-qwen-7b',
    'deepseek/deepseek-r1-0528-qwen3-8b',
    'deepseek/deepseek-coder',
    
    // Meta Llama Models
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-405b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    
    // Specialized Models
    'thedrummer/valkyrie-49b-v1',
    'sarvamai/sarvam-m',
    'sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b',
    
    // Legacy Support (for backward compatibility)
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ];

  const logLevels = ['debug', 'info', 'warn', 'error'];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon fontSize="large" />
        Panel Administracyjny
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Zarządzaj konfiguracją LLM, promptami i ustawieniami aplikacji
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab 
            icon={<SecurityIcon />} 
            label="Konfiguracja LLM" 
            id="admin-tab-0"
            aria-controls="admin-tabpanel-0"
          />
          <Tab 
            icon={<CodeIcon />} 
            label="Prompty" 
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />
          <Tab 
            icon={<TuneIcon />} 
            label="Ustawienia Aplikacji" 
            id="admin-tab-2"
            aria-controls="admin-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              Konfiguracja LLM
            </Typography>
            
            <Grid container spacing={3}>
              {/* API Key */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Klucz API"
                  type="password"
                  value={llmConfig.apiKey}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  helperText="Klucz API dla wybranego modelu LLM"
                  variant="outlined"
                />
              </Grid>

              {/* Model Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Model LLM</InputLabel>
                  <Select
                    value={llmConfig.model}
                    label="Model LLM"
                    onChange={(e) => setLlmConfig(prev => ({ ...prev, model: e.target.value }))}
                  >
                    {availableModels.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Max Tokens */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maksymalna liczba tokenów"
                  type="number"
                  value={llmConfig.maxTokens}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  inputProps={{ min: 1, max: 32768 }}
                />
              </Grid>

              {/* Temperature */}
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Temperatura: {llmConfig.temperature}</Typography>
                <Slider
                  value={llmConfig.temperature}
                  onChange={(e, value) => setLlmConfig(prev => ({ ...prev, temperature: value as number }))}
                  min={0}
                  max={2}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0 (Deterministyczny)' },
                    { value: 1, label: '1 (Zbalansowany)' },
                    { value: 2, label: '2 (Kreatywny)' }
                  ]}
                />
              </Grid>

              {/* Top P */}
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Top P: {llmConfig.topP}</Typography>
                <Slider
                  value={llmConfig.topP}
                  onChange={(e, value) => setLlmConfig(prev => ({ ...prev, topP: value as number }))}
                  min={0}
                  max={1}
                  step={0.05}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: '1' }
                  ]}
                />
              </Grid>

              {/* Top K */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Top K"
                  type="number"
                  value={llmConfig.topK}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                  inputProps={{ min: 1, max: 100 }}
                  helperText="Liczba najlepszych tokenów do rozważenia"
                />
              </Grid>

              {/* Presence Penalty */}
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Presence Penalty: {llmConfig.presencePenalty}</Typography>
                <Slider
                  value={llmConfig.presencePenalty}
                  onChange={(e, value) => setLlmConfig(prev => ({ ...prev, presencePenalty: value as number }))}
                  min={-2}
                  max={2}
                  step={0.1}
                  marks={[
                    { value: -2, label: '-2' },
                    { value: 0, label: '0' },
                    { value: 2, label: '2' }
                  ]}
                />
              </Grid>

              {/* Save Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => saveConfiguration('llm')}
                  disabled={loading}
                  size="large"
                >
                  Zapisz Konfigurację LLM
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            Zarządzanie Promptami
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Edytuj prompty używane do analizy scenariuszy. Każdy prompt odpowiada za konkretną sekcję analizy.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => saveConfiguration('prompts')}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            Zapisz Wszystkie Prompty
          </Button>
        </Box>

        {Object.entries(promptConfig).map(([promptId, prompt]) => (
          <Accordion
            key={promptId}
            expanded={expandedPrompt === promptId}
            onChange={handlePromptAccordionChange(promptId)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <PsychologyIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{prompt.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prompt.description}
                  </Typography>
                </Box>
                <Chip 
                  label={`v${prompt.version}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nazwa"
                    value={prompt.name}
                    onChange={(e) => updatePrompt(promptId, 'name', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Wersja"
                    value={prompt.version}
                    onChange={(e) => updatePrompt(promptId, 'version', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opis"
                    value={prompt.description}
                    onChange={(e) => updatePrompt(promptId, 'description', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Prompt"
                    value={prompt.prompt}
                    onChange={(e) => updatePrompt(promptId, 'prompt', e.target.value)}
                    variant="outlined"
                    multiline
                    rows={12}
                    helperText="Główny prompt używany do analizy. Używaj JSON format dla strukturalnych odpowiedzi."
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        // Reset to default prompt
                        const defaultPrompts = new AdminConfigService().getDefaultPrompts();
                        if (defaultPrompts[promptId]) {
                          setPromptConfig(prev => ({
                            ...prev,
                            [promptId]: defaultPrompts[promptId]
                          }));
                        }
                      }}
                    >
                      Przywróć Domyślny
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon />
              Ustawienia Aplikacji
            </Typography>
            
            <Grid container spacing={3}>
              {/* App Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nazwa Aplikacji"
                  value={appConfig.appName}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, appName: e.target.value }))}
                  variant="outlined"
                />
              </Grid>

              {/* Max File Size */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maksymalny rozmiar pliku (bajty)"
                  type="number"
                  value={appConfig.maxFileSize}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  helperText={`Aktualnie: ${(appConfig.maxFileSize / 1024 / 1024).toFixed(1)} MB`}
                  inputProps={{ min: 1048576 }} // 1MB minimum
                />
              </Grid>

              {/* Supported Formats */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Obsługiwane formaty"
                  value={appConfig.supportedFormats}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, supportedFormats: e.target.value }))}
                  helperText="Oddziel przecinkami (np. pdf,txt,docx)"
                  variant="outlined"
                />
              </Grid>

              {/* Log Level */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Poziom logowania</InputLabel>
                  <Select
                    value={appConfig.logLevel}
                    label="Poziom logowania"
                    onChange={(e) => setAppConfig(prev => ({ ...prev, logLevel: e.target.value }))}
                  >
                    {logLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Feature Toggles */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Funkcjonalności
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appConfig.debugMode}
                          onChange={(e) => setAppConfig(prev => ({ ...prev, debugMode: e.target.checked }))}
                        />
                      }
                      label="Tryb debugowania"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appConfig.enableOCR}
                          onChange={(e) => setAppConfig(prev => ({ ...prev, enableOCR: e.target.checked }))}
                        />
                      }
                      label="Włącz OCR"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appConfig.enableAdvancedCharts}
                          onChange={(e) => setAppConfig(prev => ({ ...prev, enableAdvancedCharts: e.target.checked }))}
                        />
                      }
                      label="Zaawansowane wykresy"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appConfig.enableExport}
                          onChange={(e) => setAppConfig(prev => ({ ...prev, enableExport: e.target.checked }))}
                        />
                      }
                      label="Eksport danych"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appConfig.enableCollaboration}
                          onChange={(e) => setAppConfig(prev => ({ ...prev, enableCollaboration: e.target.checked }))}
                        />
                      }
                      label="Współpraca (eksperymentalne)"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Save Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => saveConfiguration('app')}
                  disabled={loading}
                  size="large"
                >
                  Zapisz Ustawienia Aplikacji
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard; 