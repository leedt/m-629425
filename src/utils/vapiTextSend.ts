
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
  console.log('🔍 window.vapiTextInstance type:', typeof window.vapiTextInstance);
  
  if (window.vapiTextInstance) {
    console.log('🔍 Available methods on vapiTextInstance:', Object.getOwnPropertyNames(window.vapiTextInstance));
    console.log('🔍 send method exists:', typeof window.vapiTextInstance.send);
    console.log('🔍 send method type:', typeof window.vapiTextInstance.send);
  }

  if (!window.vapiTextInstance) {
    console.error('❌ Text Vapi instance not available');
    setError('Text messaging not initialized');
    return;
  }

  // Check if send method exists
  const hasSendMethod = typeof window.vapiTextInstance.send === 'function';
  console.log('🔍 Send method available:', hasSendMethod);
  
  if (!hasSendMethod) {
    console.error('❌ Send method not available on instance');
    setError('Send method not available');
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
    console.log('📡 Send method details:', {
      type: typeof window.vapiTextInstance.send,
      isFunction: typeof window.vapiTextInstance.send === 'function'
    });
    
    const startTime = Date.now();
    const result = await window.vapiTextInstance.send(text.trim());
    const endTime = Date.now();
    
    console.log('✅ Message sent successfully in', endTime - startTime, 'ms');
    console.log('✅ Send result:', result);
    console.log('✅ Send result type:', typeof result);
    
    if (result && typeof result === 'object') {
      console.log('✅ Send result keys:', Object.keys(result));
      console.log('✅ Send result structure:', JSON.stringify(result, null, 2));
    }
    
  } catch (err: any) {
    console.error('❌ Failed to send text message:', err);
    console.error('❌ Error type:', typeof err);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Full error object:', JSON.stringify(err, null, 2));
    setError(err.message || 'Failed to send message');
    setIsLoading(false);
    console.log('🔄 Set loading to false due to send error');
  }
};
