import api from "./axios";

export type ServiceRequestStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "resolved"
  | string;

export interface ServiceRequest {
  _id: string;
  company_id: string;
  department_id?: string | null;
  raised_by: string;
  title: string;
  description: string;
  category: string;
  status: ServiceRequestStatus;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestCreateInput {
  title: string;
  description: string;
  category: string;
}

export interface ServiceRequestResponseMessage {
  message: string;
}

export function getServiceRequests() {
  return api.get<ServiceRequest[]>("/service-requests/");
}

export function createServiceRequest(payload: ServiceRequestCreateInput) {
  return api.post<ServiceRequestResponseMessage>("/service-requests/", payload);
}

export function assignServiceRequestToSelf(requestId: string) {
  return api.patch<ServiceRequestResponseMessage>(
    `/service-requests/${requestId}/assign`,
  );
}

export function completeServiceRequest(requestId: string) {
  return api.patch<ServiceRequestResponseMessage>(
    `/service-requests/${requestId}/complete`,
  );
}

export function submitClientFeedback(requestId: string, satisfied: boolean) {
  return api.patch<ServiceRequestResponseMessage>(
    `/service-requests/${requestId}/client-feedback`,
    { satisfied },
  );
}

