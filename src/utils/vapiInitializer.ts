
import { VapiConfig } from '@/types/textMessage';
import { VapiManager } from './vapiManager';

export const initializeVapiInstance = async (config: VapiConfig): Promise<any> => {
  return await VapiManager.createTextInstance(config);
};

export const startVapiConversation = async (vapiInstance: any, assistantId: string) => {
  console.log('🚀 Starting text conversation...');
  
  try {
    // For text mode, send an initial message to start the conversation
    if (vapiInstance.send) {
      await vapiInstance.send({
        type: 'conversation-start',
        assistant: assistantId
      });
      console.log('✅ Text conversation initiated via send');
    } else if (vapiInstance.startConversation) {
      await vapiInstance.startConversation();
      console.log('✅ Text conversation started');
    } else {
      console.log('📝 Text instance ready, waiting for first message');
    }
  } catch (err: any) {
    console.log('Could not start conversation automatically:', err.message);
    console.log('📝 Text instance ready, waiting for first message');
  }
};
