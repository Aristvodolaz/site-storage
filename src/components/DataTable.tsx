import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  gridFilteredSortedRowEntriesSelector,
  gridVisibleColumnDefinitionsSelector,
  useGridApiRef,
  type GridColDef,
  type GridValidRowModel,
  type GridInitialState,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import { Alert, Box, Button, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { FileDownload as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Единая таблица сайта на MUI X DataGrid (бесплатная версия, без Pro-функций).
// Бесплатная версия не даёт менять ширину столбцов вручную, поэтому ширину задает переключатель
// «Узкие / Обычные / Широкие». Также: сортировка по одному столбцу, фильтры, поиск, видимость столбцов,
// выделение строк, виртуализация, экспорт CSV/Excel, серверная пагинация. Настройки по storageKey в localStorage.

const STORAGE_PREFIX = 'datatable:';

type WidthPreset = 'narrow' | 'normal' | 'wide';
const WIDTH_SCALE: Record<WidthPreset, number> = { narrow: 0.75, normal: 1, wide: 1.5 };
const WIDTH_LABELS: Record<WidthPreset, string> = { narrow: 'Узкие', normal: 'Обычные', wide: 'Широкие' };

// Состояние сетки из props DataGrid (тип GridStateCommunity не экспортируется в v6)
type GridState = Parameters<NonNullable<ComponentProps<typeof DataGrid>['onStateChange']>>[0];

interface SavedState {
  columnVisibilityModel: GridState['columns']['columnVisibilityModel'];
  sortModel: GridSortModel;
  filterModel: GridState['filter']['filterModel'];
  widthPreset: WidthPreset;
}

const readSaved = (storageKey?: string): Partial<SavedState> | undefined => {
  if (!storageKey) return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    return raw ? (JSON.parse(raw) as Partial<SavedState>) : undefined;
  } catch {
    return undefined; // приватный режим или битые данные: берем настройки по умолчанию
  }
};

// Сохраняем только модели: состояние сетки содержит служебные данные (sortedRows и т.п.),
// а ширины и порядок колонок в бесплатной версии не меняются пользователем
const writeSaved = (storageKey: string, state: GridState, widthPreset: WidthPreset) => {
  const saved: SavedState = {
    columnVisibilityModel: state.columns.columnVisibilityModel,
    sortModel: state.sorting.sortModel,
    filterModel: state.filter.filterModel,
    widthPreset,
  };
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(saved));
  } catch {
    // хранилище недоступно: настройки действуют до перезагрузки
  }
};

// Экспорт сырых значений: видимые колонки, отсортированные и отфильтрованные строки или выделенные
const exportRows = <T extends GridValidRowModel>(
  rows: T[],
  columns: GridColDef<T>[],
  fileName: string,
  kind: 'csv' | 'xlsx',
) => {
  const headers = columns.map((c) => c.headerName ?? c.field);
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((c, i) => [headers[i], (row as Record<string, unknown>)[c.field] ?? ''])),
  );
  const sheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Данные');
  XLSX.writeFile(book, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.${kind}`, { bookType: kind });
};

// Компоненты для slots вынесены из рендера: иначе при каждом рендере они пересоздаются и теряют фокус
interface ToolbarProps {
  bulkActions?: ReactNode;
  onExport: (kind: 'csv' | 'xlsx') => void;
  widthPreset: WidthPreset;
  onWidthPreset: (preset: WidthPreset) => void;
}

const TableToolbar = ({ bulkActions, onExport, widthPreset, onWidthPreset }: ToolbarProps) => (
  <GridToolbarContainer sx={{ p: 1, gap: 1, flexWrap: 'wrap' }}>
    <GridToolbarQuickFilter debounceMs={300} />
    <Box sx={{ flexGrow: 1 }} />
    {bulkActions}
    <ToggleButtonGroup
      size="small"
      exclusive
      value={widthPreset}
      onChange={(_, v: WidthPreset | null) => v && onWidthPreset(v)}
      aria-label="Ширина столбцов"
    >
      {(Object.keys(WIDTH_LABELS) as WidthPreset[]).map((p) => (
        <ToggleButton key={p} value={p} sx={{ textTransform: 'none', px: 1 }}>
          {WIDTH_LABELS[p]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    <GridToolbarColumnsButton />
    <GridToolbarDensitySelector />
    <Button size="small" startIcon={<DownloadIcon />} onClick={() => onExport('csv')}>
      CSV
    </Button>
    <Button size="small" startIcon={<DownloadIcon />} onClick={() => onExport('xlsx')}>
      Excel
    </Button>
  </GridToolbarContainer>
);

const NoRows = ({ text }: { text: string }) => (
  <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  </Box>
);

const SkeletonRows = () => (
  <Stack spacing={1} sx={{ p: 2, width: '100%' }} role="status" aria-busy="true" aria-label="Загрузка данных">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={28} />
    ))}
  </Stack>
);

/** Колонка отчета: значение для сортировки и своя разметка ячейки */
export interface ReportColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  value: (row: T) => number | string;
  render?: (row: T) => ReactNode;
}

/** Колонки отчетов -> колонки DataGrid; число выводится с разделителями разрядов */
export const toGridColumns = <T extends GridValidRowModel>(cols: ReportColumn<T>[]): GridColDef<T>[] =>
  cols.map((c) => ({
    field: c.key,
    headerName: c.label,
    width: 160,
    align: c.align ?? 'left',
    headerAlign: c.align ?? 'left',
    valueGetter: (p) => c.value(p.row),
    valueFormatter: (p) => (typeof p.value === 'number' ? p.value.toLocaleString('ru-RU') : p.value),
    renderCell: c.render ? (p) => c.render?.(p.row) : undefined,
  }));

export interface ServerPagination {
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export interface DataTableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  getRowId: (row: T) => string | number;
  /** Ключ для сохранения настроек таблицы пользователя; без него настройки не сохраняются */
  storageKey?: string;
  /** Имя файла для экспорта (без расширения) */
  exportName?: string;
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
  defaultSort?: GridSortModel;
  checkboxSelection?: boolean;
  /** Действия над выделенными строками (появляются при выделении) */
  bulkActions?: (selected: T[]) => ReactNode;
  /** Серверная пагинация: без этого пагинация клиентская */
  server?: ServerPagination;
  /** Клиентская пагинация: размер страницы и варианты выбора */
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Колонки, скрытые по умолчанию (пользовательские настройки важнее) */
  hiddenColumns?: string[];
  /** Высота таблицы, виртуализация работает только при фиксированной высоте */
  height?: number;
  /** Подпись над таблицей, например итоги */
  caption?: ReactNode;
  /** Видимость столбцов (поле → видим ли); вызывается при старте и при каждом изменении */
  onColumnVisibilityChange?: (model: Record<string, boolean>) => void;
  /** Текущая сортировка сетки; вызывается при старте и при каждом изменении */
  onSortModelChange?: (model: GridSortModel) => void;
}

export function DataTable<T extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  storageKey,
  exportName = 'export',
  loading = false,
  error = null,
  emptyText = 'Нет данных для отображения',
  defaultSort,
  checkboxSelection = false,
  bulkActions,
  server,
  pageSize = 25,
  pageSizeOptions = [25, 50, 100],
  hiddenColumns = [],
  height = 560,
  caption,
  onColumnVisibilityChange,
  onSortModelChange,
}: DataTableProps<T>) {
  const apiRef = useGridApiRef();
  const saved = useMemo(() => readSaved(storageKey), [storageKey]);
  // начальная видимость фиксируется при монтировании, дальше ее ведет сама сетка
  const [initialVisibility] = useState(
    () => saved?.columnVisibilityModel ?? Object.fromEntries(hiddenColumns.map((f) => [f, false])),
  );

  const [initialSort] = useState<GridSortModel>(() => saved?.sortModel ?? defaultSort ?? []);

  useEffect(() => {
    onColumnVisibilityChange?.(initialVisibility);
    onSortModelChange?.(initialSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при монтировании
  }, []);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [widthPreset, setWidthPreset] = useState<WidthPreset>(saved?.widthPreset ?? 'normal');

  const selected = useMemo(() => {
    const ids = new Set(selectionModel);
    return rows.filter((r) => ids.has(getRowId(r)));
  }, [rows, selectionModel, getRowId]);

  // Ширина колонок задается здесь, поэтому flex у колонок снимаем: иначе переключатель не работает
  const scaledColumns = useMemo(
    () =>
      columns.map((c) => ({
        ...c,
        flex: undefined,
        width: Math.round((c.width ?? 120) * WIDTH_SCALE[widthPreset]),
      })),
    [columns, widthPreset],
  );

  const initialState: GridInitialState = {
    columns: {
      columnVisibilityModel: initialVisibility,
    },
    sorting: { sortModel: initialSort },
    filter: saved?.filterModel ? { filterModel: saved.filterModel } : undefined,
    pagination: server ? undefined : { paginationModel: { pageSize, page: 0 } },
  };

  const changeWidth = (preset: WidthPreset) => {
    setWidthPreset(preset);
    if (storageKey) writeSaved(storageKey, apiRef.current.state, preset);
  };

  const handleExport = (kind: 'csv' | 'xlsx') => {
    const visible = gridVisibleColumnDefinitionsSelector(apiRef).filter((c) => c.field !== '__check__');
    const rowsToExport = selected.length > 0
      ? selected
      : gridFilteredSortedRowEntriesSelector(apiRef).map((e) => e.model as T);
    exportRows(rowsToExport, visible as GridColDef<T>[], exportName, kind);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {caption && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {caption}
        </Typography>
      )}
      <Box sx={{ height, width: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={scaledColumns}
          getRowId={getRowId}
          loading={loading}
          initialState={initialState}
          onStateChange={(state) => {
            if (storageKey) writeSaved(storageKey, state, widthPreset);
          }}
          onColumnVisibilityModelChange={(model) => onColumnVisibilityChange?.(model)}
          onSortModelChange={(model) => onSortModelChange?.(model)}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
          pageSizeOptions={pageSizeOptions}
          {...(server
            ? {
                paginationMode: 'server' as const,
                rowCount: server.rowCount,
                paginationModel: server.paginationModel,
                onPaginationModelChange: server.onPaginationModelChange,
              }
            : {})}
          slots={{
            toolbar: TableToolbar,
            loadingOverlay: SkeletonRows,
            noRowsOverlay: () => <NoRows text={emptyText} />,
          }}
          slotProps={{
            toolbar: {
              bulkActions: selected.length > 0 && bulkActions ? bulkActions(selected) : null,
              onExport: handleExport,
              widthPreset,
              onWidthPreset: changeWidth,
            } as ToolbarProps,
          }}
          sx={{ border: 0 }}
        />
      </Box>
    </Box>
  );
}
