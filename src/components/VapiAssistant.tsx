
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
          console.log('🎙️ Vapi script loaded for VOICE');
          resolve(window.vapiSDK);
        };

        script.onerror = () => {
          console.error('❌ Failed to load Vapi script for VOICE');
          reject(new Error('Failed to load Vapi script'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeVapi = async () => {
      try {
        await loadVapiScript();
        
        if (window.vapiSDK) {
          console.log('🎙️ Initializing Vapi for VOICE with config:', {
            apiKey: apiKey ? '***' + apiKey.slice(-4) : 'missing',
            assistant: assistantId,
            config: {
              show: false,
              position: "bottom-right",
            }
          });

          const voiceInstance = window.vapiSDK.run({
            apiKey: apiKey,
            assistant: assistantId, // Pass as string directly, not as object
            config: {
              show: false,
              position: "bottom-right",
            },
          });

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
            setCallState('idle');
          });

          setVapiInstance(voiceInstance);
          // Store VOICE instance in a different global variable
          window.vapiVoiceInstance = voiceInstance;
          window.vapiAssistantId = assistantId;
          console.log('✅ VOICE Vapi initialized successfully and stored in window.vapiVoiceInstance');
        }
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
      await vapiInstance.start();
      console.log('✅ VOICE Call started successfully');
    } catch (error) {
      console.error('❌ Failed to start VOICE call:', error);
      setCallState('idle');
    }
  }, [vapiInstance]);

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
