
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
    const initializeTextVapi = () => {
      if (typeof window !== 'undefined' && window.Vapi) {
        console.log('✅ VAPI SDK found, creating text instance...');
        
        try {
          const textInstance = new window.Vapi(apiKey);
          window.vapiTextInstance = textInstance;
          setVapiInstance(textInstance);

          // Listen for conversation-update events (correct for text messaging)
          textInstance.on('message', (message: any) => {
            console.log('📨 Received message:', message);
            
            // Handle conversation updates - this is the correct event for text
            if (message.type === 'conversation-update' && message.conversation?.messages) {
              const lastMessage = message.conversation.messages[message.conversation.messages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
                const assistantMessage: TextMessage = {
                  id: `assistant-${Date.now()}`,
                  text: lastMessage.content,
                  sender: 'assistant',
                  timestamp: new Date()
                };
                
                setMessages(prev => {
                  // Avoid duplicates
                  const exists = prev.some(m => 
                    m.text === assistantMessage.text && 
                    m.sender === 'assistant' &&
                    Math.abs(m.timestamp.getTime() - assistantMessage.timestamp.getTime()) < 1000
                  );
                  return exists ? prev : [...prev, assistantMessage];
                });
              }
            }

            // Handle model output for immediate responses
            if (message.type === 'model-output' && message.output) {
              const assistantMessage: TextMessage = {
                id: `model-${Date.now()}`,
                text: message.output,
                sender: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, assistantMessage]);
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
        setTimeout(initializeTextVapi, 100);
      }
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

      // Add user message to UI immediately
      const userMessage: TextMessage = {
        id: `user-${Date.now()}`,
        text,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      console.log('📤 Sending text message:', text);
      
      // Send message using the correct format for text messaging
      await vapiInstance.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: text
        }
      });

      console.log('✅ Message sent successfully');

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
