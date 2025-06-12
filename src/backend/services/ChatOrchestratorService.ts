import { LangChainRAGService } from './LangChainRAGService';
import { ChatMessage } from '@/types/ChatMessage';

export class ChatOrchestratorService {
    private ragService: LangChainRAGService;

    constructor() {
        this.ragService = new LangChainRAGService();
        console.log("ChatOrchestratorService initialized.");
    }

    /**
     * Handles an incoming message from the user, gets a response from the RAG service,
     * and returns the assistant's reply.
     * @param chatId A unique identifier for the chat session.
     * @param userMessage The content of the user's message.
     * @returns The assistant's response message.
     */
    public async handleUserMessage(chatId: string, userMessage: string): Promise<string> {
        if (!userMessage.trim()) {
            return "Please provide a message.";
        }

        // The RAG service currently manages its own internal memory.
        // In a future backend implementation, we would pass the chat history here.
        const assistantResponse = await this.ragService.query(userMessage, chatId);

        return assistantResponse;
    }
}

// Singleton instance to be used by the frontend
export const chatOrchestrator = new ChatOrchestratorService(); 