
export interface VapiInstance {
  start: (assistantId?: string) => Promise<void>;
  stop: () => Promise<void>;
  send: (message: string) => Promise<void>;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

export interface VapiSDK {
  run: (config: {
    apiKey: string;
    assistant: string | { id: string };
    config?: {
      show?: boolean;
      position?: string;
      type?: string;
    };
  }) => VapiInstance;
}

declare global {
  interface Window {
    vapiSDK: VapiSDK;
    vapiInstance: VapiInstance; // For voice calls
    vapiTextInstance: VapiInstance; // For text chat
    vapiAssistantId: string;
  }
}

export {};
