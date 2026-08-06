import { useQuery } from '@tanstack/react-query';
import { HistoryApi } from '@/services/api';
import { StorageOperationsFilters } from '@/types/history';

// Hook для загрузки истории складских операций
export const useStorageHistory = (filters: StorageOperationsFilters) => {
  return useQuery({
    queryKey: ['storage-history', filters],
    queryFn: async () => HistoryApi.getOperations(filters),
    staleTime: 60 * 1000,
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};
