import { useMemo } from 'react';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Box, Chip, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { Item } from '@/types/item';
import { format, parseISO, isValid } from 'date-fns';
import { ScrollIndicator } from './ScrollIndicator';
import { DataTable } from './DataTable';
import { naturalCompare, formatCellName } from '@/utils/filters';

interface ItemsTableProps {
  items: Item[];
  loading?: boolean;
  onColumnVisibilityChange?: (model: Record<string, boolean>) => void;
  onSortModelChange?: (model: GridSortModel) => void;
}

// Некорректная/пустая дата в данных не должна ронять всю страницу (RangeError в date-fns).
const safeFormatDate = (value?: string): string => {
  if (!value) return '';
  const date = parseISO(String(value));
  return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : String(value);
};

export const ItemsTable = ({ items, loading = false, onColumnVisibilityChange, onSortModelChange }: ItemsTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Преобразуем данные для DataGrid
  const rows = useMemo(() => {
    return items.map((item, index) => ({
      id: item.id || index,
      ...item,
      // Форматируем даты для отображения
      createDateFormatted: safeFormatDate(item.createDate),
      updateDateFormatted: safeFormatDate(item.updateDate),
      expirationDateFormatted: item.expiration_date === '2999-01-01'
        ? 'СГ отсутствует' 
        : item.expiration_date || '',
    }));
  }, [items]);

  // Определяем колонки таблицы с адаптивными размерами
  const columns: GridColDef[] = useMemo(() => {
    // Базовые размеры колонок
    const baseWidths = {
      name: isMobile ? 200 : isTablet ? 300 : 350,
      article: isMobile ? 100 : 120,
      shk: isMobile ? 120 : 150,
      quantity: isMobile ? 80 : 100,
      nested_quantity: isMobile ? 100 : 130,
      product_qnt: isMobile ? 90 : 120,
      wr_shk: isMobile ? 100 : 120,
      wr_name: isMobile ? 150 : 180,
      id_sklad: isMobile ? 80 : 100,
      prunit_name: 80,
      condition_state: isMobile ? 100 : 120,
      reason: isMobile ? 120 : 150,
      expiration: isMobile ? 100 : 120,
      created: isMobile ? 120 : 140,
      updated: isMobile ? 120 : 140,
      executor: isMobile ? 120 : 150,
    };

    return [
      {
        field: 'name',
        headerName: 'Название',
        width: baseWidths.name,
        minWidth: 150,
        flex: isMobile ? 0 : 1,
        sortable: true,
        filterable: false,
      },
      {
        field: 'article',
        headerName: 'Артикул',
        width: baseWidths.article,
        minWidth: 80,
        sortable: true,
        filterable: false,
      },
      {
        field: 'shk',
        headerName: 'ШК',
        width: baseWidths.shk,
        minWidth: 100,
        sortable: true,
        filterable: false,
      },
      {
        field: 'quantity',
        headerName: 'Кол-во ЕХ',
        type: 'number',
        width: baseWidths.quantity,
        minWidth: 70,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'nested_quantity',
        headerName: 'Вложенность ЕХ',
        type: 'number',
        width: baseWidths.nested_quantity,
        minWidth: 90,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'product_qnt',
        headerName: 'Общее кол-во',
        type: 'number',
        width: baseWidths.product_qnt,
        minWidth: 80,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'wr_shk',
        headerName: 'Ячейка',
        width: baseWidths.wr_shk,
        minWidth: 80,
        sortable: true,
        filterable: false,
      },
      {
        field: 'wr_name',
        headerName: 'Название ячейки',
        width: baseWidths.wr_name,
        minWidth: 120,
        sortable: true,
        filterable: false,
        sortComparator: naturalCompare,
        valueFormatter: (params) => formatCellName(params.value),
      },
      {
        field: 'id_sklad',
        headerName: 'ID склада',
        type: 'number',
        width: baseWidths.id_sklad,
        minWidth: 70,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'prunit_name',
        headerName: 'ЕХ',
        width: baseWidths.prunit_name,
        minWidth: 60,
        sortable: true,
        filterable: false,
      },
      {
        field: 'condition_state',
        headerName: 'Состояние',
        width: baseWidths.condition_state,
        minWidth: 90,
        sortable: true,
        filterable: false,
        renderCell: (params) => {
          const isDefective = params.value && params.value.toLowerCase().includes('некондиц');
          return (
            <Chip
              label={params.value || 'Не указано'}
              color={isDefective ? 'error' : 'default'}
              variant={isDefective ? 'filled' : 'outlined'}
              size="small"
            />
          );
        },
      },
      {
        field: 'reason',
        headerName: 'Причина',
        width: baseWidths.reason,
        minWidth: 120,
        sortable: true,
        filterable: false,
        renderCell: (params) => {
          const reason: string = params.value || '';
          const conditionState: string = params.row.condition_state || '';
          const isBlocked = reason === 'Блокировка для использования';
          const isUncertain = !isBlocked && (conditionState === 'BAD' || conditionState.toLowerCase().includes('некондиц'));
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
              {isBlocked && (
                <Tooltip title="Заблокировано для использования">
                  <Chip
                    label="✕"
                    size="small"
                    sx={{ bgcolor: 'error.main', color: 'error.contrastText', fontWeight: 'bold', minWidth: 28, height: 20, fontSize: '11px' }}
                  />
                </Tooltip>
              )}
              {isUncertain && (
                <Tooltip title="Неопределённый статус">
                  <Chip
                    label="?"
                    size="small"
                    sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', fontWeight: 'bold', minWidth: 28, height: 20, fontSize: '11px' }}
                  />
                </Tooltip>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {reason}
              </span>
            </Box>
          );
        },
      },
      {
        field: 'expirationDateFormatted',
        headerName: 'СГ',
        width: baseWidths.expiration,
        minWidth: 90,
        sortable: true,
        filterable: false,
      },
      {
        field: 'createDateFormatted',
        headerName: 'Создано',
        width: baseWidths.created,
        minWidth: 100,
        sortable: true,
        filterable: false,
      },
      {
        field: 'updateDateFormatted',
        headerName: 'Изменено',
        width: baseWidths.updated,
        minWidth: 100,
        sortable: true,
        filterable: false,
      },
      {
        field: 'executor',
        headerName: 'Исполнитель',
        width: baseWidths.executor,
        minWidth: 100,
        sortable: true,
        filterable: false,
      },
    ];
  }, [isMobile, isTablet]);


  return (
    <ScrollIndicator showHint={!isMobile}>
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        storageKey="items"
        checkboxSelection
        exportName="inventory_report"
        defaultSort={[{ field: 'name', sort: 'asc' }]}
        hiddenColumns={isMobile ? ['nested_quantity', 'id_sklad', 'reason', 'createDateFormatted', 'updateDateFormatted'] : []}
        pagination={false}
        height={isMobile ? 500 : 600}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onSortModelChange={onSortModelChange}
      />
    </ScrollIndicator>
  );
};
