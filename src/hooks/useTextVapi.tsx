
import { useState } from 'react';
import { TextMessage } from '@/types/textMessage';

export const useTextVapi = () => {
  const [messages, setMessages] = useState<TextMessage[]>([
    {
      id: '1',
      text: "Hello! I'm Morgan, your ACME Realty virtual agent. What's your name?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: TextMessage = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Simulate response (will be replaced with different API)
      setTimeout(() => {
        const assistantMessage: TextMessage = {
          id: `assistant-${Date.now()}`,
          text: "Thank you for your message! Text messaging will be connected to a different service soon.",
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error: any) {
      console.error('❌ TEXT: Failed to send message:', error);
      setError(`Failed to send: ${error.message}`);
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isInitialized: true
  };
};
