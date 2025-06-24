
import { VapiConfig } from '@/types/textMessage';

export const initializeVapiInstance = (config: VapiConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const maxRetries = 30;
    
    const attemptInitialization = () => {
      console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK || window.vapiSDK;
      
      if (VapiConstructor) {
        console.log('✅ VAPI constructor found, creating text instance...');
        
        try {
          let textInstance;
          
          // Create a text-only instance using the constructor
          if (typeof VapiConstructor === 'function') {
            textInstance = new VapiConstructor(config.apiKey);
          } else if (VapiConstructor.run) {
            // Use run method with proper text configuration
            textInstance = VapiConstructor.run({
              apiKey: config.apiKey,
              assistant: config.assistantId,
              config: { 
                mode: 'text-only',
                show: false,
                position: 'bottom-right'
              }
            });
          } else {
            throw new Error('Unknown VAPI constructor type');
          }
          
          window.vapiTextInstance = textInstance;
          console.log('✅ Text VAPI initialized successfully');
          resolve(textInstance);
          
        } catch (error: any) {
          console.error('❌ Failed to initialize text VAPI:', error);
          reject(new Error(`Failed to initialize: ${error.message}`));
        }
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('❌ VAPI SDK failed to load after maximum retries');
          reject(new Error('Text messaging unavailable. The VAPI SDK could not be loaded.'));
          return;
        }
        
        console.log(`🔄 VAPI constructor not ready yet, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(attemptInitialization, 200);
      }
    };

    setTimeout(attemptInitialization, 1000);
  });
};

export const startVapiConversation = async (vapiInstance: any, assistantId: string) => {
  console.log('🚀 Starting text conversation...');
  
  // For text mode, we don't need to start a call, just set up the conversation
  if (vapiInstance.startConversation) {
    try {
      await vapiInstance.startConversation();
      console.log('✅ Text conversation started');
    } catch (err: any) {
      console.log('Could not start conversation with startConversation:', err);
    }
  } else if (vapiInstance.send) {
    // Send an initial message to start the conversation
    try {
      await vapiInstance.send({
        type: 'conversation-start',
        assistant: assistantId
      });
      console.log('✅ Text conversation initiated via send');
    } catch (err: any) {
      console.log('Could not start conversation via send:', err);
    }
  }
};
