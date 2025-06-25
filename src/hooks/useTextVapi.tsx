
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
        
        console.log('🔤 TEXT: Instance created, setting up event listeners...');
        console.log('🔤 TEXT: Available methods:', Object.getOwnPropertyNames(textInstance).filter(prop => typeof textInstance[prop] === 'function'));

        // Set up comprehensive event listeners
        const eventTypes = [
          'message',
          'conversation-update', 
          'transcript',
          'speech-update',
          'status-update',
          'function-call',
          'response',
          'assistant-message',
          'user-message'
        ];

        eventTypes.forEach(eventType => {
          textInstance.on(eventType, (message: any) => {
            console.log(`🔤 TEXT: Received ${eventType} event:`, message);
            handleVapiMessage({ ...message, type: eventType }, setMessages, setIsLoading);
          });
        });

        textInstance.on('error', (error: any) => {
          console.error('❌ TEXT: Error occurred:', error);
          setError(error.message || 'Text messaging error');
          setIsLoading(false);
        });

        setVapiInstance(textInstance);
        console.log('🔤 TEXT: Instance ready and stored');

        // Try to start the conversation
        try {
          console.log('🔤 TEXT: Attempting to start conversation...');
          
          if (textInstance.start) {
            await textInstance.start(assistantId);
            console.log('✅ TEXT: Conversation started with start() method');
          } else if (textInstance.send) {
            await textInstance.send({
              type: 'conversation-start',
              assistant: assistantId
            });
            console.log('✅ TEXT: Conversation started with send() method');
          }
        } catch (err: any) {
          console.log('⚠️ TEXT: Could not start conversation automatically:', err.message);
          // This is not necessarily an error - we can still send messages
        }

      } catch (error: any) {
        console.error('❌ TEXT: Failed to initialize:', error);
        setError(`Initialization failed: ${error.message}`);
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
