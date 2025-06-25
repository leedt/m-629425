import { useEffect, useState, useCallback } from 'react';
import { VapiManager } from '@/utils/vapiManager';

export default function VapiAssistant() {
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'ending'>('idle');

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const initializeVapi = async () => {
      try {
        const manager = VapiManager.getInstance({ assistantId, apiKey });
        const voiceInstance = await manager.getVoiceInstance();

        // Set up event listeners for VOICE only
        voiceInstance.on('call-start', () => {
          console.log('🎙️ VOICE Call started');
          setCallState('connected');
        });

        voiceInstance.on('call-end', () => {
          console.log('🎙️ VOICE Call ended');
          setCallState('idle');
        });

        voiceInstance.on('error', (error: any) => {
          console.error('🎙️ VOICE Vapi error:', error);
          if (error.error?.type === 'permissions') {
            console.log('🎙️ Microphone permission denied, but continuing...');
            // Don't set to idle immediately, let the call continue
          } else {
            setCallState('idle');
          }
        });

        setVapiInstance(voiceInstance);
        console.log('✅ VOICE Vapi initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize VOICE Vapi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVapi();
  }, []);

  const startCall = useCallback(async () => {
    if (!vapiInstance) {
      console.log("🎙️ VOICE Vapi is not initialized yet.");
      return;
    }

    try {
      setCallState('connecting');
      console.log('🎙️ Starting VOICE call...');
      
      // Request microphone permission first
      const manager = VapiManager.getInstance({ assistantId, apiKey });
      const hasPermission = await manager.requestMicrophonePermission();
      
      if (!hasPermission) {
        console.warn('🎙️ Microphone permission denied, but attempting call anyway...');
      }
      
      await vapiInstance.start();
      console.log('✅ VOICE Call started successfully');
    } catch (error) {
      console.error('❌ Failed to start VOICE call:', error);
      setCallState('idle');
    }
  }, [vapiInstance, assistantId, apiKey]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;

    try {
      setCallState('ending');
      console.log('🎙️ Ending VOICE call...');
      await vapiInstance.stop();
      console.log('✅ VOICE Call ended successfully');
    } catch (error) {
      console.error('❌ Failed to end VOICE call:', error);
      setCallState('idle');
    }
  }, [vapiInstance]);

  const getButtonText = () => {
    switch (callState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'End Call';
      case 'ending':
        return 'Ending...';
      default:
        return 'Talk to AI Assistant';
    }
  };

  const handleButtonClick = () => {
    if (callState === 'connected') {
      endCall();
    } else if (callState === 'idle') {
      startCall();
    }
  };

  if (isLoading) {
    return (
      <button disabled className="mb-4">
        Loading AI Assistant...
      </button>
    );
  }

  return (
    <button 
      onClick={handleButtonClick}
      disabled={callState === 'connecting' || callState === 'ending'}
      className="mb-4"
    >
      {getButtonText()}
    </button>
  );
}
