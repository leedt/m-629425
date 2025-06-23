
export {};

declare global {
  interface Window {
    vapiSDK: any;
    vapiInstance: any; // Legacy - for backwards compatibility
    vapiVoiceInstance: any; // NEW: Specific for voice calls
    vapiTextInstance: any; // Specific for text chat
    vapiAssistantId: string;
  }
}
