
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
  
  // Handle conversation updates
  if (message.type === 'conversation-update' && message.conversation?.messages) {
    const lastMessage = message.conversation.messages[message.conversation.messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
      const assistantMessage = createAssistantMessage(lastMessage.content);
      
      setMessages(prev => {
        const exists = isDuplicateMessage(prev, assistantMessage);
        return exists ? prev : [...prev, assistantMessage];
      });
    }
  }

  // Handle speech events for text mode
  if (message.type === 'speech-start') {
    console.log('🎤 Assistant is thinking...');
    setIsLoading(true);
  }

  if (message.type === 'speech-end') {
    console.log('🎤 Assistant finished');
    setIsLoading(false);
  }

  // Handle transcript for real-time responses
  if (message.type === 'transcript' && message.transcript?.transcript) {
    const assistantMessage = createAssistantMessage(message.transcript.transcript);
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }
};

export const sendVapiMessage = async (vapiInstance: any, text: string): Promise<void> => {
  console.log('📤 Sending text message:', text);
  
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
  } else {
    throw new Error('No send method available on VAPI instance');
  }

  console.log('✅ Message sent successfully');
};
