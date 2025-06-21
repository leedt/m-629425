
import { useState, useEffect, useCallback } from 'react';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ending' | 'error';

export const useVapi = () => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVapiReady = () => {
      if (window.vapiInstance) {
        console.log('Vapi instance found:', window.vapiInstance);
        
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
        console.log('Vapi instance not ready yet, checking again...');
        setTimeout(checkVapiReady, 100);
      }
    };

    checkVapiReady();
  }, []);

  const startCall = useCallback(async () => {
    console.log('Starting call...');
    
    if (!window.vapiInstance) {
      console.error('Vapi instance not found');
      setError('Vapi not initialized');
      return;
    }

    try {
      setCallState('connecting');
      setError(null);
      
      console.log('Attempting to start call...');
      // Try with assistant parameter first, then fallback to no parameters
      try {
        await window.vapiInstance.start({
          assistant: "64e64beb-2258-4f1a-8f29-2fa8eada149f"
        });
      } catch (paramError) {
        console.log('Failed with parameters, trying without:', paramError);
        await window.vapiInstance.start();
      }
      console.log('Call started successfully');
      
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
