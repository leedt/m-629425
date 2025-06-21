
import { useState, useEffect, useCallback } from 'react';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'error';

export const useVapi = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVapiReady = () => {
      if (window.vapiInstance) {
        // Set up event listeners
        window.vapiInstance.on('call-start', () => {
          console.log('Call started');
          setCallState('connected');
          setError(null);
        });

        window.vapiInstance.on('call-end', () => {
          console.log('Call ended');
          setCallState('idle');
          setIsAgentSpeaking(false);
        });

        window.vapiInstance.on('speech-start', () => {
          console.log('Agent speaking');
          setIsAgentSpeaking(true);
        });

        window.vapiInstance.on('speech-end', () => {
          console.log('Agent stopped speaking');
          setIsAgentSpeaking(false);
        });

        window.vapiInstance.on('error', (error: any) => {
          console.error('Vapi error:', error);
          setError(error.message || 'Call failed');
          setCallState('error');
        });
      } else {
        // Check again in 100ms if Vapi isn't ready yet
        setTimeout(checkVapiReady, 100);
      }
    };

    checkVapiReady();
  }, []);

  const startCall = useCallback(async () => {
    if (!window.vapiInstance) {
      setError('Vapi not initialized');
      return;
    }

    try {
      setCallState('connecting');
      setError(null);
      
      // Call start without parameters - assistant ID is already configured in the instance
      await window.vapiInstance.start();
    } catch (err: any) {
      console.error('Failed to start call:', err);
      setError(err.message || 'Failed to start call');
      setCallState('error');
    }
  }, []);

  const endCall = useCallback(async () => {
    if (!window.vapiInstance) return;

    try {
      setCallState('ending');
      await window.vapiInstance.stop();
    } catch (err: any) {
      console.error('Failed to end call:', err);
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
