
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

  // Deep inspection of the instance
  console.log('🔍 Deep instance inspection:');
  console.log('🔍 Instance constructor:', textInstance.constructor?.name);
  console.log('🔍 Instance toString:', textInstance.toString?.());
  
  // Check if it's an EventEmitter-like object
  console.log('🔍 EventEmitter-like methods:');
  console.log('🔍 - on:', typeof textInstance.on);
  console.log('🔍 - emit:', typeof textInstance.emit);
  console.log('🔍 - addEventListener:', typeof textInstance.addEventListener);
  console.log('🔍 - removeEventListener:', typeof textInstance.removeEventListener);

  // Try to intercept ALL possible events
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up comprehensive event interception...');
    
    // Store original methods
    const originalOn = textInstance.on.bind(textInstance);
    const originalEmit = textInstance.emit?.bind(textInstance);
    
    // Intercept emit calls to see what events are being fired
    if (originalEmit && typeof originalEmit === 'function') {
      textInstance.emit = function(eventName: string, ...args: any[]) {
        console.log('🔥 EVENT EMITTED:', eventName, 'with args:', args);
        console.log('🔥 Event args length:', args.length);
        if (args.length > 0) {
          console.log('🔥 First arg type:', typeof args[0]);
          console.log('🔥 First arg structure:', JSON.stringify(args[0], null, 2));
        }
        return originalEmit(eventName, ...args);
      };
      console.log('✅ Emit interception set up');
    }

    // Try to set up listeners for every conceivable event
    const allPossibleEvents = [
      // Response events
      'message', 'response', 'text', 'chat', 'reply', 'answer', 'completion',
      'assistant-message', 'assistant-response', 'assistant-reply',
      'user-message', 'user-response', 'user-reply',
      'text-message', 'text-response', 'text-reply', 'text-completion',
      'chat-message', 'chat-response', 'chat-reply', 'chat-completion',
      
      // Conversation events
      'conversation', 'conversation-update', 'conversation-message',
      'transcript', 'transcription', 'transcribe',
      
      // Call/Session events
      'call-start', 'call-end', 'session-start', 'session-end',
      'connect', 'connected', 'disconnect', 'disconnected',
      'ready', 'started', 'stopped', 'ended',
      
      // Speech events
      'speech-start', 'speech-end', 'speaking-start', 'speaking-end',
      'listening-start', 'listening-end',
      
      // Model/AI events
      'function-call', 'tool-call', 'model-output', 'model-response',
      'stream', 'streaming', 'chunk', 'data',
      
      // Status events
      'status', 'state', 'update', 'change',
      
      // Error events
      'error', 'warning', 'debug', 'info',
      
      // Generic catch-all patterns
      '*', 'all', 'any', '**'
    ];

    // Set up listeners for all possible events
    allPossibleEvents.forEach(eventName => {
      try {
        textInstance.on(eventName, (...args: any[]) => {
          console.log(`🎪 ${eventName.toUpperCase()} EVENT RECEIVED:`, args);
          console.log(`🎪 ${eventName.toUpperCase()} args count:`, args.length);
          
          if (args.length > 0) {
            const data = args[0];
            console.log(`🎪 ${eventName.toUpperCase()} first arg type:`, typeof data);
            console.log(`🎪 ${eventName.toUpperCase()} first arg keys:`, Object.keys(data || {}));
            console.log(`🎪 ${eventName.toUpperCase()} full data:`, JSON.stringify(data, null, 2));
            
            // Try to extract message content from any event
            const possibleMessageFields = [
              'message', 'text', 'content', 'response', 'transcript', 
              'reply', 'answer', 'completion', 'output', 'result'
            ];
            
            let messageText = null;
            for (const field of possibleMessageFields) {
              if (data && typeof data[field] === 'string' && data[field].trim()) {
                messageText = data[field].trim();
                console.log(`✅ Found message text in ${field}:`, messageText);
                break;
              }
            }
            
            // Also check nested objects
            if (!messageText && data && typeof data === 'object') {
              for (const key of Object.keys(data)) {
                const value = data[key];
                if (value && typeof value === 'object') {
                  for (const field of possibleMessageFields) {
                    if (typeof value[field] === 'string' && value[field].trim()) {
                      messageText = value[field].trim();
                      console.log(`✅ Found nested message text in ${key}.${field}:`, messageText);
                      break;
                    }
                  }
                }
                if (messageText) break;
              }
            }
            
            // If we found a message, add it to the chat
            if (messageText) {
              console.log(`🎉 Processing assistant message from ${eventName}:`, messageText);
              const newMessage: TextMessage = {
                id: Date.now().toString(),
                text: messageText,
                sender: 'assistant',
                timestamp: new Date()
              };
              
              setMessages(prev => {
                console.log(`📝 Adding message from ${eventName}. Previous count:`, prev.length);
                const updated = [...prev, newMessage];
                console.log('📝 Updated count:', updated.length);
                return updated;
              });
              
              setIsLoading(false);
              setError(null);
              console.log(`🔄 Set loading to false from ${eventName} event`);
            }
          }
        });
        console.log(`✅ Successfully set up listener for: ${eventName}`);
      } catch (e) {
        console.log(`⚠️ Failed to set up listener for: ${eventName}`, e);
      }
    });
  }

  // Also try addEventListener if available (DOM-style events)
  if (typeof textInstance.addEventListener === 'function') {
    console.log('🎯 Setting up DOM-style event listeners...');
    const domEvents = ['message', 'response', 'text', 'data', 'update'];
    domEvents.forEach(eventName => {
      try {
        textInstance.addEventListener(eventName, (event: any) => {
          console.log(`🌐 DOM-style ${eventName.toUpperCase()} event:`, event);
          console.log(`🌐 Event detail:`, event.detail);
          console.log(`🌐 Event data:`, event.data);
        });
        console.log(`✅ DOM-style listener set up for: ${eventName}`);
      } catch (e) {
        console.log(`⚠️ Failed to set up DOM-style listener for: ${eventName}`, e);
      }
    });
  }

  // Try to inspect the prototype chain for hidden methods
  console.log('🔍 Prototype chain inspection:');
  let currentProto = textInstance;
  let protoLevel = 0;
  while (currentProto && protoLevel < 5) {
    console.log(`🔍 Prototype level ${protoLevel}:`, Object.getOwnPropertyNames(currentProto));
    currentProto = Object.getPrototypeOf(currentProto);
    protoLevel++;
  }

  // Check for any _events or similar internal event storage
  console.log('🔍 Internal event storage inspection:');
  const internalFields = ['_events', '_eventsCount', '_callbacks', '_listeners', 'events', 'listeners'];
  internalFields.forEach(field => {
    if (textInstance[field] !== undefined) {
      console.log(`🔍 ${field}:`, textInstance[field]);
    }
  });

  console.log('🎧 Comprehensive event listeners setup completed');
};
