
import { TextMessage } from '@/types/textMessage';

export const createAssistantMessage = (content: string): TextMessage => ({
  id: `assistant-${Date.now()}`,
  text: content,
  sender: 'assistant',
  timestamp: new Date()
});

export const createUserMessage = (content: string): TextMessage => ({
  id: `user-${Date.now()}`,
  text: content,
  sender: 'user',
  timestamp: new Date()
});

export const isDuplicateMessage = (messages: TextMessage[], newMessage: TextMessage): boolean => {
  return messages.some(m => 
    m.text === newMessage.text && 
    m.sender === newMessage.sender &&
    Math.abs(m.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000
  );
};

export const handleVapiMessage = (
  message: any,
  setMessages: React.Dispatch<React.SetStateAction<TextMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log('📨 Processing VAPI message:', JSON.stringify(message, null, 2));
  
  // Handle different message types from VAPI
  let assistantContent = null;

  // Check for assistant message in various formats
  if (message.type === 'conversation-update' && message.conversation?.messages) {
    const lastMessage = message.conversation.messages[message.conversation.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
      assistantContent = lastMessage.content;
    }
  } else if (message.role === 'assistant' && message.content) {
    assistantContent = message.content;
  } else if (message.type === 'transcript' && message.transcript?.messages) {
    const messages = message.transcript.messages;
    const lastAssistantMessage = messages.filter((m: any) => m.role === 'assistant').pop();
    if (lastAssistantMessage && lastAssistantMessage.content) {
      assistantContent = lastAssistantMessage.content;
    }
  } else if (message.message && typeof message.message === 'string') {
    assistantContent = message.message;
  } else if (typeof message === 'string') {
    assistantContent = message;
  }

  if (assistantContent) {
    console.log('✅ Found assistant content:', assistantContent);
    const assistantMessage = createAssistantMessage(assistantContent);
    
    setMessages(prev => {
      const exists = isDuplicateMessage(prev, assistantMessage);
      if (exists) {
        console.log('🔄 Duplicate message detected, skipping');
        return prev;
      }
      console.log('➕ Adding new assistant message');
      return [...prev, assistantMessage];
    });
    setIsLoading(false);
    return;
  }

  // Handle loading states
  if (message.type === 'speech-update') {
    if (message.status === 'started') {
      console.log('🤖 Assistant is thinking...');
      setIsLoading(true);
    } else if (message.status === 'stopped') {
      console.log('🤖 Assistant finished thinking');
      setIsLoading(false);
    }
  }

  // Handle errors
  if (message.type === 'error' || message.error) {
    console.error('❌ VAPI error:', message);
    setIsLoading(false);
  }

  // Handle status updates
  if (message.type === 'status-update') {
    console.log('📊 Status update:', message);
    if (message.status === 'ended') {
      setIsLoading(false);
    }
  }
};

export const sendVapiMessage = async (vapiInstance: any, text: string): Promise<void> => {
  console.log('📤 Attempting to send message:', text);
  console.log('📤 VAPI instance methods:', Object.getOwnPropertyNames(vapiInstance));
  
  try {
    // Try different methods to send the message
    if (vapiInstance.send) {
      console.log('📤 Using .send() method');
      await vapiInstance.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: text
        }
      });
    } else if (vapiInstance.sendMessage) {
      console.log('📤 Using .sendMessage() method');
      await vapiInstance.sendMessage(text);
    } else if (vapiInstance.say) {
      console.log('📤 Using .say() method');
      await vapiInstance.say(text);
    } else {
      console.error('❌ No available send methods on VAPI instance');
      console.log('Available methods:', Object.getOwnPropertyNames(vapiInstance).filter(prop => typeof vapiInstance[prop] === 'function'));
      throw new Error('No send method available on VAPI instance');
    }

    console.log('✅ Message sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
};
