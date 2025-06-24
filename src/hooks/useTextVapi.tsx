
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
    let retryCount = 0;
    const maxRetries = 30;
    
    const initializeTextVapi = () => {
      console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
      console.log('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('vapi')));
      
      // Check for different possible VAPI constructors
      const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK || window.vapiSDK;
      
      console.log('VapiConstructor found:', !!VapiConstructor, typeof VapiConstructor);
      
      if (VapiConstructor) {
        console.log('✅ VAPI constructor found, creating text instance...');
        
        try {
          let textInstance;
          
          if (typeof VapiConstructor === 'function') {
            textInstance = new VapiConstructor(apiKey);
          } else if (VapiConstructor.run) {
            // Start a text conversation immediately with proper assistant config
            textInstance = VapiConstructor.run({
              apiKey: apiKey,
              assistant: {
                id: assistantId
              },
              config: { 
                mode: 'text',
                show: false 
              }
            });
          } else {
            throw new Error('Unknown VAPI constructor type');
          }
          
          window.vapiTextInstance = textInstance;
          setVapiInstance(textInstance);

          // Set up event listeners
          textInstance.on('message', (message: any) => {
            console.log('📨 Received text message:', message);
            
            // Handle conversation updates
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
                  const exists = prev.some(m => 
                    m.text === assistantMessage.text && 
                    m.sender === 'assistant' &&
                    Math.abs(m.timestamp.getTime() - assistantMessage.timestamp.getTime()) < 1000
                  );
                  return exists ? prev : [...prev, assistantMessage];
                });
              }
            }

            // Handle speech events for text mode
            if (message.type === 'speech-start') {
              console.log('🎤 Assistant is thinking...');
              setIsLoading(true);
            }

            if (message.type === 'speech-end') {
              console.log('🎤 Assistant finished');
              setIsLoading(false);
            }

            // Handle transcript for real-time responses
            if (message.type === 'transcript' && message.transcript?.transcript) {
              const assistantMessage: TextMessage = {
                id: `transcript-${Date.now()}`,
                text: message.transcript.transcript,
                sender: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => [...prev, assistantMessage]);
              setIsLoading(false);
            }
          });

          textInstance.on('error', (error: any) => {
            console.error('❌ Text VAPI error:', error);
            setError(error.message || 'Text messaging error');
            setIsLoading(false);
          });

          // Start the conversation automatically
          textInstance.on('call-start', () => {
            console.log('✅ Text conversation started');
            setError(null);
          });

          console.log('✅ Text VAPI initialized successfully');
          
          // Try to start the conversation with proper assistant config
          if (textInstance.start) {
            textInstance.start(assistantId).catch((err: any) => {
              console.log('Could not auto-start conversation, trying alternative method:', err);
              // Try alternative start method
              if (textInstance.startCall) {
                textInstance.startCall({ assistant: assistantId }).catch((err2: any) => {
                  console.log('Alternative start method also failed:', err2);
                });
              }
            });
          }

        } catch (error: any) {
          console.error('❌ Failed to initialize text VAPI:', error);
          setError(`Failed to initialize: ${error.message}`);
        }
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('❌ VAPI SDK failed to load after maximum retries');
          setError('Text messaging unavailable. The VAPI SDK could not be loaded.');
          return;
        }
        
        console.log(`🔄 VAPI constructor not ready yet, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(initializeTextVapi, 200);
      }
    };

    // Start initialization with a delay
    setTimeout(initializeTextVapi, 1000);
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
      
      // Try different send methods
      if (vapiInstance.send) {
        await vapiInstance.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: text
          }
        });
      } else if (vapiInstance.sendMessage) {
        await vapiInstance.sendMessage(text);
      } else {
        throw new Error('No send method available on VAPI instance');
      }

      console.log('✅ Message sent successfully');

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
