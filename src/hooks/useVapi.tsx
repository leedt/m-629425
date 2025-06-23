
import { useState, useEffect, useCallback } from 'react';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'error';

export const useVapi = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVapiReady = () => {
      // Use the VOICE instance specifically
      if (window.vapiVoiceInstance) {
        console.log('🎙️ VOICE Vapi instance found:', window.vapiVoiceInstance);
        
        // Hide any Vapi buttons that might appear
        const hideVapiButtons = () => {
          const vapiButtons = document.querySelectorAll('[class*="vapi"], [id*="vapi"]');
          vapiButtons.forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
        };
        
        // Hide buttons immediately and set up observer for future buttons
        hideVapiButtons();
        const observer = new MutationObserver(hideVapiButtons);
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Set up event listeners for VOICE only
        window.vapiVoiceInstance.on('call-start', () => {
          console.log('🎙️ VOICE Call started');
          setCallState('connected');
          setError(null);
        });

        window.vapiVoiceInstance.on('call-end', () => {
          console.log('🎙️ VOICE Call ended');
          setCallState('idle');
          setIsAgentSpeaking(false);
        });

        window.vapiVoiceInstance.on('speech-start', () => {
          console.log('🎙️ VOICE Agent speaking');
          setIsAgentSpeaking(true);
        });

        window.vapiVoiceInstance.on('speech-end', () => {
          console.log('🎙️ VOICE Agent stopped speaking');
          setIsAgentSpeaking(false);
        });

        window.vapiVoiceInstance.on('error', (error: any) => {
          console.error('🎙️ VOICE Vapi error:', error);
          setError(error.message || 'Call failed');
          setCallState('error');
        });
      } else {
        console.log('🎙️ VOICE Vapi instance not ready yet, checking again...');
        setTimeout(checkVapiReady, 100);
      }
    };

    checkVapiReady();
  }, []);

  const startCall = useCallback(async () => {
    console.log('🎙️ Starting VOICE call...');
    
    if (!window.vapiVoiceInstance) {
      console.error('🎙️ VOICE Vapi instance not found');
      setError('Voice Vapi not initialized');
      return;
    }

    try {
      setCallState('connecting');
      setError(null);
      
      console.log('🎙️ Attempting to start VOICE call...');
      
      // Try passing the assistant ID when starting the call
      const assistantId = window.vapiAssistantId;
      if (assistantId) {
        console.log('🎙️ Starting VOICE call with assistant ID:', assistantId);
        await window.vapiVoiceInstance.start(assistantId);
      } else {
        console.log('🎙️ Starting VOICE call without explicit assistant ID (using config)');
        await window.vapiVoiceInstance.start();
      }
      
      console.log('✅ VOICE Call started successfully');
      
    } catch (err: any) {
      console.error('❌ Failed to start VOICE call:', err);
      setError(err.message || 'Failed to start call');
      setCallState('error');
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!window.vapiVoiceInstance) return;

    try {
      setCallState('ending');
      console.log('🎙️ Ending VOICE call...');
      await window.vapiVoiceInstance.stop();
      console.log('✅ VOICE Call ended successfully');
    } catch (err: any) {
      console.error('❌ Failed to end VOICE call:', err);
      setError(err.message || 'Failed to end call');
      setCallState('error');
    }
  }, []);

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
