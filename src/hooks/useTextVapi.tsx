
import { useState, useEffect, useCallback } from 'react';

export interface TextMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

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

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const loadVapiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.vapiSDK) {
          resolve(window.vapiSDK);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        script.defer = true;
        script.async = true;

        script.onload = () => {
          console.log('Vapi SDK loaded for text chat');
          resolve(window.vapiSDK);
        };

        script.onerror = () => {
          console.error('Failed to load Vapi SDK for text chat');
          reject(new Error('Failed to load Vapi SDK'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeTextVapi = async () => {
      try {
        await loadVapiScript();
        
        if (window.vapiSDK) {
          console.log('Initializing Vapi for text chat with config:', {
            apiKey: apiKey,
            assistant: { id: assistantId },
            config: {
              show: false, // We handle the UI ourselves
              type: "text",
            }
          });

          const textInstance = window.vapiSDK.run({
            apiKey: apiKey,
            assistant: { id: assistantId },
            config: {
              show: false, // We handle the UI ourselves
              type: "text",
            },
          });

          // Set up event listeners for text messages
          textInstance.on('message', (data: any) => {
            console.log('Received text message event:', data);
            
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

          textInstance.on('transcript', (data: any) => {
            console.log('Received text transcript:', data);
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

          textInstance.on('error', (error: any) => {
            console.error('Text Vapi error:', error);
            setError(error.message || 'Failed to send message');
            setIsLoading(false);
          });

          // Store in a different global variable to avoid conflicts with voice instance
          window.vapiTextInstance = textInstance;
          console.log('Text Vapi initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize text Vapi:', error);
        setError('Failed to initialize text messaging');
      }
    };

    initializeTextVapi();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) {
      console.log('Empty message, not sending');
      return;
    }

    if (!window.vapiTextInstance) {
      console.error('Text Vapi instance not available');
      setError('Text messaging not initialized');
      return;
    }

    console.log('Sending text message:', text.trim());

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
      // Send the message using the text instance
      await window.vapiTextInstance.send(text.trim());
      console.log('Text message sent successfully');
    } catch (err: any) {
      console.error('Failed to send text message:', err);
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
