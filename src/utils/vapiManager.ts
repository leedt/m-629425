
export interface VapiManagerConfig {
  assistantId: string;
  apiKey: string;
}

export class VapiManager {
  private static instance: VapiManager;
  private textInstance: any = null;
  private voiceInstance: any = null;
  private config: VapiManagerConfig;
  private isScriptLoaded = false;

  private constructor(config: VapiManagerConfig) {
    this.config = config;
  }

  static getInstance(config: VapiManagerConfig): VapiManager {
    if (!VapiManager.instance) {
      VapiManager.instance = new VapiManager(config);
    }
    return VapiManager.instance;
  }

  async ensureScriptLoaded(): Promise<void> {
    if (this.isScriptLoaded && this.getVapiConstructor()) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Check if script is already in DOM
      const existingScript = document.querySelector('script[src*="vapi"]');
      if (!existingScript) {
        console.log('📦 VAPI script not found, loading...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
        script.async = true;
        script.onload = () => {
          console.log('📦 VAPI script loaded');
          this.waitForVapi(resolve, reject);
        };
        script.onerror = () => {
          console.error('❌ Failed to load VAPI script');
          reject(new Error('Failed to load VAPI script'));
        };
        document.head.appendChild(script);
      } else {
        console.log('📦 VAPI script already in DOM, waiting for SDK...');
        this.waitForVapi(resolve, reject);
      }
    });
  }

  private waitForVapi(resolve: () => void, reject: (error: Error) => void): void {
    let retryCount = 0;
    const maxRetries = 50;
    
    const checkVapi = () => {
      console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const VapiConstructor = this.getVapiConstructor();
      
      if (VapiConstructor) {
        console.log('✅ VAPI SDK found:', typeof VapiConstructor);
        this.isScriptLoaded = true;
        resolve();
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('❌ VAPI SDK failed to load after maximum retries');
          console.log('Available on window:', Object.keys(window).filter(key => key.toLowerCase().includes('vapi')));
          reject(new Error('VAPI SDK could not be loaded'));
          return;
        }
        
        setTimeout(checkVapi, 100);
      }
    };

    // Start checking immediately
    checkVapi();
  }

  private getVapiConstructor(): any {
    // Try different possible locations for the VAPI constructor
    return (
      (window as any).Vapi || 
      (window as any).VapiSDK || 
      (window as any).vapiSDK?.Vapi ||
      (window as any).VAPI ||
      null
    );
  }

  async getTextInstance(): Promise<any> {
    if (this.textInstance) {
      return this.textInstance;
    }

    await this.ensureScriptLoaded();
    
    try {
      console.log('🔤 Creating text-only VAPI instance...');
      
      const VapiConstructor = this.getVapiConstructor();
      
      if (!VapiConstructor) {
        throw new Error('VAPI constructor not found');
      }

      console.log('🔤 VAPI Constructor type:', typeof VapiConstructor);
      
      // Try different initialization methods
      if (typeof VapiConstructor === 'function') {
        this.textInstance = new VapiConstructor(this.config.apiKey);
        console.log('✅ Text instance created with constructor');
      } else if (VapiConstructor.create) {
        this.textInstance = VapiConstructor.create({
          apiKey: this.config.apiKey,
          mode: 'text'
        });
        console.log('✅ Text instance created with create method');
      } else {
        throw new Error('No valid VAPI initialization method found');
      }
      
      return this.textInstance;
      
    } catch (error: any) {
      console.error('❌ Failed to create text VAPI instance:', error);
      throw error;
    }
  }

  async getVoiceInstance(): Promise<any> {
    if (this.voiceInstance) {
      return this.voiceInstance;
    }

    await this.ensureScriptLoaded();
    
    try {
      console.log('🎙️ Creating voice VAPI instance...');
      
      const VapiConstructor = this.getVapiConstructor();
      
      if (!VapiConstructor) {
        throw new Error('VAPI constructor not found');
      }

      console.log('🎙️ VAPI Constructor type:', typeof VapiConstructor);
      
      // Try different initialization methods
      if (typeof VapiConstructor === 'function') {
        this.voiceInstance = new VapiConstructor(this.config.apiKey);
        console.log('✅ Voice instance created with constructor');
      } else if (VapiConstructor.create) {
        this.voiceInstance = VapiConstructor.create({
          apiKey: this.config.apiKey,
          assistant: this.config.assistantId
        });
        console.log('✅ Voice instance created with create method');
      } else {
        throw new Error('No valid VAPI initialization method found');
      }
      
      return this.voiceInstance;
      
    } catch (error: any) {
      console.error('❌ Failed to create voice VAPI instance:', error);
      throw error;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
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
