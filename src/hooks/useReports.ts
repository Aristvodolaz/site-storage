import { useQuery } from '@tanstack/react-query';
import { ReportsApi } from '@/services/api';
import { ReportFilters } from '@/types/reports';

// Hook для получения отчетов по операциям
export const useReports = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const response = await ReportsApi.getReport(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};
