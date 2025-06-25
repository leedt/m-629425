
import { useState, useEffect, useCallback } from 'react';
import { TextMessage } from '@/types/textMessage';
import { VapiManager } from '@/utils/vapiManager';
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
      console.log('🔤 TEXT: Starting initialization...');
      
      try {
        const textInstance = await VapiManager.createTextInstance({ assistantId, apiKey });
        
        console.log('🔤 TEXT: Setting up event listeners...');

        // Set up event listeners for text messages
        textInstance.on('message', (message: any) => {
          console.log('🔤 TEXT: Received message event:', message);
          handleVapiMessage(message, setMessages, setIsLoading);
        });

        textInstance.on('conversation-update', (message: any) => {
          console.log('🔤 TEXT: Received conversation-update event:', message);
          handleVapiMessage({ ...message, type: 'conversation-update' }, setMessages, setIsLoading);
        });

        textInstance.on('transcript', (message: any) => {
          console.log('🔤 TEXT: Received transcript event:', message);
          handleVapiMessage({ ...message, type: 'transcript' }, setMessages, setIsLoading);
        });

        textInstance.on('speech-update', (message: any) => {
          console.log('🔤 TEXT: Received speech-update event:', message);
          handleVapiMessage({ ...message, type: 'speech-update' }, setMessages, setIsLoading);
        });

        textInstance.on('status-update', (message: any) => {
          console.log('🔤 TEXT: Received status-update event:', message);
          handleVapiMessage({ ...message, type: 'status-update' }, setMessages, setIsLoading);
        });

        textInstance.on('function-call', (message: any) => {
          console.log('🔤 TEXT: Received function-call event:', message);
          handleVapiMessage({ ...message, type: 'function-call' }, setMessages, setIsLoading);
        });

        textInstance.on('error', (error: any) => {
          console.error('❌ TEXT: Error occurred:', error);
          setError(error.message || 'Text messaging error');
          setIsLoading(false);
        });

        setVapiInstance(textInstance);
        console.log('🔤 TEXT: Instance ready and stored');

        // Start the text conversation
        try {
          if (textInstance.send) {
            console.log('🔤 TEXT: Starting conversation...');
            await textInstance.send({
              type: 'conversation-start',
              assistant: assistantId
            });
            console.log('✅ TEXT: Conversation initiated');
          }
        } catch (err: any) {
          console.log('🔤 TEXT: Could not start conversation automatically:', err.message);
        }

        // Debug logging
        console.log('🔍 TEXT DEBUG:');
        console.log('Voice:', (window as any).vapiVoiceInstance);
        console.log('Text:', (window as any).vapiTextInstance);
        console.log('Same?', (window as any).vapiVoiceInstance === (window as any).vapiTextInstance);

      } catch (error: any) {
        console.error('❌ TEXT: Failed to initialize:', error);
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

      console.log('🔤 TEXT: Sending message:', text);

      // Add user message to UI immediately
      const userMessage = createUserMessage(text);
      setMessages(prev => [...prev, userMessage]);

      await sendVapiMessage(vapiInstance, text);

    } catch (error: any) {
      console.error('❌ TEXT: Failed to send message:', error);
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
