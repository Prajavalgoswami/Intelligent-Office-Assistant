import api from "./axios";

export type TaskStatus = "needsAction" | "completed" | string;

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  due?: string;
  updated?: string;
}

export interface TodayTasksSummary {
  total: number;
  completed: number;
  pending: number;
}

export interface TodayTasksResponse {
  tasks: TaskItem[];
  summary: TodayTasksSummary;
}

export function getTodayTasks() {
  return api.get<TodayTasksResponse>("/tasks/today");
}

export function completeTask(taskId: string) {
  return api.post<{ message: string }>(`/tasks/${taskId}/complete`);
}


