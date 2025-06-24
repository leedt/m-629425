
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
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const initializeTextVapi = async () => {
      const checkVapiReady = () => {
        if (typeof window !== 'undefined' && window.Vapi) {
          console.log('✅ VAPI SDK found, creating text instance...');
          
          try {
            const textInstance = new window.Vapi(apiKey);
            window.vapiTextInstance = textInstance;
            setVapiInstance(textInstance);

            // Set up message handler
            textInstance.on('message', (message: any) => {
              console.log('📨 Received message:', message);
              
              if (message.type === 'transcript' && message.transcript && message.transcript.type === 'final') {
                const newMessage: TextMessage = {
                  id: Date.now().toString(),
                  text: message.transcript.text,
                  sender: message.transcript.user === 'assistant' ? 'assistant' : 'user',
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, newMessage]);
              }
            });

            textInstance.on('error', (error: any) => {
              console.error('❌ Text VAPI error:', error);
              setError(error.message || 'Text messaging error');
              setIsLoading(false);
            });

            console.log('✅ Text VAPI initialized successfully');
            setError(null);

          } catch (error: any) {
            console.error('❌ Failed to initialize text VAPI:', error);
            setError(`Failed to initialize: ${error.message}`);
          }
        } else {
          console.log('🔄 VAPI SDK not ready yet, retrying...');
          setTimeout(checkVapiReady, 100);
        }
      };

      checkVapiReady();
    };

    initializeTextVapi();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!vapiInstance) {
      setError('Text messaging not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: TextMessage = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      console.log('📤 Sending text message:', text);
      
      // Send to VAPI using correct format
      await vapiInstance.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: text
        }
      });

    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      setError(`Failed to send: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [vapiInstance]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isInitialized: !!vapiInstance
  };
};
