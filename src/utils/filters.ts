import { Item, FilterOptions, FilterType } from '@/types/item';

/** Значение в FilterOptions.executors, обозначающее «строки без исполнителя». */
export const NO_EXECUTOR = '__none__';

/** Фильтры по умолчанию (ничего не выбрано). warehouse задаётся отдельно. */
export const EMPTY_FILTERS: FilterOptions = {
  search: '',
  filterType: 'all',
  warehouse: 1383,
  condition: 'all',
  prunitNames: [],
  executors: [],
  sections: [],
  expiration: 'all',
  reason: 'all',
  qtyMin: null,
  qtyMax: null,
  updatedFrom: '',
  updatedTo: '',
};

const isEmptyExpiration = (value?: string): boolean =>
  !value || value === '2999-01-01' || value.startsWith('2999-');

/** Секция ячейки — префикс названия до первого разделителя: "01-106-5" -> "01". */
export const getSection = (wrName: string): string => {
  const match = /^\s*([0-9A-Za-zА-Яа-я]+)\s*[-.]/.exec(wrName || '');
  return match ? match[1] : (wrName || '').trim();
};

/** Дата в виде yyyy-MM-dd из ISO/строки (для сравнения диапазонов). */
const toDateKey = (value?: string): string => {
  if (!value) return '';
  const s = String(value);
  // ISO или "yyyy-MM-dd HH:mm:ss"
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};

export interface FilterFacets {
  conditions: string[];
  prunitNames: string[];
  executors: string[];
  hasNoExecutor: boolean;
  sections: string[];
}

/** Собирает списки доступных значений для выпадающих фильтров из загруженных данных. */
export const buildFacets = (items: Item[]): FilterFacets => {
  const conditions = new Set<string>();
  const prunitNames = new Set<string>();
  const executors = new Set<string>();
  const sections = new Set<string>();
  let hasNoExecutor = false;

  for (const item of items) {
    if (item.condition_state) conditions.add(item.condition_state);
    if (item.prunit_name) prunitNames.add(item.prunit_name);
    if (item.executor) executors.add(item.executor);
    else hasNoExecutor = true;
    const section = getSection(item.wr_name);
    if (section) sections.add(section);
  }

  const byRu = (a: string, b: string) => a.localeCompare(b, 'ru');
  const bySectionNum = (a: string, b: string) => {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b, 'ru');
  };

  return {
    conditions: [...conditions].sort(byRu),
    prunitNames: [...prunitNames].sort(byRu),
    executors: [...executors].sort(byRu),
    hasNoExecutor,
    sections: [...sections].sort(bySectionNum),
  };
};

/** true, если строка проходит текстовый поиск по выбранной области. */
const matchesSearch = (item: Item, term: string, type: FilterType): boolean => {
  if (!term) return true;
  const t = term.toLowerCase();
  const has = (v?: string) => (v || '').toLowerCase().includes(t);

  switch (type) {
    case 'shk':
      return has(item.shk);
    case 'article':
      return has(item.article);
    case 'cell':
      return has(item.wr_shk) || has(item.wr_name);
    case 'cellName':
      return has(item.wr_name);
    case 'name':
      return has(item.name);
    case 'executor':
      return has(item.executor);
    case 'condition':
      return has(item.condition_state);
    case 'all':
    default:
      return (
        has(item.name) ||
        has(item.article) ||
        has(item.shk) ||
        has(item.wr_shk) ||
        has(item.wr_name) ||
        has(item.executor) ||
        has(item.condition_state) ||
        has(item.prunit_name) ||
        has(item.reason)
      );
  }
};

/** Основная функция фильтрации — применяет все критерии сразу. */
export const filterItems = (items: Item[], filters: FilterOptions): Item[] => {
  const search = filters.search.trim().toLowerCase();
  const executorSet = new Set(filters.executors);
  const prunitSet = new Set(filters.prunitNames);
  const sectionSet = new Set(filters.sections);
  const fromKey = filters.updatedFrom ? toDateKey(filters.updatedFrom) : '';
  const toKey = filters.updatedTo ? toDateKey(filters.updatedTo) : '';

  return items.filter((item) => {
    if (!matchesSearch(item, search, filters.filterType)) return false;

    if (filters.condition !== 'all' && item.condition_state !== filters.condition) {
      return false;
    }

    if (prunitSet.size > 0 && !prunitSet.has(item.prunit_name)) return false;

    if (executorSet.size > 0) {
      const key = item.executor ? item.executor : NO_EXECUTOR;
      if (!executorSet.has(key)) return false;
    }

    if (sectionSet.size > 0 && !sectionSet.has(getSection(item.wr_name))) return false;

    if (filters.expiration !== 'all') {
      const empty = isEmptyExpiration(item.expiration_date);
      if (filters.expiration === 'with' && empty) return false;
      if (filters.expiration === 'without' && !empty) return false;
    }

    if (filters.reason !== 'all') {
      const hasReason = Boolean((item.reason || '').trim());
      if (filters.reason === 'with' && !hasReason) return false;
      if (filters.reason === 'without' && hasReason) return false;
    }

    if (filters.qtyMin !== null && item.product_qnt < filters.qtyMin) return false;
    if (filters.qtyMax !== null && item.product_qnt > filters.qtyMax) return false;

    if (fromKey || toKey) {
      const key = toDateKey(item.updateDate);
      if (!key) return false;
      if (fromKey && key < fromKey) return false;
      if (toKey && key > toKey) return false;
    }

    return true;
  });
};

/** Количество активных (непустых) фильтров — для бейджа. */
export const countActiveFilters = (f: FilterOptions): number => {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.condition !== 'all') n++;
  if (f.prunitNames.length) n++;
  if (f.executors.length) n++;
  if (f.sections.length) n++;
  if (f.expiration !== 'all') n++;
  if (f.reason !== 'all') n++;
  if (f.qtyMin !== null || f.qtyMax !== null) n++;
  if (f.updatedFrom || f.updatedTo) n++;
  return n;
};

/** Человекочитаемое описание активных фильтров — для шапки печати и листа Excel. */
export const describeFilters = (f: FilterOptions): { label: string; value: string }[] => {
  const rows: { label: string; value: string }[] = [];
  rows.push({ label: 'Склад', value: String(f.warehouse) });

  if (f.search.trim()) {
    rows.push({ label: 'Поиск', value: `${f.search.trim()} (${filterTypeLabel(f.filterType)})` });
  }
  if (f.condition !== 'all') rows.push({ label: 'Состояние', value: f.condition });
  if (f.prunitNames.length) rows.push({ label: 'ЕХ', value: f.prunitNames.join(', ') });
  if (f.executors.length) {
    rows.push({
      label: 'Исполнитель',
      value: f.executors.map((e) => (e === NO_EXECUTOR ? 'Без исполнителя' : e)).join(', '),
    });
  }
  if (f.sections.length) rows.push({ label: 'Секции', value: f.sections.join(', ') });
  if (f.expiration !== 'all') {
    rows.push({ label: 'Срок годности', value: f.expiration === 'with' ? 'только с СГ' : 'только без СГ' });
  }
  if (f.reason !== 'all') {
    rows.push({ label: 'Причина', value: f.reason === 'with' ? 'только с причиной' : 'только без причины' });
  }
  if (f.qtyMin !== null || f.qtyMax !== null) {
    rows.push({
      label: 'Общее кол-во',
      value: `${f.qtyMin ?? '—'} … ${f.qtyMax ?? '—'}`,
    });
  }
  if (f.updatedFrom || f.updatedTo) {
    rows.push({ label: 'Изменено', value: `${f.updatedFrom || '…'} — ${f.updatedTo || '…'}` });
  }
  return rows;
};

export const filterTypeLabel = (type: FilterType): string => {
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

/** @deprecated используйте filterTypeLabel */
export const getFilterTypeLabel = filterTypeLabel;
