import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  useAnalysisStore,
  useCurrentAnalysis,
  useAnalysisProgress,
  useIsAnalyzing,
  useAnalysisError,
  useAnalysisHistory,
  useSelectedRole,
  useUIState,
  useAuth,
  useFileProcessing,
  useChatMessages
} from '../store/analysisStore';
import type { 
  CompleteAnalysis, 
  AnalysisProgress, 
  AnalysisHistoryEntry,
  FilmRole 
} from '@/types/analysis';
import { ChatMessage } from '@/types/ChatMessage';

// Mock crypto.randomUUID if not available
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});

describe('analysisStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAnalysisStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = useAnalysisStore.getState();
      
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentAnalysis).toBeNull();
      expect(state.analysisProgress).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisError).toBeNull();
      expect(state.currentFile).toBeNull();
      expect(state.extractedText).toBeNull();
      expect(state.extractionMethod).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.analysisHistory).toEqual([]);
      expect(state.selectedRole).toBeNull();
      expect(state.collapsedSections).toBeInstanceOf(Set);
      expect(state.collapsedSections.size).toBe(0);
      expect(state.darkMode).toBe(true);
      expect(state.sidebarOpen).toBe(true);
      expect(state.chatMessages).toEqual({});
    });

    it('should have all required action methods', () => {
      const state = useAnalysisStore.getState();
      
      // Authentication actions
      expect(typeof state.setAuthenticated).toBe('function');
      
      // File processing actions
      expect(typeof state.setCurrentFile).toBe('function');
      expect(typeof state.setExtractedText).toBe('function');
      expect(typeof state.startProcessing).toBe('function');
      expect(typeof state.stopProcessing).toBe('function');
      
      // Analysis actions
      expect(typeof state.startAnalysis).toBe('function');
      expect(typeof state.updatePartialAnalysis).toBe('function');
      expect(typeof state.setAnalysisProgress).toBe('function');
      expect(typeof state.setAnalysisResult).toBe('function');
      expect(typeof state.setAnalysisError).toBe('function');
      expect(typeof state.clearAnalysis).toBe('function');
      
      // History actions
      expect(typeof state.addToHistory).toBe('function');
      expect(typeof state.removeFromHistory).toBe('function');
      expect(typeof state.clearHistory).toBe('function');
      expect(typeof state.loadFromHistory).toBe('function');
      
      // UI actions
      expect(typeof state.setSelectedRole).toBe('function');
      expect(typeof state.toggleSection).toBe('function');
      expect(typeof state.setSectionCollapsed).toBe('function');
      expect(typeof state.toggleDarkMode).toBe('function');
      expect(typeof state.setSidebarOpen).toBe('function');
      
      // Chat actions
      expect(typeof state.addChatMessage).toBe('function');
      expect(typeof state.clearChatMessages).toBe('function');
      
      // Utility actions
      expect(typeof state.reset).toBe('function');
    });
  });

  describe('Authentication Actions', () => {
    it('should set authenticated to true', () => {
      const { setAuthenticated } = useAnalysisStore.getState();
      
      setAuthenticated(true);
      
      expect(useAnalysisStore.getState().isAuthenticated).toBe(true);
    });

    it('should set authenticated to false', () => {
      const { setAuthenticated } = useAnalysisStore.getState();
      
      setAuthenticated(true);
      setAuthenticated(false);
      
      expect(useAnalysisStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle authentication state changes correctly', () => {
      const { setAuthenticated } = useAnalysisStore.getState();
      
      // Test multiple state changes
      setAuthenticated(true);
      expect(useAnalysisStore.getState().isAuthenticated).toBe(true);
      
      setAuthenticated(false);
      expect(useAnalysisStore.getState().isAuthenticated).toBe(false);
      
      setAuthenticated(true);
      expect(useAnalysisStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('File Processing Actions', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    it('should set current file and reset related state', () => {
      const { setCurrentFile } = useAnalysisStore.getState();
      
      // Set some initial state that should be reset
      useAnalysisStore.setState({
        analysisError: 'Previous error',
        currentAnalysis: { id: 'test' } as CompleteAnalysis,
        extractedText: 'Previous text',
        extractionMethod: 'OCR',
        isProcessing: true
      });
      
      setCurrentFile(mockFile);
      
      const state = useAnalysisStore.getState();
      expect(state.currentFile).toBe(mockFile);
      expect(state.analysisError).toBeNull();
      expect(state.currentAnalysis).toBeNull();
      expect(state.extractedText).toBeNull();
      expect(state.extractionMethod).toBeNull();
      expect(state.isProcessing).toBe(false);
    });

    it('should clear current file', () => {
      const { setCurrentFile } = useAnalysisStore.getState();
      
      setCurrentFile(mockFile);
      setCurrentFile(null);
      
      expect(useAnalysisStore.getState().currentFile).toBeNull();
    });

    it('should set extracted text with method', () => {
      const { setExtractedText } = useAnalysisStore.getState();
      
      setExtractedText('Extracted text content', 'OCR');
      
      const state = useAnalysisStore.getState();
      expect(state.extractedText).toBe('Extracted text content');
      expect(state.extractionMethod).toBe('OCR');
    });

    it('should handle all extraction methods', () => {
      const { setExtractedText } = useAnalysisStore.getState();
      
      const methods: Array<'DIRECT' | 'OCR' | 'MIXED' | null> = ['DIRECT', 'OCR', 'MIXED', null];
      
      methods.forEach(method => {
        setExtractedText('Test text', method);
        expect(useAnalysisStore.getState().extractionMethod).toBe(method);
      });
    });

    it('should start processing', () => {
      const { startProcessing } = useAnalysisStore.getState();
      
      // Set error state first
      useAnalysisStore.setState({ analysisError: 'Previous error' });
      
      startProcessing();
      
      const state = useAnalysisStore.getState();
      expect(state.isProcessing).toBe(true);
      expect(state.analysisError).toBeNull();
    });

    it('should stop processing', () => {
      const { startProcessing, stopProcessing } = useAnalysisStore.getState();
      
      startProcessing();
      stopProcessing();
      
      expect(useAnalysisStore.getState().isProcessing).toBe(false);
    });
  });

  describe('Analysis Actions', () => {
    it('should start analysis with correct initial progress', () => {
      const { startAnalysis } = useAnalysisStore.getState();
      
      startAnalysis();
      
      const state = useAnalysisStore.getState();
      expect(state.isAnalyzing).toBe(true);
      expect(state.analysisError).toBeNull();
      expect(state.analysisProgress).toEqual({
        currentSection: 'Initializing...',
        sectionsComplete: 0,
        totalSections: 27,
        percentage: 0,
        estimatedTimeRemaining: 60000,
        errors: []
      });
    });

    it('should update partial analysis - initialize new analysis', () => {
      const { updatePartialAnalysis, setCurrentFile } = useAnalysisStore.getState();
      
      const mockFile = new File(['test'], 'test.pdf');
      setCurrentFile(mockFile);
      
      const testData = { title: 'Test Title', genre: 'Drama' };
      updatePartialAnalysis('metadata', testData);
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toBeDefined();
      expect(state.currentAnalysis?.filename).toBe('test.pdf');
      expect(state.currentAnalysis?.metadata).toEqual(testData);
      expect(state.currentAnalysis?.id).toBeDefined();
      expect(state.currentAnalysis?.createdAt).toBeDefined();
      expect(state.currentAnalysis?.lastModified).toBeDefined();
    });

    it('should update partial analysis - update existing analysis', () => {
      const { updatePartialAnalysis, setCurrentFile } = useAnalysisStore.getState();
      
      const mockFile = new File(['test'], 'test.pdf');
      setCurrentFile(mockFile);
      
      // Initialize with first section
      updatePartialAnalysis('metadata', { title: 'Test Title' });
      
      const initialLastModified = useAnalysisStore.getState().currentAnalysis?.lastModified;
      
      // Wait a bit to ensure lastModified changes
      setTimeout(() => {
        // Update with second section
        updatePartialAnalysis('characters', [{ name: 'John' }]);
        
        const state = useAnalysisStore.getState();
        expect(state.currentAnalysis?.metadata).toEqual({ title: 'Test Title' });
        expect(state.currentAnalysis?.characters).toEqual([{ name: 'John' }]);
        expect(state.currentAnalysis?.lastModified).not.toBe(initialLastModified);
      }, 10);
    });

    it('should handle scenes data specifically', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { updatePartialAnalysis, setCurrentFile } = useAnalysisStore.getState();
      
      const mockFile = new File(['test'], 'test.pdf');
      setCurrentFile(mockFile);
      
      const scenesData = [
        { id: 1, description: 'Opening scene' },
        { id: 2, description: 'Closing scene' }
      ];
      
      updatePartialAnalysis('scenes', scenesData);
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis?.scenes).toEqual(scenesData);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Store updating partial analysis for section: scenes'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });

    it('should set analysis progress', () => {
      const { setAnalysisProgress } = useAnalysisStore.getState();
      
      const progress: AnalysisProgress = {
        currentSection: 'Characters',
        sectionsComplete: 5,
        totalSections: 27,
        percentage: 18.5,
        estimatedTimeRemaining: 45000,
        errors: []
      };
      
      setAnalysisProgress(progress);
      
      expect(useAnalysisStore.getState().analysisProgress).toEqual(progress);
    });

    it('should clear analysis progress', () => {
      const { setAnalysisProgress } = useAnalysisStore.getState();
      
      const progress: AnalysisProgress = {
        currentSection: 'Test',
        sectionsComplete: 1,
        totalSections: 27,
        percentage: 3.7,
        estimatedTimeRemaining: 50000,
        errors: []
      };
      
      setAnalysisProgress(progress);
      setAnalysisProgress(null);
      
      expect(useAnalysisStore.getState().analysisProgress).toBeNull();
    });

    it('should set analysis result and add to history', () => {
      const { setAnalysisResult, setCurrentFile } = useAnalysisStore.getState();
      
      const mockFile = new File(['test'], 'test.pdf', { size: 1024 });
      useAnalysisStore.setState({ currentFile: mockFile });
      
      const mockAnalysis: CompleteAnalysis = {
        id: 'test-analysis-id',
        filename: 'test.pdf',
        createdAt: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
        // Add other required fields based on your CompleteAnalysis type
      } as CompleteAnalysis;
      
      setAnalysisResult(mockAnalysis);
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toEqual(mockAnalysis);
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisProgress).toBeNull();
      expect(state.analysisError).toBeNull();
      expect(state.analysisHistory).toHaveLength(1);
      expect(state.analysisHistory[0].id).toBe('test-analysis-id');
      expect(state.analysisHistory[0].analysisType).toBe('Complete Analysis (27 Sections)');
      expect(state.analysisHistory[0].version).toBe('3.0');
    });

    it('should set analysis error', () => {
      const { setAnalysisError } = useAnalysisStore.getState();
      
      setAnalysisError('Analysis failed');
      
      const state = useAnalysisStore.getState();
      expect(state.analysisError).toBe('Analysis failed');
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisProgress).toBeNull();
    });

    it('should clear analysis error', () => {
      const { setAnalysisError } = useAnalysisStore.getState();
      
      setAnalysisError('Test error');
      setAnalysisError(null);
      
      expect(useAnalysisStore.getState().analysisError).toBeNull();
    });

    it('should clear analysis completely', () => {
      const { clearAnalysis, setCurrentFile } = useAnalysisStore.getState();
      
      // Set up state
      const mockFile = new File(['test'], 'test.pdf');
      useAnalysisStore.setState({
        currentAnalysis: { id: 'test' } as CompleteAnalysis,
        analysisProgress: { currentSection: 'test' } as AnalysisProgress,
        isAnalyzing: true,
        analysisError: 'error',
        currentFile: mockFile,
        extractedText: 'text',
        extractionMethod: 'OCR',
        isProcessing: true
      });
      
      clearAnalysis();
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toBeNull();
      expect(state.analysisProgress).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisError).toBeNull();
      expect(state.currentFile).toBeNull();
      expect(state.extractedText).toBeNull();
      expect(state.extractionMethod).toBeNull();
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('History Actions', () => {
    const mockHistoryEntry: AnalysisHistoryEntry = {
      id: 'history-1',
      filename: 'test.pdf',
      analysis: { id: 'analysis-1', filename: 'test.pdf' } as CompleteAnalysis,
      timestamp: Date.now(),
      analysisType: 'Complete Analysis (27 Sections)',
      version: '3.0',
      fileSize: 1024,
      processingTime: 5000
    };

    it('should add to history', () => {
      const { addToHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      
      const state = useAnalysisStore.getState();
      expect(state.analysisHistory).toHaveLength(1);
      expect(state.analysisHistory[0]).toEqual(mockHistoryEntry);
    });

    it('should replace existing entry with same id', () => {
      const { addToHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      
      const updatedEntry = { ...mockHistoryEntry, filename: 'updated.pdf' };
      addToHistory(updatedEntry);
      
      const state = useAnalysisStore.getState();
      expect(state.analysisHistory).toHaveLength(1);
      expect(state.analysisHistory[0].filename).toBe('updated.pdf');
    });

    it('should limit history to 50 entries', () => {
      const { addToHistory } = useAnalysisStore.getState();
      
      // Add 52 entries
      for (let i = 0; i < 52; i++) {
        const entry = { ...mockHistoryEntry, id: `history-${i}` };
        addToHistory(entry);
      }
      
      const state = useAnalysisStore.getState();
      expect(state.analysisHistory).toHaveLength(50);
      expect(state.analysisHistory[0].id).toBe('history-51'); // Most recent first
    });

    it('should remove from history', () => {
      const { addToHistory, removeFromHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      addToHistory({ ...mockHistoryEntry, id: 'history-2' });
      
      removeFromHistory('history-1');
      
      const state = useAnalysisStore.getState();
      expect(state.analysisHistory).toHaveLength(1);
      expect(state.analysisHistory[0].id).toBe('history-2');
    });

    it('should handle removing non-existent entry', () => {
      const { addToHistory, removeFromHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      removeFromHistory('non-existent');
      
      expect(useAnalysisStore.getState().analysisHistory).toHaveLength(1);
    });

    it('should clear history', () => {
      const { addToHistory, clearHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      addToHistory({ ...mockHistoryEntry, id: 'history-2' });
      
      clearHistory();
      
      expect(useAnalysisStore.getState().analysisHistory).toEqual([]);
    });

    it('should load from history', () => {
      const { addToHistory, loadFromHistory } = useAnalysisStore.getState();
      
      addToHistory(mockHistoryEntry);
      
      loadFromHistory('history-1');
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toEqual(mockHistoryEntry.analysis);
      expect(state.analysisError).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisProgress).toBeNull();
    });

    it('should handle loading non-existent history entry', () => {
      const { loadFromHistory } = useAnalysisStore.getState();
      
      const initialState = useAnalysisStore.getState();
      loadFromHistory('non-existent');
      
      // State should remain unchanged
      expect(useAnalysisStore.getState().currentAnalysis).toBe(initialState.currentAnalysis);
    });
  });

  describe('UI Actions', () => {
    it('should set selected role', () => {
      const { setSelectedRole } = useAnalysisStore.getState();
      
      const role: FilmRole = 'DIRECTOR'; // assuming this is a valid FilmRole
      setSelectedRole(role);
      
      expect(useAnalysisStore.getState().selectedRole).toBe(role);
    });

    it('should clear selected role', () => {
      const { setSelectedRole } = useAnalysisStore.getState();
      
      setSelectedRole('DIRECTOR' as FilmRole);
      setSelectedRole(null);
      
      expect(useAnalysisStore.getState().selectedRole).toBeNull();
    });

    it('should toggle section collapse state', () => {
      const { toggleSection } = useAnalysisStore.getState();
      
      toggleSection('characters');
      
      let state = useAnalysisStore.getState();
      expect(state.collapsedSections.has('characters')).toBe(true);
      
      toggleSection('characters');
      
      state = useAnalysisStore.getState();
      expect(state.collapsedSections.has('characters')).toBe(false);
    });

    it('should set section collapsed state directly', () => {
      const { setSectionCollapsed } = useAnalysisStore.getState();
      
      setSectionCollapsed('plot', true);
      expect(useAnalysisStore.getState().collapsedSections.has('plot')).toBe(true);
      
      setSectionCollapsed('plot', false);
      expect(useAnalysisStore.getState().collapsedSections.has('plot')).toBe(false);
    });

    it('should toggle dark mode', () => {
      const { toggleDarkMode } = useAnalysisStore.getState();
      
      // Initial state is dark mode true
      expect(useAnalysisStore.getState().darkMode).toBe(true);
      
      toggleDarkMode();
      expect(useAnalysisStore.getState().darkMode).toBe(false);
      
      toggleDarkMode();
      expect(useAnalysisStore.getState().darkMode).toBe(true);
    });

    it('should set sidebar open state', () => {
      const { setSidebarOpen } = useAnalysisStore.getState();
      
      setSidebarOpen(false);
      expect(useAnalysisStore.getState().sidebarOpen).toBe(false);
      
      setSidebarOpen(true);
      expect(useAnalysisStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('Chat Actions', () => {
    const mockMessage: ChatMessage = {
      id: 'msg-1',
      content: 'Test message',
      timestamp: Date.now(),
      sender: 'user'
    };

    it('should add chat message to new job', () => {
      const { addChatMessage } = useAnalysisStore.getState();
      
      addChatMessage('job-1', mockMessage);
      
      const state = useAnalysisStore.getState();
      expect(state.chatMessages['job-1']).toHaveLength(1);
      expect(state.chatMessages['job-1'][0]).toEqual(mockMessage);
    });

    it('should add chat message to existing job', () => {
      const { addChatMessage } = useAnalysisStore.getState();
      
      const message2 = { ...mockMessage, id: 'msg-2', content: 'Second message' };
      
      addChatMessage('job-1', mockMessage);
      addChatMessage('job-1', message2);
      
      const state = useAnalysisStore.getState();
      expect(state.chatMessages['job-1']).toHaveLength(2);
      expect(state.chatMessages['job-1'][1]).toEqual(message2);
    });

    it('should clear chat messages for job', () => {
      const { addChatMessage, clearChatMessages } = useAnalysisStore.getState();
      
      addChatMessage('job-1', mockMessage);
      addChatMessage('job-2', { ...mockMessage, id: 'msg-2' });
      
      clearChatMessages('job-1');
      
      const state = useAnalysisStore.getState();
      expect(state.chatMessages['job-1']).toBeUndefined();
      expect(state.chatMessages['job-2']).toBeDefined();
    });

    it('should handle clearing non-existent job messages', () => {
      const { clearChatMessages } = useAnalysisStore.getState();
      
      const initialState = useAnalysisStore.getState();
      clearChatMessages('non-existent');
      
      expect(useAnalysisStore.getState().chatMessages).toEqual(initialState.chatMessages);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state to initial values except chat messages', () => {
      const { reset } = useAnalysisStore.getState();
      
      // Modify all state
      useAnalysisStore.setState({
        isAuthenticated: true,
        currentAnalysis: { id: 'test' } as CompleteAnalysis,
        analysisProgress: { currentSection: 'test' } as AnalysisProgress,
        isAnalyzing: true,
        analysisError: 'error',
        currentFile: new File(['test'], 'test.pdf'),
        extractedText: 'text',
        extractionMethod: 'OCR',
        isProcessing: true,
        analysisHistory: [{ id: 'history-1' } as AnalysisHistoryEntry],
        selectedRole: 'DIRECTOR' as FilmRole,
        collapsedSections: new Set(['test']),
        darkMode: false,
        sidebarOpen: false,
        chatMessages: { 'job-1': [{ id: 'msg-1' } as ChatMessage] }
      });
      
      reset();
      
      const state = useAnalysisStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentAnalysis).toBeNull();
      expect(state.analysisProgress).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisError).toBeNull();
      expect(state.currentFile).toBeNull();
      expect(state.extractedText).toBeNull();
      expect(state.extractionMethod).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.analysisHistory).toEqual([]);
      expect(state.selectedRole).toBeNull();
      expect(state.collapsedSections.size).toBe(0);
      expect(state.darkMode).toBe(true);
      expect(state.sidebarOpen).toBe(true);
      expect(state.chatMessages).toEqual({});
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      // Set up some test state
      useAnalysisStore.setState({
        currentAnalysis: { id: 'test-analysis' } as CompleteAnalysis,
        analysisProgress: { currentSection: 'Characters' } as AnalysisProgress,
        isAnalyzing: true,
        analysisError: 'Test error',
        analysisHistory: [{ id: 'history-1' } as AnalysisHistoryEntry],
        selectedRole: 'DIRECTOR' as FilmRole,
        darkMode: false,
        sidebarOpen: false,
        collapsedSections: new Set(['characters']),
        isAuthenticated: true,
        currentFile: new File(['test'], 'test.pdf'),
        extractedText: 'Extracted text',
        extractionMethod: 'OCR',
        isProcessing: true,
        chatMessages: { 'job-1': [{ id: 'msg-1' } as ChatMessage] }
      });
    });

    it('useCurrentAnalysis should return current analysis', () => {
      const currentAnalysis = useCurrentAnalysis();
      expect(currentAnalysis?.id).toBe('test-analysis');
    });

    it('useAnalysisProgress should return analysis progress', () => {
      const progress = useAnalysisProgress();
      expect(progress?.currentSection).toBe('Characters');
    });

    it('useIsAnalyzing should return analyzing state', () => {
      const isAnalyzing = useIsAnalyzing();
      expect(isAnalyzing).toBe(true);
    });

    it('useAnalysisError should return analysis error', () => {
      const error = useAnalysisError();
      expect(error).toBe('Test error');
    });

    it('useAnalysisHistory should return analysis history', () => {
      const history = useAnalysisHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('history-1');
    });

    it('useSelectedRole should return selected role', () => {
      const role = useSelectedRole();
      expect(role).toBe('DIRECTOR');
    });

    it('useUIState should return UI state and actions', () => {
      const uiState = useUIState();
      expect(uiState.darkMode).toBe(false);
      expect(uiState.sidebarOpen).toBe(false);
      expect(uiState.collapsedSections.has('characters')).toBe(true);
      expect(typeof uiState.toggleDarkMode).toBe('function');
      expect(typeof uiState.setSidebarOpen).toBe('function');
    });

    it('useAuth should return auth state and actions', () => {
      const auth = useAuth();
      expect(auth.isAuthenticated).toBe(true);
      expect(typeof auth.setAuthenticated).toBe('function');
    });

    it('useFileProcessing should return file processing state and actions', () => {
      const fileProcessing = useFileProcessing();
      expect(fileProcessing.currentFile?.name).toBe('test.pdf');
      expect(fileProcessing.extractedText).toBe('Extracted text');
      expect(fileProcessing.extractionMethod).toBe('OCR');
      expect(fileProcessing.isProcessing).toBe(true);
      expect(typeof fileProcessing.setCurrentFile).toBe('function');
      expect(typeof fileProcessing.setExtractedText).toBe('function');
      expect(typeof fileProcessing.startProcessing).toBe('function');
      expect(typeof fileProcessing.stopProcessing).toBe('function');
    });

    it('useChatMessages should return chat messages for specific job', () => {
      const messages = useChatMessages('job-1');
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg-1');
    });

    it('useChatMessages should return empty array for non-existent job', () => {
      const messages = useChatMessages('non-existent');
      expect(messages).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle updatePartialAnalysis with no current file', () => {
      const { updatePartialAnalysis } = useAnalysisStore.getState();
      
      expect(() => {
        updatePartialAnalysis('metadata', { title: 'Test' });
      }).not.toThrow();
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis?.filename).toBe('Untitled');
    });

    it('should handle empty section data in updatePartialAnalysis', () => {
      const { updatePartialAnalysis } = useAnalysisStore.getState();
      
      expect(() => {
        updatePartialAnalysis('characters', []);
        updatePartialAnalysis('scenes', null);
        updatePartialAnalysis('dialogue', undefined);
      }).not.toThrow();
    });

    it('should handle multiple rapid updates', () => {
      const { updatePartialAnalysis, setCurrentFile } = useAnalysisStore.getState();
      
      const mockFile = new File(['test'], 'test.pdf');
      setCurrentFile(mockFile);
      
      // Rapid updates
      for (let i = 0; i < 10; i++) {
        updatePartialAnalysis(`section-${i}`, { data: i });
      }
      
      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toBeDefined();
      expect(Object.keys(state.currentAnalysis || {})).toContain('section-9');
    });

    it('should handle Set operations correctly for collapsedSections', () => {
      const { toggleSection, setSectionCollapsed } = useAnalysisStore.getState();
      
      // Test Set behavior
      toggleSection('section1');
      toggleSection('section2');
      setSectionCollapsed('section3', true);
      
      const state = useAnalysisStore.getState();
      expect(state.collapsedSections).toBeInstanceOf(Set);
      expect(state.collapsedSections.size).toBe(3);
      expect(state.collapsedSections.has('section1')).toBe(true);
      expect(state.collapsedSections.has('section2')).toBe(true);
      expect(state.collapsedSections.has('section3')).toBe(true);
    });

    it('should handle analysis result without current file', () => {
      const { setAnalysisResult } = useAnalysisStore.getState();
      
      const mockAnalysis: CompleteAnalysis = {
        id: 'test-analysis-id',
        filename: 'test.pdf',
        createdAt: '2023-01-01T00:00:00.000Z',
        lastModified: '2023-01-01T00:00:00.000Z',
      } as CompleteAnalysis;
      
      expect(() => {
        setAnalysisResult(mockAnalysis);
      }).not.toThrow();
      
      const state = useAnalysisStore.getState();
      expect(state.analysisHistory[0].fileSize).toBe(0);
    });
  });

  describe('Complex Interactions', () => {
    it('should handle complete analysis workflow', async () => {
      const store = useAnalysisStore.getState();
      
      // 1. Set file
      const mockFile = new File(['script content'], 'script.pdf', { size: 2048 });
      store.setCurrentFile(mockFile);
      
      // 2. Process file
      store.startProcessing();
      store.setExtractedText('Extracted script content', 'OCR');
      store.stopProcessing();
      
      // 3. Start analysis
      store.startAnalysis();
      
      // 4. Update progress
      store.setAnalysisProgress({
        currentSection: 'Characters',
        sectionsComplete: 5,
        totalSections: 27,
        percentage: 18.5,
        estimatedTimeRemaining: 45000,
        errors: []
      });
      
      // 5. Update partial results
      store.updatePartialAnalysis('characters', [{ name: 'John', role: 'protagonist' }]);
      store.updatePartialAnalysis('scenes', [{ id: 1, location: 'Office' }]);
      
      // 6. Complete analysis
      const completeAnalysis: CompleteAnalysis = {
        id: 'final-analysis',
        filename: 'script.pdf',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        characters: [{ name: 'John', role: 'protagonist' }],
        scenes: [{ id: 1, location: 'Office' }]
      } as CompleteAnalysis;
      
      store.setAnalysisResult(completeAnalysis);
      
      const finalState = useAnalysisStore.getState();
      expect(finalState.currentAnalysis).toEqual(completeAnalysis);
      expect(finalState.isAnalyzing).toBe(false);
      expect(finalState.analysisProgress).toBeNull();
      expect(finalState.analysisHistory).toHaveLength(1);
      expect(finalState.analysisHistory[0].filename).toBe('script.pdf');
    });

    it('should handle error during analysis', () => {
      const store = useAnalysisStore.getState();
      
      // Start analysis
      store.startAnalysis();
      expect(store.isAnalyzing).toBe(true);
      
      // Simulate error
      store.setAnalysisError('Network connection failed');
      
      const state = useAnalysisStore.getState();
      expect(state.isAnalyzing).toBe(false);
      expect(state.analysisProgress).toBeNull();
      expect(state.analysisError).toBe('Network connection failed');
    });

    it('should maintain chat history across different jobs', () => {
      const { addChatMessage } = useAnalysisStore.getState();
      
      const msg1: ChatMessage = { id: '1', content: 'Hello job 1', timestamp: Date.now(), sender: 'user' };
      const msg2: ChatMessage = { id: '2', content: 'Hello job 2', timestamp: Date.now(), sender: 'user' };
      const msg3: ChatMessage = { id: '3', content: 'Another for job 1', timestamp: Date.now(), sender: 'assistant' };
      
      addChatMessage('job-1', msg1);
      addChatMessage('job-2', msg2);
      addChatMessage('job-1', msg3);
      
      const state = useAnalysisStore.getState();
      expect(state.chatMessages['job-1']).toHaveLength(2);
      expect(state.chatMessages['job-2']).toHaveLength(1);
      expect(state.chatMessages['job-1'][1]).toEqual(msg3);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large history efficiently', () => {
      const { addToHistory } = useAnalysisStore.getState();
      
      const start = performance.now();
      
      // Add many history entries
      for (let i = 0; i < 100; i++) {
        const entry: AnalysisHistoryEntry = {
          id: `history-${i}`,
          filename: `file-${i}.pdf`,
          analysis: { id: `analysis-${i}` } as CompleteAnalysis,
          timestamp: Date.now(),
          analysisType: 'Complete Analysis (27 Sections)',
          version: '3.0',
          fileSize: 1024,
          processingTime: 5000
        };
        addToHistory(entry);
      }
      
      const end = performance.now();
      const state = useAnalysisStore.getState();
      
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
      expect(state.analysisHistory).toHaveLength(50); // Limited to 50 entries
      expect(state.analysisHistory[0].id).toBe('history-99'); // Most recent first
    });

    it('should handle many section toggles efficiently', () => {
      const { toggleSection } = useAnalysisStore.getState();
      
      const start = performance.now();
      
      // Toggle many sections
      for (let i = 0; i < 1000; i++) {
        toggleSection(`section-${i}`);
      }
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
      expect(useAnalysisStore.getState().collapsedSections.size).toBe(1000);
    });
  });
});