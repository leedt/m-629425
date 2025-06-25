
import { useState, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'error';

export const useVapi = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  // Request microphone permission helper
  const requestMicrophonePermission = async (): Promise<boolean> => {
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
  };

  useEffect(() => {
    const initializeVapi = async () => {
      console.log('🎙️ VOICE: Starting initialization...');
      
      try {
        const voiceInstance = new Vapi(apiKey);
        console.log('✅ Voice instance created successfully');
        
        // Store on window for debugging
        (window as any).vapiVoiceInstance = voiceInstance;
        console.log('🎙️ Voice instance stored on window.vapiVoiceInstance');
        
        console.log('🎙️ VOICE: Setting up event listeners...');

        // Set up event listeners for VOICE only
        voiceInstance.on('call-start', () => {
          console.log('🎙️ VOICE: Call started');
          setCallState('connected');
          setError(null);
        });

        voiceInstance.on('call-end', () => {
          console.log('🎙️ VOICE: Call ended');
          setCallState('idle');
          setIsAgentSpeaking(false);
        });

        voiceInstance.on('speech-start', () => {
          console.log('🎙️ VOICE: Agent speaking');
          setIsAgentSpeaking(true);
        });

        voiceInstance.on('speech-end', () => {
          console.log('🎙️ VOICE: Agent stopped speaking');
          setIsAgentSpeaking(false);
        });

        voiceInstance.on('error', (error: any) => {
          console.error('🎙️ VOICE: Error occurred:', error);
          
          if (error.error?.type === 'permissions' || error.message?.includes('permission')) {
            setError('Microphone permission denied. Please allow microphone access and try again.');
          } else {
            setError(error.message || 'Call failed');
          }
          setCallState('error');
          setIsAgentSpeaking(false);
        });

        setVapiInstance(voiceInstance);
        console.log('🎙️ VOICE: Instance ready and stored');
        
      } catch (error: any) {
        console.error('❌ VOICE: Failed to initialize:', error);
        setError('Failed to initialize voice assistant');
        setCallState('error');
      }
    };

    initializeVapi();
  }, []);

  const startCall = useCallback(async () => {
    console.log('🎙️ VOICE: Starting call...');
    
    if (!vapiInstance) {
      console.error('🎙️ VOICE: Instance not found');
      setError('Voice assistant not initialized');
      return;
    }

    try {
      setCallState('connecting');
      setError(null);
      
      // Request microphone permission first
      console.log('🎙️ VOICE: Requesting microphone permission...');
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        setError('Microphone permission is required for voice calls');
        setCallState('error');
        return;
      }
      
      console.log('🎙️ VOICE: Starting call with assistant:', assistantId);
      await vapiInstance.start(assistantId);
      console.log('✅ VOICE: Call started successfully');
      
    } catch (err: any) {
      console.error('❌ VOICE: Failed to start call:', err);
      setError(err.message || 'Failed to start call');
      setCallState('error');
    }
  }, [vapiInstance, assistantId]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;

    try {
      setCallState('ending');
      console.log('🎙️ VOICE: Ending call...');
      await vapiInstance.stop();
      console.log('✅ VOICE: Call ended successfully');
    } catch (err: any) {
      console.error('❌ VOICE: Failed to end call:', err);
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
