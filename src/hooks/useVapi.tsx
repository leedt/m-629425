
import { useState, useEffect, useCallback } from 'react';
import { VapiManager } from '@/utils/vapiManager';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'error';

export const useVapi = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const initializeVapi = async () => {
      try {
        const manager = VapiManager.getInstance({ assistantId, apiKey });
        const voiceInstance = await manager.getVoiceInstance();

        // Hide any Vapi buttons that might appear
        const hideVapiButtons = () => {
          const vapiButtons = document.querySelectorAll('[class*="vapi"], [id*="vapi"]');
          vapiButtons.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
        };
        
        hideVapiButtons();
        const observer = new MutationObserver(hideVapiButtons);
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Set up event listeners for VOICE only
        voiceInstance.on('call-start', () => {
          console.log('🎙️ VOICE Call started');
          setCallState('connected');
          setError(null);
        });

        voiceInstance.on('call-end', () => {
          console.log('🎙️ VOICE Call ended');
          setCallState('idle');
          setIsAgentSpeaking(false);
        });

        voiceInstance.on('speech-start', () => {
          console.log('🎙️ VOICE Agent speaking');
          setIsAgentSpeaking(true);
        });

        voiceInstance.on('speech-end', () => {
          console.log('🎙️ VOICE Agent stopped speaking');
          setIsAgentSpeaking(false);
        });

        voiceInstance.on('error', (error: any) => {
          console.error('🎙️ VOICE Vapi error:', error);
          if (error.error?.type === 'permissions') {
            setError('Microphone permission denied. Please allow microphone access and try again.');
            setCallState('error');
          } else {
            setError(error.message || 'Call failed');
            setCallState('error');
          }
        });

        setVapiInstance(voiceInstance);
        console.log('🎙️ VOICE Vapi instance initialized');
      } catch (error: any) {
        console.error('❌ Failed to initialize voice VAPI:', error);
        setError('Failed to initialize voice assistant');
        setCallState('error');
      }
    };

    initializeVapi();
  }, []);

  const startCall = useCallback(async () => {
    console.log('🎙️ Starting VOICE call...');
    
    if (!vapiInstance) {
      console.error('🎙️ VOICE Vapi instance not found');
      setError('Voice assistant not initialized');
      return;
    }

    try {
      setCallState('connecting');
      setError(null);
      
      // Request microphone permission first
      const manager = VapiManager.getInstance({ assistantId, apiKey });
      const hasPermission = await manager.requestMicrophonePermission();
      
      if (!hasPermission) {
        setError('Microphone permission is required for voice calls');
        setCallState('error');
        return;
      }
      
      console.log('🎙️ Attempting to start VOICE call...');
      await vapiInstance.start(assistantId);
      console.log('✅ VOICE Call started successfully');
      
    } catch (err: any) {
      console.error('❌ Failed to start VOICE call:', err);
      setError(err.message || 'Failed to start call');
      setCallState('error');
    }
  }, [vapiInstance, assistantId, apiKey]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;

    try {
      setCallState('ending');
      console.log('🎙️ Ending VOICE call...');
      await vapiInstance.stop();
      console.log('✅ VOICE Call ended successfully');
    } catch (err: any) {
      console.error('❌ Failed to end VOICE call:', err);
      setError(err.message || 'Failed to end call');
      setCallState('error');
    }
  }, [vapiInstance]);

  const toggleCall = useCallback(async () => {
    if (callState === 'idle' || callState === 'error') {
      await startCall();
    } else if (callState === 'connected') {
      await endCall();
    }
  }, [callState, startCall, endCall]);

  return {
    callState,
    isAgentSpeaking,
    error,
    startCall,
    endCall,
    toggleCall,
    isCallActive: callState === 'connected' || callState === 'connecting',
  };
};
