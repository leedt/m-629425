
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

  console.log('🚀 Starting TEXT Vapi initialization using REST API...');
  
  // For text interactions, we don't need to load a script
  // We'll use the Vapi REST API directly
  const textInstance = {
    apiKey: apiKey,
    assistantId: assistantId,
    baseUrl: 'https://api.vapi.ai',
    
    // Method to send text messages via REST API
    send: async (message: string) => {
      console.log('📡 Sending text message via Vapi REST API:', message);
      
      try {
        const response = await fetch(`${textInstance.baseUrl}/call`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistant: assistantId,
            customer: {
              number: 'text-chat-user',
            },
            type: 'inbound',
            assistantOverrides: {
              model: {
                messages: [
                  {
                    role: 'user',
                    content: message
                  }
                ]
              }
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Text API response:', data);
        return data;
      } catch (error) {
        console.error('❌ Text API error:', error);
        throw error;
      }
    },

    // Event emitter-like interface for compatibility
    eventHandlers: new Map(),
    
    on: function(event: string, handler: Function) {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, []);
      }
      this.eventHandlers.get(event).push(handler);
      console.log(`✅ Event listener registered for: ${event}`);
    },

    emit: function(event: string, data: any) {
      const handlers = this.eventHandlers.get(event) || [];
      handlers.forEach((handler: Function) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in event handler for ${event}:`, error);
        }
      });
    }
  };

  // Store in the TEXT-specific global variable
  window.vapiTextInstance = textInstance;
  console.log('✅ TEXT Vapi initialized successfully using REST API');
  
  // Simplified health check for TEXT
  const healthCheck = () => {
    console.log('💓 TEXT Health check - vapiTextInstance exists:', !!window.vapiTextInstance);
    if (window.vapiTextInstance) {
      console.log('💓 TEXT Health check - has send method:', typeof window.vapiTextInstance.send === 'function');
      console.log('💓 TEXT Health check - has on method:', typeof window.vapiTextInstance.on === 'function');
    }
  };
  
  // Initial health check
  healthCheck();
  
  // Periodic health check every 30 seconds
  setInterval(healthCheck, 30000);

  return textInstance;
};
