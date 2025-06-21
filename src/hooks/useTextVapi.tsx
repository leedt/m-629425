
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
    // Filter out Facebook preload console messages
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (!message.includes('facebook') && !message.includes('preload')) {
        originalConsoleLog.apply(console, args);
      }
    };

    const loadVapiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.vapiSDK) {
          console.log('✅ Vapi SDK already loaded, reusing existing instance');
          resolve(window.vapiSDK);
          return;
        }

        console.log('📡 Loading Vapi SDK script...');
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        script.defer = true;
        script.async = true;

        script.onload = () => {
          console.log('✅ Vapi SDK loaded successfully for text chat');
          resolve(window.vapiSDK);
        };

        script.onerror = () => {
          console.error('❌ Failed to load Vapi SDK for text chat');
          reject(new Error('Failed to load Vapi SDK'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeTextVapi = async () => {
      try {
        console.log('🚀 Starting text Vapi initialization...');
        await loadVapiScript();
        
        if (window.vapiSDK) {
          console.log('🔧 Initializing Vapi for text chat with config:', {
            apiKey: apiKey ? '***' + apiKey.slice(-4) : 'missing',
            assistant: { id: assistantId },
            config: {
              show: false,
              type: "text",
            }
          });

          const textInstance = window.vapiSDK.run({
            apiKey: apiKey,
            assistant: { id: assistantId },
            config: {
              show: false,
              type: "text",
            },
          });

          // Log instance details
          console.log('📋 Text instance created:', textInstance);
          console.log('🔍 Available methods on instance:', Object.getOwnPropertyNames(textInstance));
          console.log('🔍 Instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));

          // CATCH-ALL EVENT LISTENER - This will capture EVERY event
          if (typeof textInstance.on === 'function') {
            console.log('🎯 Setting up catch-all event listener...');
            textInstance.on('*', (eventName: string, data: any) => {
              console.log('🎪 CATCH-ALL EVENT:', eventName, 'Data:', data);
            });
          } else {
            console.warn('⚠️ textInstance.on is not a function, cannot set up catch-all listener');
          }

          // Set up specific event listeners with enhanced logging
          console.log('🎧 Setting up specific event listeners...');

          textInstance.on('message', (data: any) => {
            console.log('📨 MESSAGE EVENT received:', data);
            console.log('📨 Message event type:', typeof data, 'Keys:', Object.keys(data || {}));
            
            if (data.type === 'assistant-message' || data.message) {
              console.log('✅ Processing assistant message:', data.message || data.text || data.content);
              const newMessage: TextMessage = {
                id: Date.now().toString(),
                text: data.message || data.text || data.content,
                sender: 'assistant',
                timestamp: new Date()
              };
              console.log('💾 Adding message to state:', newMessage);
              setMessages(prev => {
                console.log('📝 Previous messages count:', prev.length);
                const updated = [...prev, newMessage];
                console.log('📝 Updated messages count:', updated.length);
                return updated;
              });
              setIsLoading(false);
              console.log('🔄 Set loading to false');
            } else {
              console.log('ℹ️ Message event but not assistant message, ignoring');
            }
          });

          textInstance.on('transcript', (data: any) => {
            console.log('📝 TRANSCRIPT EVENT received:', data);
            console.log('📝 Transcript event type:', typeof data, 'Keys:', Object.keys(data || {}));
            
            if (data.role === 'assistant' && data.transcript) {
              console.log('✅ Processing assistant transcript:', data.transcript);
              const newMessage: TextMessage = {
                id: Date.now().toString(),
                text: data.transcript,
                sender: 'assistant',
                timestamp: new Date()
              };
              console.log('💾 Adding transcript message to state:', newMessage);
              setMessages(prev => {
                console.log('📝 Previous messages count:', prev.length);
                const updated = [...prev, newMessage];
                console.log('📝 Updated messages count:', updated.length);
                return updated;
              });
              setIsLoading(false);
              console.log('🔄 Set loading to false');
            } else {
              console.log('ℹ️ Transcript event but not assistant transcript, ignoring');
            }
          });

          textInstance.on('error', (error: any) => {
            console.error('❌ TEXT VAPI ERROR:', error);
            console.error('❌ Error type:', typeof error, 'Keys:', Object.keys(error || {}));
            setError(error.message || 'Failed to send message');
            setIsLoading(false);
            console.log('🔄 Set loading to false due to error');
          });

          // Try to set up additional potential event listeners
          const potentialEvents = ['response', 'text-response', 'chat-message', 'assistant-response', 'conversation-update'];
          potentialEvents.forEach(eventName => {
            textInstance.on(eventName, (data: any) => {
              console.log(`🎯 ${eventName.toUpperCase()} EVENT:`, data);
            });
          });

          // Store in a different global variable to avoid conflicts with voice instance
          window.vapiTextInstance = textInstance;
          console.log('✅ Text Vapi initialized successfully and stored in window.vapiTextInstance');
          
          // Periodic health check
          setInterval(() => {
            console.log('💓 Health check - vapiTextInstance exists:', !!window.vapiTextInstance);
            if (window.vapiTextInstance) {
              console.log('💓 Health check - instance type:', typeof window.vapiTextInstance);
            }
          }, 30000); // Every 30 seconds
          
        } else {
          console.error('❌ window.vapiSDK is not available after loading');
        }
      } catch (error) {
        console.error('❌ Failed to initialize text Vapi:', error);
        setError('Failed to initialize text messaging');
      }
    };

    initializeTextVapi();

    // Cleanup console filter on unmount
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    console.log('📤 sendMessage called with:', text.trim());
    
    if (!text.trim()) {
      console.log('⚠️ Empty message, not sending');
      return;
    }

    console.log('🔍 Checking vapiTextInstance availability...');
    console.log('🔍 window.vapiTextInstance exists:', !!window.vapiTextInstance);
    console.log('🔍 window.vapiTextInstance type:', typeof window.vapiTextInstance);
    
    if (window.vapiTextInstance) {
      console.log('🔍 Available methods on vapiTextInstance:', Object.getOwnPropertyNames(window.vapiTextInstance));
      console.log('🔍 send method exists:', typeof window.vapiTextInstance.send);
    }

    if (!window.vapiTextInstance) {
      console.error('❌ Text Vapi instance not available');
      setError('Text messaging not initialized');
      return;
    }

    console.log('📨 Creating user message for state...');
    const userMessage: TextMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    console.log('💾 Adding user message to state:', userMessage);
    setMessages(prev => {
      console.log('📝 Previous messages count:', prev.length);
      const updated = [...prev, userMessage];
      console.log('📝 Updated messages count:', updated.length);
      return updated;
    });
    
    console.log('🔄 Setting loading to true');
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Attempting to send message via vapiTextInstance.send()...');
      console.log('📡 Message being sent:', text.trim());
      
      const startTime = Date.now();
      const result = await window.vapiTextInstance.send(text.trim());
      const endTime = Date.now();
      
      console.log('✅ Message sent successfully in', endTime - startTime, 'ms');
      console.log('✅ Send result:', result);
      console.log('✅ Send result type:', typeof result);
      
      if (result && typeof result === 'object') {
        console.log('✅ Send result keys:', Object.keys(result));
      }
      
    } catch (err: any) {
      const endTime = Date.now();
      console.error('❌ Failed to send text message after', endTime, 'ms:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Failed to send message');
      setIsLoading(false);
      console.log('🔄 Set loading to false due to send error');
    }
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('📊 Messages state changed, count:', messages.length);
  }, [messages]);

  useEffect(() => {
    console.log('⏳ Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('❌ Error state changed:', error);
  }, [error]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
