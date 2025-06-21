
export const initializeVapiText = async (assistantId: string, apiKey: string) => {
  // Filter out Facebook preload console messages with safe argument handling
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    try {
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object') return JSON.stringify(arg);
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
        console.log('✅ Vapi SDK already loaded, reusing existing instance');
        resolve(window.vapiSDK);
        return;
      }

      console.log('📡 Loading Vapi SDK script...');
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      script.defer = true;
      script.async = true;

      script.onload = () => {
        console.log('✅ Vapi SDK loaded successfully for text chat');
        resolve(window.vapiSDK);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Vapi SDK for text chat');
        reject(new Error('Failed to load Vapi SDK'));
      };

      document.head.appendChild(script);
    });
  };

  console.log('🚀 Starting text Vapi initialization...');
  await loadVapiScript();
  
  if (window.vapiSDK) {
    console.log('🔧 Initializing Vapi for text chat with config:', {
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
    console.log('📋 Text instance created');
    console.log('🔍 Instance type:', typeof textInstance);
    
    try {
      console.log('🔍 Available methods on instance:', Object.getOwnPropertyNames(textInstance));
      console.log('🔍 Instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));
    } catch (e) {
      console.log('⚠️ Could not inspect instance methods');
    }

    // Enhanced instance verification
    console.log('🔧 Instance verification:');
    console.log('🔧 - Has .on method:', typeof textInstance.on === 'function');
    console.log('🔧 - Has .send method:', typeof textInstance.send === 'function');

    // Store in a different global variable to avoid conflicts with voice instance
    window.vapiTextInstance = textInstance;
    console.log('✅ Text Vapi initialized successfully and stored in window.vapiTextInstance');
    
    // Simplified health check
    const healthCheck = () => {
      console.log('💓 Health check - vapiTextInstance exists:', !!window.vapiTextInstance);
      if (window.vapiTextInstance) {
        console.log('💓 Health check - has send method:', typeof window.vapiTextInstance.send === 'function');
        console.log('💓 Health check - has on method:', typeof window.vapiTextInstance.on === 'function');
      }
    };
    
    // Initial health check
    healthCheck();
    
    // Periodic health check every 30 seconds
    setInterval(healthCheck, 30000);

    return textInstance;
  } else {
    console.error('❌ window.vapiSDK is not available after loading');
    throw new Error('Failed to initialize Vapi SDK');
  }
};
