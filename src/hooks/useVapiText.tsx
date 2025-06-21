
import { useState, useEffect, useCallback } from 'react';

export interface TextMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const useVapiText = () => {
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

  useEffect(() => {
    const setupTextListeners = () => {
      if (window.vapiInstance) {
        // Listen for text responses from the assistant
        window.vapiInstance.on('message', (data: any) => {
          console.log('Received text message:', data);
          if (data.type === 'assistant-message' || data.message) {
            const newMessage: TextMessage = {
              id: Date.now().toString(),
              text: data.message || data.text || data.content,
              sender: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
          }
        });

        // Listen for errors
        window.vapiInstance.on('error', (error: any) => {
          console.error('Vapi text error:', error);
          setError(error.message || 'Failed to send message');
          setIsLoading(false);
        });
      }
    };

    // Check if Vapi is ready, if not wait for it
    const checkVapiReady = () => {
      if (window.vapiInstance) {
        setupTextListeners();
      } else {
        setTimeout(checkVapiReady, 100);
      }
    };

    checkVapiReady();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !window.vapiInstance) return;

    const userMessage: TextMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send message to Vapi assistant
      await window.vapiInstance.send(text.trim());
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
