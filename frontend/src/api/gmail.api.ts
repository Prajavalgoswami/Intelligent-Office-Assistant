import api from "./axios";

export interface GmailStatusResponse {
  connected: boolean;
  email?: string;
  detail?: string;
}

export interface GmailMessage {
  message_id: string;
  subject: string;
  sender: string;
  category: string;
  timestamp: string;
}

export interface AutoOrganizeResponse {
  message: string;
  processed_count?: number;
}

export interface GoogleAuthUrlResponse {
  auth_url: string;
}

export function getGmailStatus() {
  return api.get<GmailStatusResponse>("/auth/gmail/test");
}

export interface GmailFullMessagesResponse {
  total_emails: number;
  emails: GmailMessage[];
}

export function getGmailFullMessages() {
  return api.get<GmailFullMessagesResponse>("/auth/gmail/full-messages");
}

export function autoOrganizeEmails() {
  return api.post<AutoOrganizeResponse>("/auth/gmail/auto-organize");
}

export function getGoogleAuthUrl() {
  return api.get<GoogleAuthUrlResponse>("/auth/google/login");
}

