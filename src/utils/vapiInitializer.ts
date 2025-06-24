
import { VapiConfig } from '@/types/textMessage';

export const initializeVapiInstance = (config: VapiConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const maxRetries = 30;
    
    const attemptInitialization = () => {
      console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
      console.log('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('vapi')));
      
      const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK || window.vapiSDK;
      
      console.log('VapiConstructor found:', !!VapiConstructor, typeof VapiConstructor);
      
      if (VapiConstructor) {
        console.log('✅ VAPI constructor found, creating text instance...');
        
        try {
          let textInstance;
          
          if (typeof VapiConstructor === 'function') {
            textInstance = new VapiConstructor(config.apiKey);
          } else if (VapiConstructor.run) {
            textInstance = VapiConstructor.run({
              apiKey: config.apiKey,
              assistant: {
                id: config.assistantId
              },
              config: { 
                mode: 'text',
                show: false 
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
  if (vapiInstance.start) {
    try {
      await vapiInstance.start(assistantId);
    } catch (err: any) {
      console.log('Could not auto-start conversation, trying alternative method:', err);
      if (vapiInstance.startCall) {
        try {
          await vapiInstance.startCall({ assistant: assistantId });
        } catch (err2: any) {
          console.log('Alternative start method also failed:', err2);
        }
      }
    }
  }
};
