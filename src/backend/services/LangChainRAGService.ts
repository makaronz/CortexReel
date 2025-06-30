import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { WeaviateStore } from "@langchain/weaviate";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import weaviate, { type WeaviateClient } from 'weaviate-ts-client';
import { AdminConfigService } from '@/services/AdminConfigService';
import { LLMConfig } from '@/types/analysis';

// MOCK IMPLEMENTATION - This would be replaced by actual backend logic
const createMockWeaviateClient = (): WeaviateClient => {
    console.warn("Using mock Weaviate client. Connect to a real instance in production.");
    return weaviate.client({
        scheme: 'http',
        host: 'localhost:8080', // Dummy host
    });
};

export class LangChainRAGService {
    private chain: ConversationalRetrievalQAChain | null = null;
    private vectorStore: WeaviateStore | null = null;
    private weaviateClient: WeaviateClient;
    private adminConfigService: AdminConfigService;

    constructor() {
        this.weaviateClient = createMockWeaviateClient();
        this.adminConfigService = new AdminConfigService();
    }

    private createLLM(config: LLMConfig) {
        // This logic should be expanded to handle different providers (Gemini, Claude, etc.)
        // For now, it's focused on OpenAI models as LangChain has strong support for them.
        let modelName = config.model;
        if (modelName.startsWith('openai/')) {
            modelName = modelName.split('/')[1];
        }

        console.log(`Initializing LLM with model: ${modelName}`);

        return new ChatOpenAI({
            modelName: modelName,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
            topP: config.topP,
            openAIApiKey: config.apiKey, // Assumes apiKey is for OpenAI
        });
    }

    public async initialize() {
        if (this.chain) {
            console.log("RAG service already initialized.");
            return;
        }

        try {
            console.log("Initializing LangChain RAG service...");
            const llmConfig = await this.adminConfigService.getLLMConfig();
            if (!llmConfig.apiKey) {
                throw new Error("API Key for LLM is not configured in the Admin Dashboard.");
            }
            
            const llm = this.createLLM(llmConfig);
            const embeddings = new OpenAIEmbeddings({ openAIApiKey: llmConfig.apiKey });

            // In a real scenario, we would connect to an existing index
            // For now, we create a dummy vector store
            // this.vectorStore = await WeaviateStore.fromExistingIndex(...);
            this.vectorStore = new WeaviateStore(embeddings, {
                // @ts-ignore - mismatch between langchain community typings and weaviate-ts-client
                client: this.weaviateClient as any,
                indexName: "SceneEmbedding",
                textKey: "content",
                metadataKeys: ["sceneId", "jobId", "sceneNumber"]
            });
            console.log("Mock Weaviate vector store initialized.");


            this.chain = ConversationalRetrievalQAChain.fromLLM(
                llm,
                this.vectorStore.asRetriever(),
                {
                    memory: new BufferMemory({
                        memoryKey: "chat_history",
                        inputKey: 'question', // Important to match the input key
                        outputKey: 'text', // Important to match the output key
                        returnMessages: true,
                    }),
                    returnSourceDocuments: true,
                }
            );

            console.log("ConversationalRetrievalQAChain created successfully.");
        } catch (error) {
            console.error("Failed to initialize LangChain RAG Service:", error);
            this.chain = null;
        }
    }

    public async query(question: string, chatId: string): Promise<string> {
        if (!this.chain) {
            await this.initialize();
            if (!this.chain) {
                 return "Error: RAG service is not initialized. Please check configuration.";
            }
        }
        
        console.log(`Querying chain for chat ${chatId}: "${question}"`);

        // Here you would normally load chat history from MongoDB for the given chatId
        // For now, the memory is in-instance only.

        try {
            const response = await this.chain.call({
                question: question,
            });

            console.log("RAG Chain Response:", response);
            return response.text;
        } catch (error) {
            console.error("Error during LangChain query:", error);
            return "Sorry, I encountered an error while processing your request.";
        }
    }

    public async analyzeScreenplayFile(
        filepath: string,
        meta: { filename: string; userId?: string },
    ): Promise<{ pages: number; chunks: number; filename: string }> {
        console.log(`▶️  [RAG] Starting analysis for ${meta.filename}`);

        // 1. Parse PDF (fallback to raw text if parsing fails)
        let fullText = '';
        let pageCount = 0;
        try {
            // Dynamically import to avoid bundling when not needed in frontend
            const pdfParse = (await import('pdf-parse')).default;
            const fs = await import('node:fs/promises');
            const buffer = await fs.readFile(filepath);
            const parsed = await pdfParse(buffer);
            fullText = parsed.text;
            pageCount = parsed.numpages || 0;
        } catch (err) {
            console.warn('[RAG] PDF parse failed, attempting raw read', err);
            // fallback: read raw text file
            const fs = await import('node:fs/promises');
            fullText = await fs.readFile(filepath, 'utf-8');
            pageCount = 1;
        }

        // 2. Chunk text for embeddings
        const { RecursiveCharacterTextSplitter } = await import('langchain/text_splitter');
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200,
        });
        const chunks = await splitter.splitText(fullText);

        if (!chunks.length) {
            throw new Error('No text extracted from screenplay');
        }

        // 3. Ensure vectorStore initialised
        if (!this.vectorStore) {
            await this.initialize();
            if (!this.vectorStore) throw new Error('Vector store not initialised');
        }

        // 4. Embed & store documents
        const docs = chunks.map((text, idx) => ({
            pageContent: text,
            metadata: {
                chunkIndex: idx,
                filename: meta.filename,
                userId: meta.userId,
            },
        }));

        try {
            await this.vectorStore!.addDocuments(docs);
            console.log(`[RAG] Stored ${docs.length} chunks in Weaviate`);
        } catch (err) {
            console.error('[RAG] Failed storing documents', err);
            throw err;
        }

        return { pages: pageCount, chunks: docs.length, filename: meta.filename };
    }
} 