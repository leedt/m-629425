
import { useState, useEffect, useCallback } from 'react';
import { TextMessage } from '@/types/textMessage';
import { initializeVapiInstance, startVapiConversation } from '@/utils/vapiInitializer';
import { handleVapiMessage, sendVapiMessage, createUserMessage } from '@/utils/messageHandlers';

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
    const initializeVapi = async () => {
      try {
        const instance = await initializeVapiInstance({ assistantId, apiKey });
        setVapiInstance(instance);

        // Set up event listeners for text messages only
        instance.on('message', (message: any) => {
          handleVapiMessage(message, setMessages, setIsLoading);
        });

        instance.on('conversation-update', (message: any) => {
          handleVapiMessage({ ...message, type: 'conversation-update' }, setMessages, setIsLoading);
        });

        instance.on('speech-update', (message: any) => {
          handleVapiMessage({ ...message, type: 'speech-update' }, setMessages, setIsLoading);
        });

        instance.on('status-update', (message: any) => {
          handleVapiMessage({ ...message, type: 'status-update' }, setMessages, setIsLoading);
        });

        instance.on('error', (error: any) => {
          console.error('❌ Text VAPI error:', error);
          setError(error.message || 'Text messaging error');
          setIsLoading(false);
        });

        // Start the text conversation
        await startVapiConversation(instance, assistantId);

      } catch (error: any) {
        console.error('❌ Failed to initialize VAPI:', error);
        setError(error.message);
      }
    };

    initializeVapi();
  }, [assistantId, apiKey]);

  const sendMessage = useCallback(async (text: string) => {
    if (!vapiInstance) {
      setError('Text messaging not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage = createUserMessage(text);
      setMessages(prev => [...prev, userMessage]);

      await sendVapiMessage(vapiInstance, text);

    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      setError(`Failed to send: ${error.message}`);
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
