import { Item, FilterOptions, FilterType } from '@/types/item';

export const filterItems = (items: Item[], filters: FilterOptions): Item[] => {
  if (!filters.search.trim()) {
    return items;
  }

  const searchTerm = filters.search.toLowerCase();

  return items.filter((item) => {
    switch (filters.filterType) {
      case 'all':
        return (
          item.name.toLowerCase().includes(searchTerm) ||
          item.article.toLowerCase().includes(searchTerm) ||
          item.shk.toLowerCase().includes(searchTerm) ||
          item.wr_shk.toLowerCase().includes(searchTerm) ||
          item.wr_name.toLowerCase().includes(searchTerm) ||
          item.executor.toLowerCase().includes(searchTerm) ||
          item.condition_state.toLowerCase().includes(searchTerm) ||
          item.prunit_name.toLowerCase().includes(searchTerm)
        );
      case 'shk':
        return item.shk.toLowerCase().includes(searchTerm);
      case 'article':
        return item.article.toLowerCase().includes(searchTerm);
      case 'cell':
        return (
          item.wr_shk.toLowerCase().includes(searchTerm) ||
          item.wr_name.toLowerCase().includes(searchTerm)
        );
      case 'cellName':
        return item.wr_name.toLowerCase().includes(searchTerm);
      case 'name':
        return item.name.toLowerCase().includes(searchTerm);
      case 'executor':
        return item.executor.toLowerCase().includes(searchTerm);
      case 'condition':
        return item.condition_state.toLowerCase().includes(searchTerm);
      default:
        return true;
    }
  });
};

export const getFilterTypeLabel = (type: FilterType): string => {
  const labels: Record<FilterType, string> = {
    all: 'Все поля',
    shk: 'ШК',
    article: 'Артикул',
    cell: 'Ячейка',
    cellName: 'Название ячейки',
    name: 'Название',
    executor: 'Исполнитель',
    condition: 'Состояние',
  };

  return labels[type] || 'Все поля';
};
