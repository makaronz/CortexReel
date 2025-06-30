import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  CompleteAnalysis, 
  AnalysisProgress, 
  AnalysisHistoryEntry,
  FilmRole 
} from '@/types/analysis';
import { ChatMessage } from '@/types/ChatMessage';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
  
  // Current Analysis
  currentAnalysis: CompleteAnalysis | null;
  analysisProgress: AnalysisProgress | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // File Processing
  currentFile: File | null;
  extractedText: string | null;
  extractionMethod: 'DIRECT' | 'OCR' | 'MIXED' | null;
  isProcessing: boolean;
  
  // History
  analysisHistory: AnalysisHistoryEntry[];
  
  // UI State
  selectedRole: FilmRole | null;
  collapsedSections: Set<string>;
  darkMode: boolean;
  sidebarOpen: boolean;
  
  // Chat State
  chatMessages: { [jobId: string]: ChatMessage[] };
  
  // Analysis Actions
  setCurrentFile: (file: File | null) => void;
  setExtractedText: (text: string, method: 'DIRECT' | 'OCR' | 'MIXED' | null) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  startAnalysis: () => void;
  updatePartialAnalysis: (section: string, data: any) => void;
  setAnalysisProgress: (progress: AnalysisProgress | null) => void;
  setAnalysisResult: (analysis: CompleteAnalysis) => void;
  setAnalysisError: (error: string | null) => void;
  clearAnalysis: () => void;
  
  // History Actions
  addToHistory: (entry: AnalysisHistoryEntry) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  loadFromHistory: (id: string) => void;
  
  // UI Actions
  setSelectedRole: (role: FilmRole | null) => void;
  toggleSection: (sectionId: string) => void;
  setSectionCollapsed: (sectionId: string, collapsed: boolean) => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Chat Actions
  addChatMessage: (jobId: string, message: ChatMessage) => void;
  clearChatMessages: (jobId: string) => void;
  
  // Utility
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  currentAnalysis: null,
  analysisProgress: null,
  isAnalyzing: false,
  analysisError: null,
  currentFile: null,
  extractedText: null,
  extractionMethod: null,
  isProcessing: false,
  analysisHistory: [],
  selectedRole: null,
  collapsedSections: new Set<string>(),
  darkMode: true, // Default to dark mode for film industry
  sidebarOpen: true,
  chatMessages: {},
};

export const useAnalysisStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Authentication Actions
      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
      },
      
      // File Processing Actions
      setCurrentFile: (file: File | null) => {
        set({ 
          currentFile: file,
          analysisError: null,
          currentAnalysis: null,
          extractedText: null,
          extractionMethod: null,
          isProcessing: false
        });
      },
      
      setExtractedText: (text: string, method: 'DIRECT' | 'OCR' | 'MIXED' | null) => {
        set({ 
          extractedText: text,
          extractionMethod: method
        });
      },
      
      startProcessing: () => set({ isProcessing: true, analysisError: null }),
      stopProcessing: () => set({ isProcessing: false }),
      
      // Analysis Actions
      startAnalysis: () => {
        set({ 
          isAnalyzing: true,
          analysisError: null,
          analysisProgress: {
            currentSection: 'Initializing...',
            sectionsComplete: 0,
            totalSections: 27,
            percentage: 0,
            estimatedTimeRemaining: 60000,
            errors: []
          }
        });
      },
      
      updatePartialAnalysis: (section: string, data: any) => {
        console.log(`🏪 Store updating partial analysis for section: ${section}`, {
          dataType: typeof data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A'
        });
        
        if (section === 'scenes') {
          console.log('🎬 Store received scenes data:', {
            dataType: typeof data,
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : 'N/A',
            sample: Array.isArray(data) && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'Empty or not array'
          });
        }
        
        set(state => {
          if (!state.currentAnalysis) {
            // Initialize with the first partial result if it doesn't exist
            console.log('🏪 Initializing currentAnalysis with first partial result');
            return { 
              currentAnalysis: { 
                id: crypto.randomUUID(),
                filename: state.currentFile?.name || 'Untitled',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                [section]: data 
              } as Partial<CompleteAnalysis> as CompleteAnalysis
            };
          }
          
          console.log(`🏪 Updating existing currentAnalysis with ${section} data`);
          const updatedAnalysis = {
            ...state.currentAnalysis,
            [section]: data,
            lastModified: new Date().toISOString(),
          };
          
          if (section === 'scenes') {
            console.log('🎬 Final scenes in store:', {
              length: updatedAnalysis.scenes?.length || 0,
              sample: updatedAnalysis.scenes?.[0] ? JSON.stringify(updatedAnalysis.scenes[0], null, 2) : 'No scenes'
            });
          }
          
          return {
            currentAnalysis: updatedAnalysis
          };
        });
      },
      
      setAnalysisProgress: (progress: AnalysisProgress | null) => {
        set({ analysisProgress: progress });
      },
      
      setAnalysisResult: (analysis: CompleteAnalysis) => {
        const historyEntry: AnalysisHistoryEntry = {
          id: analysis.id,
          filename: analysis.filename,
          analysis,
          timestamp: Date.now(),
          analysisType: 'Complete Analysis (27 Sections)',
          version: '3.0',
          fileSize: get().currentFile?.size || 0,
          processingTime: Date.now() - Date.parse(analysis.createdAt)
        };
        
        set({ 
          currentAnalysis: analysis,
          isAnalyzing: false,
          analysisProgress: null,
          analysisError: null
        });
        
        // Add to history
        get().addToHistory(historyEntry);
      },
      
      setAnalysisError: (error: string | null) => {
        set({ 
          analysisError: error,
          isAnalyzing: false,
          analysisProgress: null
        });
      },
      
      clearAnalysis: () => {
        set({
          currentAnalysis: null,
          analysisProgress: null,
          isAnalyzing: false,
          analysisError: null,
          currentFile: null,
          extractedText: null,
          extractionMethod: null,
          isProcessing: false
        });
      },
      
      // History Actions
      addToHistory: (entry: AnalysisHistoryEntry) => {
        const { analysisHistory } = get();
        const newHistory = [entry, ...analysisHistory.filter(h => h.id !== entry.id)];
        
        // Keep only last 50 entries
        const limitedHistory = newHistory.slice(0, 50);
        
        set({ analysisHistory: limitedHistory });
      },
      
      removeFromHistory: (id: string) => {
        const { analysisHistory } = get();
        set({
          analysisHistory: analysisHistory.filter(entry => entry.id !== id)
        });
      },
      
      clearHistory: () => {
        set({ analysisHistory: [] });
      },
      
      loadFromHistory: (id: string) => {
        const { analysisHistory } = get();
        const entry = analysisHistory.find(h => h.id === id);
        
        if (entry) {
          set({
            currentAnalysis: entry.analysis,
            analysisError: null,
            isAnalyzing: false,
            analysisProgress: null
          });
        }
      },
      
      // UI Actions
      setSelectedRole: (role: FilmRole | null) => {
        set({ selectedRole: role });
      },
      
      toggleSection: (sectionId: string) => {
        const { collapsedSections } = get();
        const newCollapsed = new Set(collapsedSections);
        
        if (newCollapsed.has(sectionId)) {
          newCollapsed.delete(sectionId);
        } else {
          newCollapsed.add(sectionId);
        }
        
        set({ collapsedSections: newCollapsed });
      },
      
      setSectionCollapsed: (sectionId: string, collapsed: boolean) => {
        const { collapsedSections } = get();
        const newCollapsed = new Set(collapsedSections);
        
        if (collapsed) {
          newCollapsed.add(sectionId);
        } else {
          newCollapsed.delete(sectionId);
        }
        
        set({ collapsedSections: newCollapsed });
      },
      
      toggleDarkMode: () => {
        set(state => ({ darkMode: !state.darkMode }));
      },
      
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      
      // Chat Actions
      addChatMessage: (jobId: string, message: ChatMessage) => {
        set(state => {
          const newChatMessages = { ...state.chatMessages };
          const history = newChatMessages[jobId] || [];
          newChatMessages[jobId] = [...history, message];
          return { chatMessages: newChatMessages };
        });
      },
      clearChatMessages: (jobId: string) => {
        set(state => {
          const newChatMessages = { ...state.chatMessages };
          delete newChatMessages[jobId];
          return { chatMessages: newChatMessages };
        });
      },
      
      // Utility Actions
      reset: () => {
        set({...initialState, chatMessages: {}});
      }
    }),
    {
      name: 'cortex-reel-analysis-store',
      partialize: (state) => ({
        // Persist only these fields
        isAuthenticated: state.isAuthenticated,
        analysisHistory: state.analysisHistory,
        selectedRole: state.selectedRole,
        collapsedSections: Array.from(state.collapsedSections), // Convert Set to Array for storage
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        chatMessages: state.chatMessages, // Persist chat messages
      }),
      onRehydrateStorage: () => (state) => {
        // Convert collapsedSections back to Set after loading from storage
        if (state && Array.isArray(state.collapsedSections)) {
          state.collapsedSections = new Set(state.collapsedSections);
        }
      }
    }
  )
);

// Selectors for better performance
export const useCurrentAnalysis = () => useAnalysisStore(state => state.currentAnalysis);
export const useAnalysisProgress = () => useAnalysisStore(state => state.analysisProgress);
export const useIsAnalyzing = () => useAnalysisStore(state => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore(state => state.analysisError);
export const useAnalysisHistory = () => useAnalysisStore(state => state.analysisHistory);
export const useSelectedRole = () => useAnalysisStore(state => state.selectedRole);
export const useUIState = () => useAnalysisStore(state => ({
  darkMode: state.darkMode,
  sidebarOpen: state.sidebarOpen,
  collapsedSections: state.collapsedSections,
  toggleDarkMode: state.toggleDarkMode,
  setSidebarOpen: state.setSidebarOpen
}));

// Authentication selector
export const useAuth = () => useAnalysisStore(state => ({
  isAuthenticated: state.isAuthenticated,
  setAuthenticated: state.setAuthenticated
}));

// File processing selectors
export const useFileProcessing = () => useAnalysisStore(state => ({
  currentFile: state.currentFile,
  extractedText: state.extractedText,
  extractionMethod: state.extractionMethod,
  isProcessing: state.isProcessing,
  setCurrentFile: state.setCurrentFile,
  setExtractedText: state.setExtractedText,
  startProcessing: state.startProcessing,
  stopProcessing: state.stopProcessing
}));

export const useChatMessages = (jobId: string) => useAnalysisStore(state => state.chatMessages[jobId] || []); 