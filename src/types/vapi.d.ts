
export {};

declare global {
  interface Window {
    Vapi: any;
    vapiSDK: any;
    vapiVoiceInstance: any;
    vapiTextInstance: any;
    vapiAssistantId: string;
  }
}
