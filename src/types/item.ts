export interface Item {
  id?: number;
  name: string;
  article: string;
  shk: string;
  quantity: number; // Кол-во ЕХ
  nested_quantity: number; // Вложенность ЕХ
  product_qnt: number; // Общее количество
  wr_shk: string; // Ячейка хранения
  wr_name: string; // Название ячейки
  id_sklad?: number; // ID склада
  prunit_name: string; // Единица измерения
  condition_state: string; // Состояние товара
  reason: string; // Причина
  expiration_date?: string; // Срок годности
  createDate: string; // Дата создания
  updateDate: string; // Дата обновления
  executor: string; // Исполнитель
}

export interface ApiResponse<T> {
  data: {
    items: T[];
    total?: number;
  };
  success: boolean;
  message?: string;
}

export interface FilterOptions {
  search: string;
  filterType: FilterType;
  warehouse: number;
}

export type FilterType = 
  | 'all' 
  | 'shk' 
  | 'article' 
  | 'cell' 
  | 'cellName' 
  | 'name' 
  | 'executor' 
  | 'condition';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface SortOptions {
  field: keyof Item;
  direction: 'asc' | 'desc';
}
