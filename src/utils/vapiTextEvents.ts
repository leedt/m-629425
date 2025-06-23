
import { TextMessage } from '@/types/textMessage';

export const setupVapiTextEvents = (
  textInstance: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  console.log('🎧 Setting up Vapi text event listeners for Web SDK...');
  
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up Web SDK event listeners...');
    
    // Set up message event listener for text responses
    try {
      textInstance.on('message', (message: any) => {
        console.log('📥 Message event received:', message);
        
        if (message && message.content) {
          const newMessage: TextMessage = {
            id: Date.now().toString(),
            text: message.content,
            sender: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);
          setError(null);
          console.log('✅ Added assistant message to state');
        }
      });
      console.log('✅ Message event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up message listener:', e);
    }

    // Set up error event listener
    try {
      textInstance.on('error', (error: any) => {
        console.error('🚨 Vapi text error event:', error);
        setError(error.message || 'An error occurred');
        setIsLoading(false);
      });
      console.log('✅ Error event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up error listener:', e);
    }

    // Set up speech-start event (for when assistant starts responding)
    try {
      textInstance.on('speech-start', () => {
        console.log('🎪 Assistant started responding');
        setIsLoading(false);
      });
      console.log('✅ Speech-start event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up speech-start listener:', e);
    }

    // Set up call-start event
    try {
      textInstance.on('call-start', () => {
        console.log('🎪 Text session started');
        setError(null);
      });
      console.log('✅ Call-start event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up call-start listener:', e);
    }

    // Set up call-end event
    try {
      textInstance.on('call-end', () => {
        console.log('🎪 Text session ended');
        setIsLoading(false);
      });
      console.log('✅ Call-end event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up call-end listener:', e);
    }
  }

  console.log('🎧 Event listeners setup completed for Web SDK text mode');
};
