import { useState, useEffect, useCallback } from 'react';
import {
  createReport,
  deleteReport,
  getReports,
  type ReportListItem,
  type ReportDetail,
} from '../services/reportService';

interface UseReportsReturn {
  reports: ReportListItem[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  generateReport: (prompt: string) => Promise<ReportDetail | null>;
  removeReport: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const extractError = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as {
      response?: { data?: { error?: string; details?: string; message?: string } };
    };
    const data = e.response?.data;
    if (data?.message) return data.message;
    if (data?.error && data?.details) return `${data.error} ${data.details}`;
    return data?.error || data?.details || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export function useReports(businessId: string | null): UseReportsReturn {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!businessId) {
      setReports([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getReports(businessId);
      setReports(data);
    } catch (err) {
      setError(extractError(err, 'Failed to load reports.'));
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const generateReport = useCallback(async (prompt: string) => {
    if (!businessId || !prompt.trim()) return null;

    setIsGenerating(true);
    setError(null);

    try {
      const report = await createReport(businessId, prompt.trim());
      await refresh();
      return report;
    } catch (err) {
      setError(extractError(err, 'Failed to generate report.'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [businessId, refresh]);

  const removeReport = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err) {
      setError(extractError(err, 'Failed to delete report.'));
      await refresh();
    }
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  return {
    reports,
    isLoading,
    isGenerating,
    error,
    generateReport,
    removeReport,
    refresh,
    clearError,
  };
}
