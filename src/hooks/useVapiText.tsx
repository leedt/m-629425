
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
        console.log('Setting up Vapi text listeners...');
        
        // Listen for any message events
        window.vapiInstance.on('message', (data: any) => {
          console.log('Received Vapi message event:', data);
          
          // Handle different message types
          if (data.type === 'transcript' && data.role === 'assistant') {
            console.log('Processing assistant transcript:', data.transcript);
            const newMessage: TextMessage = {
              id: Date.now().toString(),
              text: data.transcript,
              sender: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
          } else if (data.type === 'assistant-message' || data.message) {
            console.log('Processing assistant message:', data);
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

        // Listen for transcript events specifically
        window.vapiInstance.on('transcript', (data: any) => {
          console.log('Received transcript event:', data);
          if (data.role === 'assistant' && data.transcript) {
            const newMessage: TextMessage = {
              id: Date.now().toString(),
              text: data.transcript,
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

        console.log('Vapi text listeners set up successfully');
      }
    };

    // Check if Vapi is ready, if not wait for it
    const checkVapiReady = () => {
      if (window.vapiInstance) {
        console.log('Vapi instance ready for text messaging');
        setupTextListeners();
      } else {
        console.log('Waiting for Vapi instance...');
        setTimeout(checkVapiReady, 100);
      }
    };

    checkVapiReady();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) {
      console.log('Empty message, not sending');
      return;
    }

    if (!window.vapiInstance) {
      console.error('Vapi instance not available');
      setError('Vapi not initialized');
      return;
    }

    console.log('Sending message:', text.trim());

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
      // Use the send method that exists on VapiInstance
      console.log('Using send method');
      await window.vapiInstance.send(text.trim());
      console.log('Message sent successfully');
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
