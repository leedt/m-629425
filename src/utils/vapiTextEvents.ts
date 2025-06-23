
import { TextMessage } from '@/types/textMessage';

export const setupVapiTextEvents = (
  textInstance: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  console.log('🎧 Setting up Vapi text event listeners for REST API...');
  
  // Since we're using REST API instead of WebSocket, we don't have real-time events
  // We'll set up the event handlers for compatibility but they won't be used in the same way
  
  if (typeof textInstance.on === 'function') {
    console.log('🎯 Setting up event listeners for REST API compatibility...');
    
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

    // Set up response event listener (for future webhook integration)
    try {
      textInstance.on('response', (response: any) => {
        console.log('🎪 Response event received:', response);
        
        if (response && response.message) {
          const newMessage: TextMessage = {
            id: Date.now().toString(),
            text: response.message,
            sender: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);
          setError(null);
        }
      });
      console.log('✅ Response event listener set up');
    } catch (e) {
      console.log('⚠️ Failed to set up response listener:', e);
    }
  }

  console.log('🎧 Event listeners setup completed for REST API mode');
};
