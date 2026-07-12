import apiClient from '../lib/apiClient';

export interface ReportListItem {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  prompt: string;
  executiveSummary: string;
  businessHealth: number | null;
  confidence: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends ReportListItem {
  reportMarkdown: string;
  reportData: Record<string, unknown> | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const createReport = async (
  businessId: string,
  prompt: string
): Promise<ReportDetail> => {
  const { data } = await apiClient.post<ApiResponse<ReportDetail>>(
    '/reports',
    { businessId, prompt },
    { timeout: 90000 }
  );
  return data.data;
};

export const getReports = async (businessId: string): Promise<ReportListItem[]> => {
  const { data } = await apiClient.get<ApiResponse<ReportListItem[]>>('/reports', {
    params: { businessId },
  });
  return data.data;
};

export const getReportById = async (id: string): Promise<ReportDetail> => {
  const { data } = await apiClient.get<ApiResponse<ReportDetail>>(`/reports/${id}`);
  return data.data;
};

export const deleteReport = async (id: string): Promise<void> => {
  await apiClient.delete(`/reports/${id}`);
};
