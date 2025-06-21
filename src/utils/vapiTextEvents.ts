
import { TextMessage } from '@/types/textMessage';

export const setupVapiTextEvents = (
  textInstance: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  console.log('🎧 Setting up Vapi text event listeners...');
  
  // Check if it's an EventEmitter-like object
  console.log('🔍 EventEmitter-like methods:');
  console.log('🔍 - on:', typeof textInstance.on);
  console.log('🔍 - emit:', typeof textInstance.emit);

  // Try to intercept ALL possible events
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up event listeners...');
    
    // Focus on the most likely event names that Vapi actually uses
    const priorityEvents = [
      'message', 'response', 'text', 'chat', 'reply', 'answer',
      'assistant-message', 'text-message', 'conversation-update',
      'transcript', 'model-output', 'stream', 'data'
    ];

    // Set up listeners for priority events
    priorityEvents.forEach(eventName => {
      try {
        textInstance.on(eventName, (...args: any[]) => {
          console.log(`🎪 ${eventName.toUpperCase()} EVENT RECEIVED:`, args);
          
          if (args.length > 0) {
            const data = args[0];
            console.log(`🎪 ${eventName.toUpperCase()} data:`, data);
            
            // Try to extract message content from any event
            const possibleMessageFields = [
              'message', 'text', 'content', 'response', 'transcript', 
              'reply', 'answer', 'completion', 'output', 'result'
            ];
            
            let messageText = null;
            
            // Check direct fields
            for (const field of possibleMessageFields) {
              if (data && typeof data[field] === 'string' && data[field].trim()) {
                messageText = data[field].trim();
                console.log(`✅ Found message text in ${field}:`, messageText);
                break;
              }
            }
            
            // Check nested objects if no direct message found
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

    // Set up error event listener
    try {
      textInstance.on('error', (error: any) => {
        console.error('🚨 Vapi error event:', error);
        setError(error.message || 'An error occurred');
        setIsLoading(false);
      });
      console.log('✅ Error event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up error listener:', e);
    }
  }

  console.log('🎧 Event listeners setup completed');
};
