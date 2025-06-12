import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Avatar
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon, SmartToy as SmartToyIcon } from '@mui/icons-material';
import { chatOrchestrator } from '@/backend/services/ChatOrchestratorService';
import { useChatMessages, useAnalysisStore } from '@/store/analysisStore';
import { ChatMessage } from '@/types/ChatMessage';

interface AnalysisChatProps {
    jobId: string;
}

export const AnalysisChat: React.FC<AnalysisChatProps> = ({ jobId }) => {
    const messages = useChatMessages(jobId);
    const { addChatMessage } = useAnalysisStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            userId: 'user', // In a real app, this would come from an auth context
            content: input,
            type: 'user',
            timestamp: new Date().toISOString()
        };
        addChatMessage(jobId, userMessage);
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const assistantResponse = await chatOrchestrator.handleUserMessage(jobId, currentInput);
            const assistantMessage: ChatMessage = {
                userId: 'assistant',
                content: assistantResponse,
                type: 'assistant',
                timestamp: new Date().toISOString()
            };
            addChatMessage(jobId, assistantMessage);
        } catch (error) {
            const errorMessage: ChatMessage = {
                userId: 'assistant',
                content: 'An error occurred. Please try again.',
                type: 'assistant',
                timestamp: new Date().toISOString()
            };
            addChatMessage(jobId, errorMessage);
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 2, backgroundColor: 'background.default' }}>
            <Typography variant="h6" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                Analysis Chat
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <List>
                    {messages.map((msg, idx) => (
                        <ListItem key={idx} sx={{ alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: msg.type === 'user' ? 'primary.main' : 'secondary.main', mr: 2 }}>
                                {msg.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                            </Avatar>
                            <ListItemText
                                primary={msg.content}
                                secondary={new Date(msg.timestamp).toLocaleTimeString()}
                                primaryTypographyProps={{
                                    sx: {
                                        backgroundColor: msg.type === 'user' ? 'primary.light' : 'background.paper',
                                        color: msg.type === 'user' ? 'primary.contrastText' : 'text.primary',
                                        p: 1.5,
                                        borderRadius: 2,
                                        display: 'inline-block'
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about the analysis or suggest changes..."
                    variant="outlined"
                    disabled={isLoading}
                />
                <IconButton onClick={handleSend} color="primary" disabled={isLoading} sx={{ ml: 1 }}>
                    {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
            </Box>
        </Paper>
    );
}; 