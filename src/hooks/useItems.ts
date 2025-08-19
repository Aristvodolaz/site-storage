import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StorageApi } from '@/services/api';

export const useItems = (warehouse: number = 1383) => {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['items', warehouse],
    queryFn: () => StorageApi.getItems(100000, warehouse),
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 5 * 60 * 1000, // Автообновление каждые 5 минут
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const invalidateItems = () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const refreshItems = () => {
    refetch();
  };

  return {
    items,
    isLoading,
    error,
    refetch: refreshItems,
    invalidateItems,
  };
};
