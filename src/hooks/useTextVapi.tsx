
import { useState, useEffect, useCallback } from 'react';
import { TextMessage } from '@/types/textMessage';
import { initializeVapiText } from '@/utils/vapiTextInit';
import { setupVapiTextEvents } from '@/utils/vapiTextEvents';
import { sendVapiTextMessage } from '@/utils/vapiTextSend';

export { TextMessage } from '@/types/textMessage';

export const useTextVapi = () => {
  const [messages, setMessages] = useState<TextMessage[]>([
    {
      id: '1',
      text: "Hello! I'm Morgan, your ACME Realty virtual agent. What's your name?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const initializeTextVapi = async () => {
      try {
        const textInstance = await initializeVapiText(assistantId, apiKey);
        setupVapiTextEvents(textInstance, setMessages, setIsLoading, setError);
      } catch (error) {
        console.error('❌ Failed to initialize text Vapi:', error);
        setError('Failed to initialize text messaging');
      }
    };

    initializeTextVapi();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    await sendVapiTextMessage(text, setMessages, setIsLoading, setError);
  }, []);

  // Enhanced state change logging
  useEffect(() => {
    console.log('📊 Messages state changed, count:', messages.length);
    console.log('📊 Current messages:', messages.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text.substring(0, 50) + (m.text.length > 50 ? '...' : '')
    })));
  }, [messages]);

  useEffect(() => {
    console.log('⏳ Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('❌ Error state changed:', error);
  }, [error]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
