
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
    if (this.isScriptLoaded && window.Vapi) {
      return;
    }

    return new Promise((resolve, reject) => {
      let retryCount = 0;
      const maxRetries = 30;
      
      const checkVapi = () => {
        console.log(`🔍 Checking for VAPI SDK (attempt ${retryCount + 1}/${maxRetries})...`);
        
        const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK;
        
        if (VapiConstructor) {
          console.log('✅ VAPI SDK found');
          this.isScriptLoaded = true;
          resolve();
        } else {
          retryCount++;
          if (retryCount >= maxRetries) {
            console.error('❌ VAPI SDK failed to load after maximum retries');
            reject(new Error('VAPI SDK could not be loaded'));
            return;
          }
          
          setTimeout(checkVapi, 200);
        }
      };

      setTimeout(checkVapi, 500);
    });
  }

  async getTextInstance(): Promise<any> {
    if (this.textInstance) {
      return this.textInstance;
    }

    await this.ensureScriptLoaded();
    
    try {
      console.log('🔤 Creating text-only VAPI instance...');
      
      const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK;
      
      if (typeof VapiConstructor === 'function') {
        this.textInstance = new VapiConstructor(this.config.apiKey);
      } else if (VapiConstructor?.run) {
        this.textInstance = VapiConstructor.run({
          apiKey: this.config.apiKey,
          assistant: this.config.assistantId,
          config: { 
            mode: 'text-only',
            show: false
          }
        });
      } else {
        throw new Error('No valid VAPI constructor found');
      }
      
      console.log('✅ Text VAPI instance created');
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
      
      const VapiConstructor = window.Vapi || window.vapiSDK?.Vapi || (window as any).VapiSDK;
      
      if (VapiConstructor?.run) {
        this.voiceInstance = VapiConstructor.run({
          apiKey: this.config.apiKey,
          assistant: this.config.assistantId,
          config: {
            show: false,
            position: "bottom-right",
          },
        });
      } else if (typeof VapiConstructor === 'function') {
        this.voiceInstance = new VapiConstructor(this.config.apiKey);
      } else {
        throw new Error('No valid VAPI constructor found');
      }
      
      // Store globally for other components
      window.vapiVoiceInstance = this.voiceInstance;
      window.vapiAssistantId = this.config.assistantId;
      
      console.log('✅ Voice VAPI instance created');
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
