
export const initializeVapiText = async (assistantId: string, apiKey: string) => {
  // Filter out Facebook preload console messages
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (!message.includes('facebook') && !message.includes('preload')) {
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

    // Log instance details
    console.log('📋 Text instance created:', textInstance);
    console.log('🔍 Available methods on instance:', Object.getOwnPropertyNames(textInstance));
    console.log('🔍 Instance prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(textInstance)));

    // Enhanced instance verification
    console.log('🔧 Instance verification:');
    console.log('🔧 - Instance type:', typeof textInstance);
    console.log('🔧 - Has .on method:', typeof textInstance.on === 'function');
    console.log('🔧 - Has .send method:', typeof textInstance.send === 'function');

    // Store in a different global variable to avoid conflicts with voice instance
    window.vapiTextInstance = textInstance;
    console.log('✅ Text Vapi initialized successfully and stored in window.vapiTextInstance');
    
    // Enhanced health check
    const healthCheck = () => {
      console.log('💓 Health check - vapiTextInstance exists:', !!window.vapiTextInstance);
      if (window.vapiTextInstance) {
        console.log('💓 Health check - instance type:', typeof window.vapiTextInstance);
        console.log('💓 Health check - has send method:', typeof window.vapiTextInstance.send === 'function');
        console.log('💓 Health check - has on method:', typeof window.vapiTextInstance.on === 'function');
      }
    };
    
    // Initial health check
    healthCheck();
    
    // Periodic health check
    setInterval(healthCheck, 30000); // Every 30 seconds

    return textInstance;
  } else {
    console.error('❌ window.vapiSDK is not available after loading');
    throw new Error('Failed to initialize Vapi SDK');
  }
};
