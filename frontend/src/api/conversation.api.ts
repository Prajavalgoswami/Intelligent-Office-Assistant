import api from "./axios";

export interface ConversationMessageRequest {
  message: string;
}

export interface ConversationMessageResponse {
  type: string;
  response: string;
  // Backend can return arbitrary structured data here
  data?: unknown;
}

export function sendConversationMessage(message: string) {
  const payload: ConversationMessageRequest = { message };
  return api.post<ConversationMessageResponse>("/conversation/message", payload);
}

