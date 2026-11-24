import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { HistoryApi } from '@/services/api';
import { StorageOperationsFilters } from '@/types/history';

const LIVE_REFETCH_MS = 10_000;

// Hook для загрузки истории складских операций (онлайн-обновление)
export const useStorageHistory = (filters: StorageOperationsFilters) => {
  return useQuery({
    queryKey: ['storage-history', filters],
    queryFn: async () => HistoryApi.getOperations(filters),
    staleTime: 0,
    // Таймаут не повторяем 3 раза (глобальный default): повтор только усиливает нагрузку на сервер
    retry: 1,
    // окно дат сдвигается каждые 10 сек, без этого таблица мигает спиннером на каждом обновлении
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};
