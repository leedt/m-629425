
import { TextMessage } from '@/types/textMessage';

export const setupVapiTextEvents = (
  textInstance: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // CATCH-ALL EVENT LISTENER - Fixed signature
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up catch-all event listener...');
    // Try different approaches for catch-all listener
    try {
      if (textInstance.on.length >= 2) {
        textInstance.on('*', (eventName: string, data: any) => {
          console.log('🎪 CATCH-ALL EVENT (*):', eventName, data);
        });
      } else {
        textInstance.on('*', (data: any) => {
          console.log('🎪 CATCH-ALL EVENT (*):', data);
        });
      }
    } catch (e) {
      console.log('⚠️ Catch-all with * failed, trying alternative approaches');
    }
  } else {
    console.warn('⚠️ textInstance.on is not a function, cannot set up catch-all listener');
  }

  // Set up specific event listeners with enhanced logging
  console.log('🎧 Setting up specific event listeners...');

  textInstance.on('message', (data: any) => {
    console.log('📨 MESSAGE EVENT received:', data);
    console.log('📨 Message event type:', typeof data, 'Keys:', Object.keys(data || {}));
    console.log('📨 Message data structure:', JSON.stringify(data, null, 2));
    
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
    console.log('📝 Transcript data structure:', JSON.stringify(data, null, 2));
    
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
    console.error('❌ Error data structure:', JSON.stringify(error, null, 2));
    setError(error.message || 'Failed to send message');
    setIsLoading(false);
    console.log('🔄 Set loading to false due to error');
  });

  // Try to set up additional potential event listeners
  const potentialEvents = ['response', 'text-response', 'chat-message', 'assistant-response', 'conversation-update', 'call-start', 'call-end'];
  potentialEvents.forEach(eventName => {
    try {
      textInstance.on(eventName, (data: any) => {
        console.log(`🎯 ${eventName.toUpperCase()} EVENT:`, data);
        console.log(`🎯 ${eventName.toUpperCase()} data structure:`, JSON.stringify(data, null, 2));
      });
      console.log(`✅ Successfully set up listener for: ${eventName}`);
    } catch (e) {
      console.log(`⚠️ Failed to set up listener for: ${eventName}`, e);
    }
  });
};
