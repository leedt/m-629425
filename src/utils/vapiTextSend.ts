
import { TextMessage } from '@/types/textMessage';

export const sendVapiTextMessage = async (
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  console.log('📤 sendMessage called with:', text.trim());
  
  if (!text.trim()) {
    console.log('⚠️ Empty message, not sending');
    return;
  }

  console.log('🔍 Checking vapiTextInstance availability...');
  console.log('🔍 window.vapiTextInstance exists:', !!window.vapiTextInstance);
  
  if (!window.vapiTextInstance) {
    console.error('❌ Text Vapi instance not available');
    setError('Text messaging not initialized');
    return;
  }

  // Check if sendTextMessage method exists
  const hasSendMethod = typeof window.vapiTextInstance.sendTextMessage === 'function';
  console.log('🔍 SendTextMessage method available:', hasSendMethod);
  
  if (!hasSendMethod) {
    console.error('❌ SendTextMessage method not available on instance');
    setError('Text messaging method not available');
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
    console.log('📡 Attempting to send text message via Vapi Web SDK...');
    
    const startTime = Date.now();
    const result = await window.vapiTextInstance.sendTextMessage(text.trim());
    const endTime = Date.now();
    
    console.log('✅ Text message sent successfully in', endTime - startTime, 'ms');
    console.log('✅ Message result:', result);
    
    // The response should come through the event listeners
    // The loading state will be set to false in the event handler
    
  } catch (err: any) {
    console.error('❌ Failed to send text message:', err);
    console.error('❌ Error type:', typeof err);
    console.error('❌ Error message:', err.message);
    setError(err.message || 'Failed to send message');
    setIsLoading(false);
    console.log('🔄 Set loading to false due to send error');
  }
};
