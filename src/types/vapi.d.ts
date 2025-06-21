
interface VapiInstance {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: (event: string, callback: (data?: any) => void) => void;
  off: (event: string, callback: (data?: any) => void) => void;
}

interface VapiSDK {
  run: (config: {
    apiKey: string;
    assistant: string; // Changed to string instead of object
    config?: any;
  }) => VapiInstance;
}

declare global {
  interface Window {
    vapiSDK?: VapiSDK;
    vapiInstance?: VapiInstance;
  }
}

export {};
