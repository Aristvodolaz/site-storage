import { useQuery } from '@tanstack/react-query';
import { ReportsApi, HistoryApi } from '@/services/api';
import { ReportFilters } from '@/types/reports';

// Выработка по исполнителям и типам операций склада
export const useExecutorOutput = (dateFrom: string, dateTo: string, warehouse: number) => {
  return useQuery({
    queryKey: ['executorOutput', dateFrom, dateTo, warehouse],
    queryFn: () => HistoryApi.getOutputByExecutor(dateFrom, dateTo, warehouse),
    staleTime: 2 * 60 * 1000,
    enabled: !!dateFrom && !!dateTo,
  });
};

// Hook для получения отчетов по операциям
export const useReports = (filters: ReportFilters) => {
  return useQuery({
    // filters содержит id_sklad, поэтому смена склада даёт отдельный кэш
    queryKey: ['reports', filters],
    queryFn: async () => {
      const response = await ReportsApi.getReport(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};
