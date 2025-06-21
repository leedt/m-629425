
interface VapiInstance {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  send: (message: string) => void;
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

interface VapiSDK {
  run: (config: {
    apiKey: string;
    assistant: string;
    config?: any;
  }) => VapiInstance;
}

declare global {
  interface Window {
    vapiSDK: VapiSDK;
    vapiInstance: VapiInstance | null;
  }
}

export {};
