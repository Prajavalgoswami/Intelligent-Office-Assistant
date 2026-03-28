import api from "./axios";

export interface SummarizeResponse {
  filename: string;
  summary_type: string;
  summary: string;
  cached: boolean;
  usage_count: number;
}

export function summarizeDocument(file: File, summaryType: string = "normal") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("summary_type", summaryType);

  return api.post<SummarizeResponse>("/documents/summarize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
