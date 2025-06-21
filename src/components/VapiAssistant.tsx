
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

export default function VapiAssistant() {
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'ending'>('idle');

  const assistantId = "64e64beb-2258-4f1a-8f29-2fa8eada149f";
  const apiKey = "9bac5b6f-d901-4a44-9d24-9e0730757aa4";

  useEffect(() => {
    const loadVapiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.vapiSDK) {
          resolve(window.vapiSDK);
          return;
        }

        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        script.defer = true;
        script.async = true;

        script.onload = () => {
          console.log('Vapi script loaded');
          resolve(window.vapiSDK);
        };

        script.onerror = () => {
          console.error('Failed to load Vapi script');
          reject(new Error('Failed to load Vapi script'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeVapi = async () => {
      try {
        await loadVapiScript();
        
        if (window.vapiSDK) {
          console.log('Initializing Vapi with config:', {
            apiKey: apiKey,
            assistant: assistantId,
            config: {
              show: false,
              position: "bottom-right",
            }
          });

          const instance = window.vapiSDK.run({
            apiKey: apiKey,
            assistant: assistantId, // Pass as string directly, not as object
            config: {
              show: false,
              position: "bottom-right",
            },
          });

          // Set up event listeners
          instance.on('call-start', () => {
            console.log('Call started');
            setCallState('connected');
          });

          instance.on('call-end', () => {
            console.log('Call ended');
            setCallState('idle');
          });

          instance.on('error', (error: any) => {
            console.error('Vapi error:', error);
            setCallState('idle');
          });

          setVapiInstance(instance);
          window.vapiInstance = instance;
          // Store assistant ID globally for useVapi hook
          window.vapiAssistantId = assistantId;
          console.log('Vapi initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize Vapi:', error);
        console.error('Error details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVapi();
  }, []);

  const startCall = useCallback(async () => {
    if (!vapiInstance) {
      console.log("Vapi is not initialized yet.");
      return;
    }

    try {
      setCallState('connecting');
      await vapiInstance.start();
      console.log('Call started successfully');
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallState('idle');
    }
  }, [vapiInstance]);

  const endCall = useCallback(async () => {
    if (!vapiInstance) return;

    try {
      setCallState('ending');
      await vapiInstance.stop();
    } catch (error) {
      console.error('Failed to end call:', error);
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
      <Button disabled className="mb-4">
        Loading AI Assistant...
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleButtonClick}
      disabled={callState === 'connecting' || callState === 'ending'}
      className="mb-4"
    >
      {getButtonText()}
    </Button>
  );
}
