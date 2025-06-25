
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

  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      console.log('🎙️ Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      
      if (error.name === 'NotAllowedError') {
        console.error('User denied microphone access');
      } else if (error.name === 'NotFoundError') {
        console.error('No microphone found');
      } else {
        console.error('Microphone error:', error.message);
      }
      
      return false;
    }
  }
}
