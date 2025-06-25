
export interface VapiManagerConfig {
  assistantId: string;
  apiKey: string;
}

export class VapiManager {
  private static isScriptLoaded = false;
  private static scriptLoadPromise: Promise<void> | null = null;
  
  // Remove singleton pattern - use separate static methods instead
  
  static async ensureScriptLoaded(): Promise<void> {
    if (this.isScriptLoaded && this.getVapiConstructor()) {
      console.log('📦 VAPI script already loaded and available');
      return;
    }

    // Return existing promise if script is currently loading
    if (this.scriptLoadPromise) {
      console.log('📦 VAPI script already loading, waiting...');
      return this.scriptLoadPromise;
    }

    console.log('📦 Starting VAPI script load...');
    
    this.scriptLoadPromise = new Promise((resolve, reject) => {
      // Clean up any existing failed scripts
      const existingScripts = document.querySelectorAll('script[src*="vapi"]');
      existingScripts.forEach(script => {
        console.log('🧹 Removing existing VAPI script');
        script.remove();
      });

      console.log('📦 Loading fresh VAPI script...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
      script.async = true;
      
      script.onload = () => {
        console.log('📦 VAPI script loaded successfully');
        this.waitForVapi(resolve, reject);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load VAPI script');
        this.scriptLoadPromise = null; // Reset so we can try again
        reject(new Error('Failed to load VAPI script'));
      };
      
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  private static waitForVapi(resolve: () => void, reject: (error: Error) => void): void {
    let retryCount = 0;
    const maxRetries = 50;
    
    const checkVapi = () => {
      console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const VapiConstructor = this.getVapiConstructor();
      
      if (VapiConstructor) {
        console.log('✅ VAPI SDK found and ready');
        this.isScriptLoaded = true;
        this.scriptLoadPromise = null; // Reset promise
        resolve();
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('❌ VAPI SDK failed to load after maximum retries');
          this.scriptLoadPromise = null; // Reset so we can try again
          reject(new Error('VAPI SDK not available after maximum retries'));
          return;
        }
        
        setTimeout(checkVapi, 100);
      }
    };

    setTimeout(checkVapi, 100);
  }

  private static getVapiConstructor(): any {
    return (
      (window as any).Vapi || 
      (window as any).VapiSDK || 
      (window as any).vapiSDK?.Vapi ||
      (window as any).VAPI ||
      null
    );
  }

  static async createVoiceInstance(config: VapiManagerConfig): Promise<any> {
    console.log('🎙️ Creating VOICE instance with config:', config);
    
    await this.ensureScriptLoaded();
    
    const VapiConstructor = this.getVapiConstructor();
    
    if (!VapiConstructor) {
      throw new Error('VAPI constructor not available for voice instance');
    }

    console.log('🎙️ VAPI Constructor available, creating voice instance...');
    
    let voiceInstance;
    
    if (typeof VapiConstructor === 'function') {
      voiceInstance = new VapiConstructor(config.apiKey);
      console.log('✅ Voice instance created with constructor');
    } else if (VapiConstructor.create) {
      voiceInstance = VapiConstructor.create({
        apiKey: config.apiKey,
        assistant: config.assistantId
      });
      console.log('✅ Voice instance created with create method');
    } else {
      throw new Error('No valid VAPI initialization method found for voice');
    }
    
    // Store on window for debugging
    (window as any).vapiVoiceInstance = voiceInstance;
    console.log('🎙️ Voice instance stored on window.vapiVoiceInstance');
    
    return voiceInstance;
  }

  static async createTextInstance(config: VapiManagerConfig): Promise<any> {
    console.log('🔤 Creating TEXT instance with config:', config);
    
    await this.ensureScriptLoaded();
    
    const VapiConstructor = this.getVapiConstructor();
    
    if (!VapiConstructor) {
      throw new Error('VAPI constructor not available for text instance');
    }

    console.log('🔤 VAPI Constructor available, creating text instance...');
    
    let textInstance;
    
    if (typeof VapiConstructor === 'function') {
      textInstance = new VapiConstructor(config.apiKey);
      console.log('✅ Text instance created with constructor');
    } else if (VapiConstructor.create) {
      textInstance = VapiConstructor.create({
        apiKey: config.apiKey,
        mode: 'text'
      });
      console.log('✅ Text instance created with create method');
    } else {
      throw new Error('No valid VAPI initialization method found for text');
    }
    
    // Store on window for debugging
    (window as any).vapiTextInstance = textInstance;
    console.log('🔤 Text instance stored on window.vapiTextInstance');
    
    return textInstance;
  }

  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      return true;
    } catch (error) {
      console.warn('❌ Microphone permission denied:', error);
      return false;
    }
  }
}
