
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
  console.log('📨 Received text message:', message);
  
  // Handle conversation updates with assistant messages
  if (message.type === 'conversation-update' && message.conversation?.messages) {
    const lastMessage = message.conversation.messages[message.conversation.messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
      const assistantMessage = createAssistantMessage(lastMessage.content);
      
      setMessages(prev => {
        const exists = isDuplicateMessage(prev, assistantMessage);
        return exists ? prev : [...prev, assistantMessage];
      });
      setIsLoading(false);
    }
  }

  // Handle direct assistant messages
  if (message.type === 'message' && message.role === 'assistant' && message.content) {
    const assistantMessage = createAssistantMessage(message.content);
    setMessages(prev => {
      const exists = isDuplicateMessage(prev, assistantMessage);
      return exists ? prev : [...prev, assistantMessage];
    });
    setIsLoading(false);
  }

  // Handle transcript updates (real-time conversation)
  if (message.type === 'transcript' && message.transcript?.messages) {
    const messages = message.transcript.messages;
    const lastAssistantMessage = messages.filter((m: any) => m.role === 'assistant').pop();
    
    if (lastAssistantMessage && lastAssistantMessage.content) {
      const assistantMessage = createAssistantMessage(lastAssistantMessage.content);
      setMessages(prev => {
        const exists = isDuplicateMessage(prev, assistantMessage);
        return exists ? prev : [...prev, assistantMessage];
      });
      setIsLoading(false);
    }
  }

  // Handle speech events for text mode (these indicate thinking/processing)
  if (message.type === 'speech-update') {
    if (message.status === 'started') {
      console.log('🤖 Assistant is thinking...');
      setIsLoading(true);
    } else if (message.status === 'stopped') {
      console.log('🤖 Assistant finished thinking');
      setIsLoading(false);
    }
  }

  // Handle function call responses
  if (message.type === 'function-call' && message.result) {
    console.log('🔧 Function call result:', message.result);
    setIsLoading(false);
  }

  // Handle status updates
  if (message.type === 'status-update') {
    if (message.status === 'ended') {
      console.log('📞 Conversation ended:', message.endedReason);
      setIsLoading(false);
    }
  }

  // Handle errors
  if (message.type === 'error' || message.action === 'error') {
    console.error('❌ VAPI error in text mode:', message);
    setIsLoading(false);
  }
};

export const sendVapiMessage = async (vapiInstance: any, text: string): Promise<void> => {
  console.log('📤 Sending text message:', text);
  
  try {
    if (vapiInstance.send) {
      await vapiInstance.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: text
        }
      });
    } else if (vapiInstance.sendMessage) {
      await vapiInstance.sendMessage(text);
    } else if (vapiInstance.say) {
      await vapiInstance.say(text);
    } else {
      throw new Error('No send method available on VAPI instance');
    }

    console.log('✅ Message sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
};
