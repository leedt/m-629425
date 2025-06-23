
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
    console.log('📡 Attempting to send message via Vapi REST API...');
    
    const startTime = Date.now();
    const result = await window.vapiTextInstance.send(text.trim());
    const endTime = Date.now();
    
    console.log('✅ Message sent successfully in', endTime - startTime, 'ms');
    console.log('✅ API result:', result);
    
    // For now, simulate a response since we're using the call API
    // In a real implementation, you'd need to poll for the call status or use webhooks
    setTimeout(() => {
      const assistantMessage: TextMessage = {
        id: (Date.now() + 1).toString(),
        text: "I received your message and I'm processing it. This is a simulated response using the Vapi REST API.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      console.log('🔄 Set loading to false after simulated response');
    }, 2000);
    
  } catch (err: any) {
    console.error('❌ Failed to send text message:', err);
    console.error('❌ Error type:', typeof err);
    console.error('❌ Error message:', err.message);
    setError(err.message || 'Failed to send message');
    setIsLoading(false);
    console.log('🔄 Set loading to false due to send error');
  }
};
