
import { TextMessage } from '@/types/textMessage';

export const setupVapiTextEvents = (
  textInstance: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  console.log('🎧 Setting up Vapi text event listeners...');
  console.log('🎧 Text instance methods available:', Object.getOwnPropertyNames(textInstance));
  console.log('🎧 Text instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));

  // Set up a comprehensive catch-all event listener to see what events are actually fired
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up enhanced catch-all event listener...');
    
    // Try to intercept ALL events by patching the event system
    const originalOn = textInstance.on.bind(textInstance);
    const originalEmit = textInstance.emit?.bind(textInstance);
    
    if (originalEmit) {
      textInstance.emit = function(eventName: string, ...args: any[]) {
        console.log('🎪 EVENT EMITTED:', eventName, args);
        return originalEmit(eventName, ...args);
      };
    }

    // Set up catch-all listeners with multiple approaches
    try {
      textInstance.on('*', (...args: any[]) => {
        console.log('🎪 CATCH-ALL EVENT (*):', args);
      });
    } catch (e) {
      console.log('⚠️ Catch-all with * failed:', e);
    }

    // Try common event patterns
    const eventPatterns = ['*', 'all', 'any', '**'];
    eventPatterns.forEach(pattern => {
      try {
        textInstance.on(pattern, (...args: any[]) => {
          console.log(`🎪 CATCH-ALL EVENT (${pattern}):`, args);
        });
      } catch (e) {
        console.log(`⚠️ Pattern ${pattern} failed:`, e);
      }
    });
  }

  // Enhanced specific event listeners
  const specificEvents = [
    'message', 'response', 'text', 'chat', 'assistant-message', 'user-message',
    'transcript', 'conversation', 'reply', 'answer', 'completion',
    'text-response', 'chat-message', 'assistant-response', 'conversation-update',
    'call-start', 'call-end', 'speech-start', 'speech-end',
    'function-call', 'tool-call', 'model-output', 'stream'
  ];

  specificEvents.forEach(eventName => {
    try {
      textInstance.on(eventName, (...args: any[]) => {
        console.log(`🎯 ${eventName.toUpperCase()} EVENT:`, args);
        console.log(`🎯 ${eventName.toUpperCase()} args length:`, args.length);
        
        if (args.length > 0) {
          const data = args[0];
          console.log(`🎯 ${eventName.toUpperCase()} data type:`, typeof data);
          console.log(`🎯 ${eventName.toUpperCase()} data keys:`, Object.keys(data || {}));
          console.log(`🎯 ${eventName.toUpperCase()} data structure:`, JSON.stringify(data, null, 2));
          
          // Try to process as assistant message from various event types
          if (eventName === 'message' || eventName === 'response' || eventName === 'assistant-message' || eventName === 'text-response') {
            const messageText = data?.message || data?.text || data?.content || data?.response || data?.transcript;
            
            if (messageText && typeof messageText === 'string') {
              console.log('✅ Processing assistant message from', eventName, ':', messageText);
              const newMessage: TextMessage = {
                id: Date.now().toString(),
                text: messageText,
                sender: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => {
                console.log('📝 Adding message from', eventName, 'event. Previous count:', prev.length);
                const updated = [...prev, newMessage];
                console.log('📝 Updated count:', updated.length);
                return updated;
              });
              
              setIsLoading(false);
              console.log('🔄 Set loading to false from', eventName, 'event');
            }
          }
          
          // Handle transcript events
          if (eventName === 'transcript' && data?.role === 'assistant' && data?.transcript) {
            console.log('✅ Processing assistant transcript:', data.transcript);
            const newMessage: TextMessage = {
              id: Date.now().toString(),
              text: data.transcript,
              sender: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => {
              console.log('📝 Adding transcript message. Previous count:', prev.length);
              const updated = [...prev, newMessage];
              console.log('📝 Updated count:', updated.length);
              return updated;
            });
            
            setIsLoading(false);
            console.log('🔄 Set loading to false from transcript event');
          }
        }
      });
      console.log(`✅ Successfully set up listener for: ${eventName}`);
    } catch (e) {
      console.log(`⚠️ Failed to set up listener for: ${eventName}`, e);
    }
  });

  // Set up error handling
  try {
    textInstance.on('error', (...args: any[]) => {
      console.error('❌ TEXT VAPI ERROR EVENT:', args);
      const error = args[0];
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error keys:', Object.keys(error || {}));
      console.error('❌ Error structure:', JSON.stringify(error, null, 2));
      
      setError(error?.message || error?.error || 'Failed to get response');
      setIsLoading(false);
      console.log('🔄 Set loading to false due to error event');
    });
    console.log('✅ Error listener set up successfully');
  } catch (e) {
    console.log('⚠️ Failed to set up error listener:', e);
  }

  // Log all available methods on the instance for debugging
  console.log('🔍 Full textInstance object structure:');
  try {
    console.log('🔍 Own properties:', Object.getOwnPropertyNames(textInstance));
    console.log('🔍 Prototype properties:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));
    console.log('🔍 Constructor name:', textInstance.constructor.name);
    
    // Try to log the instance structure (but safely)
    const instanceInfo: any = {};
    Object.getOwnPropertyNames(textInstance).forEach(prop => {
      try {
        const value = textInstance[prop];
        instanceInfo[prop] = typeof value;
        if (typeof value === 'function') {
          instanceInfo[prop] = `function (${value.length} args)`;
        }
      } catch (e) {
        instanceInfo[prop] = 'access denied';
      }
    });
    console.log('🔍 Instance properties info:', instanceInfo);
  } catch (e) {
    console.log('⚠️ Could not inspect instance:', e);
  }

  console.log('🎧 Event listeners setup completed');
};
