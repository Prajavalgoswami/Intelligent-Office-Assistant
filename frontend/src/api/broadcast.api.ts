import api from "./axios";

export type BroadcastTargetType = "all" | "group";
export type BroadcastPriority = "normal" | "important" | "urgent";

export interface CreateBroadcastPayload {
  title: string;
  content: string;
  target_type: BroadcastTargetType;
  target_id?: string;
  priority?: BroadcastPriority;
}

export interface CreateBroadcastResponse {
  message: string;
  broadcast_id: string;
}

export interface BroadcastMessage {
  _id: string;
  company_id: string;
  sender_id: string;
  title: string;
  content: string;
  target_type: BroadcastTargetType;
  target_id?: string | null;
  priority: BroadcastPriority;
  is_active: boolean;
  created_at: string;
}

export function createBroadcast(payload: CreateBroadcastPayload) {
  return api.post<CreateBroadcastResponse>("/broadcasts/", payload);
}

export function getMyBroadcasts() {
  return api.get<BroadcastMessage[]>("/broadcasts/");
}

