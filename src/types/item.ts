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

export type TriState = 'all' | 'with' | 'without';

export interface FilterOptions {
  /** Свободный текстовый поиск */
  search: string;
  /** Область текстового поиска */
  filterType: FilterType;
  /** Склад (id_sklad) */
  warehouse: number;
  /** Точное состояние товара ('all' — любое) */
  condition: string;
  /** Единицы хранения (ЕХ), пустой массив — любые */
  prunitNames: string[];
  /** Исполнители, пустой массив — любые. NO_EXECUTOR — строки без исполнителя */
  executors: string[];
  /** Секции ячеек (1-й сегмент названия ячейки до первого "-"), пустой массив — любые */
  sections: string[];
  /** Стеллажи (2-й сегмент названия ячейки, между 1-м и 2-м "-"), пустой массив — любые */
  racks: string[];
  /** Наличие срока годности */
  expiration: TriState;
  /** Наличие причины */
  reason: TriState;
  /** Минимальное общее количество */
  qtyMin: number | null;
  /** Максимальное общее количество */
  qtyMax: number | null;
  /** Дата изменения: с (yyyy-MM-dd) */
  updatedFrom: string;
  /** Дата изменения: по (yyyy-MM-dd) */
  updatedTo: string;
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
