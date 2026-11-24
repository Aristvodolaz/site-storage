import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StorageApi } from '@/services/api';
import type { Item } from '@/types/item';

// Нулевые остатки (Кол-во ЕХ = 0) — мусорные строки, не показываем их нигде.
// Вынесено из хука, чтобы select не пересоздавался на каждом рендере.
const dropZeroQuantity = (data: Item[]) => data.filter((item) => item.quantity !== 0);

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
    select: dropZeroQuantity,
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchInterval: 5 * 60 * 1000, // Автообновление каждые 5 минут
    // Большой ответ: повтор при таймауте усиливает нагрузку, один повтор достаточен
    retry: 1,
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
