
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

  const loadVapiScript = () => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.vapiSDK) {
        console.log('✅ Vapi SDK already loaded, reusing existing instance for TEXT');
        resolve(window.vapiSDK);
        return;
      }

      console.log('📡 Loading Vapi SDK script for TEXT...');
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      script.defer = true;
      script.async = true;

      script.onload = () => {
        console.log('✅ Vapi SDK loaded successfully for TEXT chat');
        resolve(window.vapiSDK);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Vapi SDK for TEXT chat');
        reject(new Error('Failed to load Vapi SDK'));
      };

      document.head.appendChild(script);
    });
  };

  console.log('🚀 Starting TEXT Vapi initialization...');
  await loadVapiScript();
  
  if (window.vapiSDK) {
    console.log('🔧 Initializing Vapi for TEXT chat with config:', {
      apiKey: apiKey ? '***' + apiKey.slice(-4) : 'missing',
      assistant: { id: assistantId },
      config: {
        show: false,
        type: "text",
      }
    });

    const textInstance = window.vapiSDK.run({
      apiKey: apiKey,
      assistant: { id: assistantId },
      config: {
        show: false,
        type: "text",
      },
    });

    // Log instance details safely
    console.log('📋 TEXT instance created');
    console.log('🔍 TEXT Instance type:', typeof textInstance);
    
    try {
      console.log('🔍 Available methods on TEXT instance:', Object.getOwnPropertyNames(textInstance));
      console.log('🔍 TEXT Instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));
    } catch (e) {
      console.log('⚠️ Could not inspect TEXT instance methods');
    }

    // Enhanced instance verification for TEXT
    console.log('🔧 TEXT Instance verification:');
    console.log('🔧 - Has .on method:', typeof textInstance.on === 'function');
    console.log('🔧 - Has .send method:', typeof textInstance.send === 'function');

    // Store in the TEXT-specific global variable
    window.vapiTextInstance = textInstance;
    console.log('✅ TEXT Vapi initialized successfully and stored in window.vapiTextInstance');
    
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
  } else {
    console.error('❌ window.vapiSDK is not available after loading for TEXT');
    throw new Error('Failed to initialize Vapi SDK for TEXT');
  }
};
