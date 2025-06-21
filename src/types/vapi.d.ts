

interface VapiInstance {
  start: (assistant?: string) => Promise<void>;
  stop: () => Promise<void>;
  on: (event: string, callback: (data?: any) => void) => void;
  off: (event: string, callback: (data?: any) => void) => void;
  send: (message: string) => Promise<void>;
}

interface VapiSDK {
  run: (config: any) => VapiInstance;
}

declare global {
  interface Window {
    vapiSDK?: VapiSDK;
    vapiInstance?: VapiInstance;
    vapiAssistantId?: string;
  }
}

export {};
