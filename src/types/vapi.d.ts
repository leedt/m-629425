
export {};

declare global {
  interface Window {
    Vapi: any;
    vapiVoiceInstance: any;
    vapiTextInstance: any;
    vapiAssistantId: string;
  }
}
