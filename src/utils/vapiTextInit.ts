
export const initializeVapiText = async (assistantId: string, apiKey: string) => {
  // Filter out Facebook preload console messages with safe argument handling
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    try {
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      if (!message.includes('facebook') && !message.includes('preload')) {
        originalConsoleLog.apply(console, args);
      }
    } catch (e) {
      // If logging fails, use original console
      originalConsoleLog.apply(console, args);
    }
  };

  console.log('🚀 Starting TEXT Vapi initialization using Web SDK...');
  
  // Load the Vapi Web SDK for text interactions
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.async = true;
    
    script.onload = () => {
      console.log('📦 Vapi Web SDK loaded for text');
      
      try {
        // Initialize Vapi for text-only mode
        const textInstance = window.Vapi(apiKey, assistantId, {
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: 'en'
          },
          voice: {
            provider: 'playht',
            voiceId: 'jennifer'
          },
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are Morgan, a helpful virtual real estate agent for ACME Realty. Keep responses concise and friendly.'
              }
            ]
          },
          // Configure for text-only interaction
          firstMessage: 'Hello! How can I help you today?',
          recordingEnabled: false,
          silenceTimeoutSeconds: 30,
          responseDelaySeconds: 1
        });

        // Add text-specific methods
        textInstance.sendTextMessage = async (message) => {
          console.log('📤 Sending text message:', message);
          
          // Use the assistant's chat functionality
          return new Promise((resolve, reject) => {
            // Set up one-time listeners for this message
            const responseHandler = (response) => {
              console.log('📥 Received text response:', response);
              textInstance.off('message', responseHandler);
              textInstance.off('error', errorHandler);
              resolve(response);
            };
            
            const errorHandler = (error) => {
              console.error('❌ Text message error:', error);
              textInstance.off('message', responseHandler);
              textInstance.off('error', errorHandler);
              reject(error);
            };
            
            textInstance.on('message', responseHandler);
            textInstance.on('error', errorHandler);
            
            // Send the message
            textInstance.send({
              type: 'add-message',
              message: {
                role: 'user',
                content: message
              }
            });
          });
        };

        // Store in the TEXT-specific global variable
        window.vapiTextInstance = textInstance;
        console.log('✅ TEXT Vapi initialized successfully using Web SDK');
        resolve(textInstance);
        
      } catch (error) {
        console.error('❌ Failed to initialize Vapi text instance:', error);
        reject(error);
      }
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Vapi Web SDK');
      reject(new Error('Failed to load Vapi Web SDK'));
    };
    
    document.head.appendChild(script);
  });
};
