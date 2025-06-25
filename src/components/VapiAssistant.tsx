
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
        console.log('🎙️ LEGACY VapiAssistant: Starting initialization...');
        const voiceInstance = await VapiManager.createVoiceInstance({ assistantId, apiKey });

        // Set up event listeners for VOICE only
        voiceInstance.on('call-start', () => {
          console.log('🎙️ LEGACY VapiAssistant: Call started');
          setCallState('connected');
        });

        voiceInstance.on('call-end', () => {
          console.log('🎙️ LEGACY VapiAssistant: Call ended');
          setCallState('idle');
        });

        voiceInstance.on('error', (error: any) => {
          console.error('🎙️ LEGACY VapiAssistant: Vapi error:', error);
          if (error.error?.type === 'permissions') {
            console.log('🎙️ LEGACY VapiAssistant: Microphone permission denied, but continuing...');
            // Don't set to idle immediately, let the call continue
          } else {
            setCallState('idle');
          }
        });

        setVapiInstance(voiceInstance);
        console.log('✅ LEGACY VapiAssistant: Vapi initialized successfully');
      } catch (error) {
        console.error('❌ LEGACY VapiAssistant: Failed to initialize Vapi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVapi();
  }, []);

  const startCall = useCallback(async () => {
    if (!vapiInstance) {
      console.log("🎙️ LEGACY VapiAssistant: Vapi is not initialized yet.");
      return;
    }

    try {
      setCallState('connecting');
      console.log('🎙️ LEGACY VapiAssistant: Starting call...');
      
      // Request microphone permission first
      const hasPermission = await VapiManager.requestMicrophonePermission();
      
      if (!hasPermission) {
        console.warn('🎙️ LEGACY VapiAssistant: Microphone permission denied, but attempting call anyway...');
      }
      
      await vapiInstance.start(assistantId);
      console.log('✅ LEGACY VapiAssistant: Call started successfully');
    } catch (error) {
      console.error('❌ LEGACY VapiAssistant: Failed to start call:', error);
      setCallState('idle');
    }
  }, [vapiInstance, assistantId]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;

    try {
      setCallState('ending');
      console.log('🎙️ LEGACY VapiAssistant: Ending call...');
      await vapiInstance.stop();
      console.log('✅ LEGACY VapiAssistant: Call ended successfully');
    } catch (error) {
      console.error('❌ LEGACY VapiAssistant: Failed to end call:', error);
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
