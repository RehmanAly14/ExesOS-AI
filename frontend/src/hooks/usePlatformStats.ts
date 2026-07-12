/**
 * usePlatformStats
 * Aggregates workspace, business, document, chat, and report data
 * from existing APIs for Dashboard and Analytics pages.
 * Uses a short-lived module cache to avoid duplicate fetches.
 */

import { useState, useEffect, useCallback } from 'react';
import { getWorkspaces, type Workspace } from '../services/workspaceService';
import { getWorkspaceBusinesses, type Business } from '../services/businessService';
import { getBusinessDocuments, type Document } from '../services/documentService';
import { getChatHistory, type ApiChatMessage } from '../services/chatService';
import { getReports, type ReportListItem } from '../services/reportService';

// ── Types ──────────────────────────────────────────

export interface BusinessWithMeta extends Business {
  workspaceName: string;
}

export interface DocumentWithMeta extends Document {
  businessName: string;
}

export interface ChatMessageWithMeta extends ApiChatMessage {
  businessId: string;
  businessName: string;
}

export interface ActivityItem {
  id: string;
  type: 'document' | 'chat' | 'report' | 'business';
  title: string;
  description: string;
  timestamp: string;
  businessId?: string;
  businessName?: string;
  status?: string;
  reportId?: string;
}

export interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

export interface UploadTimeDatum {
  month: string;
  uploaded: number;
  embedded: number;
}

export interface ChatDayDatum {
  day: string;
  messages: number;
}

export interface PlatformStats {
  workspaceCount: number;
  businessCount: number;
  documentCount: number;
  chatMessageCount: number;
  reportCount: number;
  documentsProcessed: number;
  documentsEmbedded: number;
  documentsPending: number;
  documentsFailed: number;
  avgBusinessHealth: number | null;

  workspaces: Workspace[];
  businesses: BusinessWithMeta[];
  recentDocuments: DocumentWithMeta[];
  recentBusinesses: BusinessWithMeta[];
  recentReports: ReportListItem[];
  recentChats: ChatMessageWithMeta[];
  recentActivity: ActivityItem[];

  documentStatusChart: ChartDatum[];
  fileTypeChart: ChartDatum[];
  embeddingStatusChart: ChartDatum[];
  uploadsOverTime: UploadTimeDatum[];
  chatActivityByDay: ChatDayDatum[];
}

export interface UsePlatformStatsReturn {
  stats: PlatformStats;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const EMPTY_STATS: PlatformStats = {
  workspaceCount: 0,
  businessCount: 0,
  documentCount: 0,
  chatMessageCount: 0,
  reportCount: 0,
  documentsProcessed: 0,
  documentsEmbedded: 0,
  documentsPending: 0,
  documentsFailed: 0,
  avgBusinessHealth: null,
  workspaces: [],
  businesses: [],
  recentDocuments: [],
  recentBusinesses: [],
  recentReports: [],
  recentChats: [],
  recentActivity: [],
  documentStatusChart: [],
  fileTypeChart: [],
  embeddingStatusChart: [],
  uploadsOverTime: [],
  chatActivityByDay: [],
};

const STATUS_COLORS: Record<string, string> = {
  extracted: '#4cd7f6',
  processing: '#d0bcff',
  uploaded: '#adc6ff',
  failed: '#f87171',
  pending: '#fbbf24',
  embedded: '#34d399',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#d0bcff',
  docx: '#4cd7f6',
  txt: '#a078ff',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Module-level cache ─────────────────────────────

const CACHE_TTL_MS = 45_000;
let cachedStats: PlatformStats | null = null;
let cachedAt = 0;
let inflightFetch: Promise<PlatformStats> | null = null;

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function buildUploadsOverTime(docs: DocumentWithMeta[]): UploadTimeDatum[] {
  const buckets = new Map<string, { uploaded: number; embedded: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, { uploaded: 0, embedded: 0 });
  }

  for (const doc of docs) {
    const created = new Date(doc.createdAt);
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.uploaded += 1;
    if (doc.embeddingStatus === 'embedded') bucket.embedded += 1;
  }

  return Array.from(buckets.entries()).map(([key, counts]) => {
    const [, monthNum] = key.split('-');
    const monthDate = new Date(2000, parseInt(monthNum, 10) - 1, 1);
    return {
      month: monthDate.toLocaleString(undefined, { month: 'short' }),
      uploaded: counts.uploaded,
      embedded: counts.embedded,
    };
  });
}

function buildChatActivityByDay(messages: ChatMessageWithMeta[]): ChatDayDatum[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const msg of messages) {
    const day = new Date(msg.createdAt).getDay();
    counts[day] += 1;
  }
  return DAY_LABELS.map((day, i) => ({ day, messages: counts[i] }));
}

function buildActivityFeed(
  docs: DocumentWithMeta[],
  chats: ChatMessageWithMeta[],
  reports: ReportListItem[],
  businesses: BusinessWithMeta[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const doc of docs.slice(0, 5)) {
    items.push({
      id: `doc-${doc.id}`,
      type: 'document',
      title: doc.filename,
      description: `Document uploaded to ${doc.businessName}`,
      timestamp: doc.createdAt,
      businessId: doc.businessId,
      businessName: doc.businessName,
      status: doc.status,
    });
  }

  for (const msg of chats.slice(0, 5)) {
    items.push({
      id: `chat-${msg.id}`,
      type: 'chat',
      title: msg.role === 'user' ? 'Chat query' : 'AI response',
      description: msg.content.slice(0, 120) + (msg.content.length > 120 ? '…' : ''),
      timestamp: msg.createdAt,
      businessId: msg.businessId,
      businessName: msg.businessName,
    });
  }

  for (const report of reports.slice(0, 5)) {
    items.push({
      id: `report-${report.id}`,
      type: 'report',
      title: report.title,
      description: report.executiveSummary.slice(0, 120) + (report.executiveSummary.length > 120 ? '…' : ''),
      timestamp: report.createdAt,
      businessId: report.businessId,
      businessName: report.businessName,
      reportId: report.id,
    });
  }

  for (const biz of businesses.slice(0, 3)) {
    items.push({
      id: `biz-${biz.id}`,
      type: 'business',
      title: biz.name,
      description: `Business created in ${biz.workspaceName}`,
      timestamp: biz.createdAt,
      businessId: biz.id,
      businessName: biz.name,
    });
  }

  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

async function fetchPlatformStats(): Promise<PlatformStats> {
  const workspaces = await getWorkspaces();

  const businessResults = await Promise.allSettled(
    workspaces.map((ws) => getWorkspaceBusinesses(ws.id))
  );

  const businesses: BusinessWithMeta[] = businessResults.flatMap((result, i) => {
    if (result.status !== 'fulfilled') return [];
    return result.value.map((b) => ({
      ...b,
      workspaceName: workspaces[i]?.name ?? 'Workspace',
    }));
  });

  const [docResults, reportResults, chatResults] = await Promise.all([
    Promise.allSettled(businesses.map((b) => getBusinessDocuments(b.id))),
    Promise.allSettled(businesses.map((b) => getReports(b.id))),
    Promise.allSettled(businesses.map((b) => getChatHistory(b.id))),
  ]);

  const allDocs: DocumentWithMeta[] = docResults.flatMap((result, i) => {
    if (result.status !== 'fulfilled') return [];
    return result.value.map((d) => ({
      ...d,
      businessName: businesses[i]?.name ?? 'Business',
    }));
  });

  const allReports: ReportListItem[] = reportResults.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  );

  const allChats: ChatMessageWithMeta[] = chatResults.flatMap((result, i) => {
    if (result.status !== 'fulfilled') return [];
    return result.value.map((msg) => ({
      ...msg,
      businessId: businesses[i]?.id ?? '',
      businessName: businesses[i]?.name ?? 'Business',
    }));
  });

  const documentsProcessed = allDocs.filter(
    (d) => d.status === 'extracted' || d.status === 'uploaded'
  ).length;
  const documentsEmbedded = allDocs.filter((d) => d.embeddingStatus === 'embedded').length;
  const documentsPending = allDocs.filter((d) => d.embeddingStatus === 'pending').length;
  const documentsFailed = allDocs.filter(
    (d) => d.status === 'failed' || d.embeddingStatus === 'failed'
  ).length;

  const healthScores = allReports
    .map((r) => r.businessHealth)
    .filter((h): h is number => h !== null && h !== undefined);
  const avgBusinessHealth =
    healthScores.length > 0
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
      : null;

  const statusCounts: Record<string, number> = {};
  for (const doc of allDocs) {
    statusCounts[doc.status] = (statusCounts[doc.status] ?? 0) + 1;
  }
  const documentStatusChart: ChartDatum[] = Object.entries(statusCounts).map(
    ([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      color: STATUS_COLORS[label] ?? '#958ea0',
    })
  );

  const typeCounts: Record<string, number> = {};
  for (const doc of allDocs) {
    const type = doc.fileType?.toLowerCase() ?? 'other';
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
  }
  const fileTypeChart: ChartDatum[] = Object.entries(typeCounts).map(([label, value]) => ({
    label: label.toUpperCase(),
    value,
    color: FILE_TYPE_COLORS[label] ?? '#958ea0',
  }));

  const embeddingCounts = {
    embedded: documentsEmbedded,
    pending: documentsPending,
    failed: allDocs.filter((d) => d.embeddingStatus === 'failed').length,
  };
  const embeddingStatusChart: ChartDatum[] = Object.entries(embeddingCounts)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
      color: STATUS_COLORS[label] ?? '#958ea0',
    }));

  const sortedDocs = [...allDocs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedBusinesses = [...businesses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedReports = [...allReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedChats = [...allChats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    workspaceCount: workspaces.length,
    businessCount: businesses.length,
    documentCount: allDocs.length,
    chatMessageCount: allChats.length,
    reportCount: allReports.length,
    documentsProcessed,
    documentsEmbedded,
    documentsPending,
    documentsFailed,
    avgBusinessHealth,
    workspaces,
    businesses,
    recentDocuments: sortedDocs.slice(0, 5),
    recentBusinesses: sortedBusinesses.slice(0, 5),
    recentReports: sortedReports.slice(0, 5),
    recentChats: sortedChats.slice(0, 5),
    recentActivity: buildActivityFeed(sortedDocs, sortedChats, sortedReports, sortedBusinesses),
    documentStatusChart,
    fileTypeChart,
    embeddingStatusChart,
    uploadsOverTime: buildUploadsOverTime(allDocs),
    chatActivityByDay: buildChatActivityByDay(allChats),
  };
}

async function getCachedPlatformStats(force = false): Promise<PlatformStats> {
  const now = Date.now();
  if (!force && cachedStats && now - cachedAt < CACHE_TTL_MS) {
    return cachedStats;
  }

  if (inflightFetch && !force) {
    return inflightFetch;
  }

  inflightFetch = fetchPlatformStats()
    .then((stats) => {
      cachedStats = stats;
      cachedAt = Date.now();
      return stats;
    })
    .finally(() => {
      inflightFetch = null;
    });

  return inflightFetch;
}

export function usePlatformStats(): UsePlatformStatsReturn {
  const [stats, setStats] = useState<PlatformStats>(cachedStats ?? EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(!cachedStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = true) => {
    const hasData = cachedStats !== null;
    if (hasData) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getCachedPlatformStats(force);
      setStats(data);
    } catch (err: unknown) {
      setError(extractMessage(err, 'Failed to load platform data.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  return { stats, isLoading, isRefreshing, error, refresh: () => refresh(true) };
}

export { formatFileSize } from '../services/documentService';
