
export interface TextMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface VapiConfig {
  assistantId: string;
  apiKey: string;
}
