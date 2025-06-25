
import Vapi from '@vapi-ai/web';

export interface VapiManagerConfig {
  assistantId: string;
  apiKey: string;
}

export class VapiManager {
  static async createVoiceInstance(config: VapiManagerConfig): Promise<any> {
    console.log('🎙️ Creating VOICE instance with config:', config);
    
    try {
      const voiceInstance = new Vapi(config.apiKey);
      console.log('✅ Voice instance created successfully');
      
      // Store on window for debugging
      (window as any).vapiVoiceInstance = voiceInstance;
      console.log('🎙️ Voice instance stored on window.vapiVoiceInstance');
      
      return voiceInstance;
    } catch (error) {
      console.error('❌ Failed to create voice instance:', error);
      throw new Error(`Failed to create voice instance: ${error}`);
    }
  }

  static async createTextInstance(config: VapiManagerConfig): Promise<any> {
    console.log('🔤 Creating TEXT instance with config:', config);
    
    try {
      const textInstance = new Vapi(config.apiKey);
      console.log('✅ Text instance created successfully');
      
      // Store on window for debugging
      (window as any).vapiTextInstance = textInstance;
      console.log('🔤 Text instance stored on window.vapiTextInstance');
      
      return textInstance;
    } catch (error) {
      console.error('❌ Failed to create text instance:', error);
      throw new Error(`Failed to create text instance: ${error}`);
    }
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
