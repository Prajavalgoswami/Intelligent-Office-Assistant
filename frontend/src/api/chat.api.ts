import api from "./axios";

export type GroupCategory = "organizational" | "project";

export interface CreateGroupPayload {
  group_name: string;
  group_category: GroupCategory;
}

export interface CreateGroupResponse {
  message: string;
  group_id: string;
}

export interface SendGroupMessagePayload {
  content: string;
}

export interface SendGroupMessageResponse {
  message: string;
  message_id: string;
}

export interface GroupMessage {
  _id: string;
  company_id: string;
  group_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string | null;
}

export type DeleteType = "me" | "everyone";

export interface SimpleMessageResponse {
  message: string;
}

export interface ChatGroup {
  _id: string;
  company_id: string;
  group_name: string;
  group_category: GroupCategory;
  created_by?: string;
  group_lead_id?: string;
  is_archived?: boolean;
  created_at?: string;
}

export function listGroups() {
  return api.get<ChatGroup[]>("/groups/");
}

export function createGroup(payload: CreateGroupPayload) {
  return api.post<CreateGroupResponse>("/groups/", payload);
}

export function addMemberToGroup(groupId: string, payload: { user_id: string; role?: "member" | "lead" }) {
  return api.post<{ message: string }>(`/groups/${groupId}/members`, payload);
}

export function sendGroupMessage(
  groupId: string,
  payload: SendGroupMessagePayload,
) {
  return api.post<SendGroupMessageResponse>(`/groups/${groupId}`, payload);
}

export function getGroupMessages(groupId: string) {
  return api.get<GroupMessage[]>(`/groups/${groupId}`);
}

export interface GroupMemberInfo {
  user_id: string;
  username?: string | null;
  name: string;
  email: string;
  role: string;
}

export function listGroupMembers(groupId: string) {
  return api.get<GroupMemberInfo[]>(`/groups/${groupId}/members`);
}

export function deleteMessage(messageId: string, deleteType: DeleteType) {
  return api.delete<SimpleMessageResponse>(`/groups/${messageId}`, {
    params: { delete_type: deleteType },
  });
}

export function markMessageRead(messageId: string) {
  return api.post<SimpleMessageResponse>(`/groups/${messageId}/read`);
}

