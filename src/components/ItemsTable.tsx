import React, { useMemo, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridFilterModel,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { Box, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Item } from '@/types/item';
import { format, parseISO } from 'date-fns';
import { ScrollIndicator } from './ScrollIndicator';

interface ItemsTableProps {
  items: Item[];
  loading?: boolean;
  onSortChange?: (model: GridSortModel) => void;
  onFilterChange?: (model: GridFilterModel) => void;
  onPaginationChange?: (model: GridPaginationModel) => void;
}

// Кастомная панель инструментов
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={{
          fileName: 'inventory_report',
          utf8WithBom: true,
        }}
      />
    </GridToolbarContainer>
  );
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  loading = false,
  onSortChange,
  onFilterChange,
  onPaginationChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Состояние пагинации
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  // Преобразуем данные для DataGrid
  const rows: GridRowsProp = useMemo(() => {
    return items.map((item, index) => ({
      id: item.id || index,
      ...item,
      // Форматируем даты для отображения
      createDateFormatted: item.createDate ? 
        format(parseISO(item.createDate), 'yyyy-MM-dd HH:mm') : '',
      updateDateFormatted: item.updateDate ? 
        format(parseISO(item.updateDate), 'yyyy-MM-dd HH:mm') : '',
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
        filterable: true,
        pinned: isMobile ? 'left' : false, // Закрепляем на мобильных
      },
      {
        field: 'article',
        headerName: 'Артикул',
        width: baseWidths.article,
        minWidth: 80,
        sortable: true,
        filterable: true,
        pinned: isMobile ? 'left' : false,
      },
      {
        field: 'shk',
        headerName: 'ШК',
        width: baseWidths.shk,
        minWidth: 100,
        sortable: true,
        filterable: true,
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
        filterable: true,
      },
      {
        field: 'wr_name',
        headerName: 'Название ячейки',
        width: baseWidths.wr_name,
        minWidth: 120,
        sortable: true,
        filterable: true,
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
        filterable: true,
      },
      {
        field: 'condition_state',
        headerName: 'Состояние',
        width: baseWidths.condition_state,
        minWidth: 90,
        sortable: true,
        filterable: true,
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
        minWidth: 100,
        sortable: true,
        filterable: true,
      },
      {
        field: 'expirationDateFormatted',
        headerName: 'СГ',
        width: baseWidths.expiration,
        minWidth: 90,
        sortable: true,
        filterable: true,
      },
      {
        field: 'createDateFormatted',
        headerName: 'Создано',
        width: baseWidths.created,
        minWidth: 100,
        sortable: true,
        filterable: true,
      },
      {
        field: 'updateDateFormatted',
        headerName: 'Изменено',
        width: baseWidths.updated,
        minWidth: 100,
        sortable: true,
        filterable: true,
      },
      {
        field: 'executor',
        headerName: 'Исполнитель',
        width: baseWidths.executor,
        minWidth: 100,
        sortable: true,
        filterable: true,
      },
    ];
  }, [isMobile, isTablet]);

  // Обработчик изменения пагинации
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    onPaginationChange?.(model);
  };

  return (
    <Box sx={{ 
      height: isMobile ? '500px' : '600px',
      minHeight: '400px',
      width: '100%',
      '& .MuiDataGrid-root': {
        border: 'none',
      }
    }}>
      <ScrollIndicator showHint={!isMobile}>
        <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        
        // Пагинация
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        
        // Сортировка и фильтрация
        sortingOrder={['desc', 'asc']}
        onSortModelChange={onSortChange}
        onFilterModelChange={onFilterChange}
        
        // Начальное состояние
        initialState={{
          pagination: {
            paginationModel: { pageSize: 20, page: 0 },
          },
          sorting: {
            sortModel: [{ field: 'name', sort: 'asc' }],
          },
          columns: {
            columnVisibilityModel: {
              // Скрываем некоторые колонки на мобильных
              ...(isMobile && {
                nested_quantity: false,
                id_sklad: false,
                reason: false,
                createDateFormatted: false,
                updateDateFormatted: false,
              }),
            },
          },
        }}
        
        // Компоненты
        slots={{
          toolbar: CustomToolbar,
        }}
        
        // Настройки взаимодействия
        disableRowSelectionOnClick
        checkboxSelection={false}
        disableColumnSelector={isMobile}
        
        // Горизонтальный скролл и адаптивность
        scrollbarSize={17}
        
        sx={{
          // Горизонтальный скролл
          '& .MuiDataGrid-main': {
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '2px solid rgba(25, 118, 210, 0.2)',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              minHeight: '56px !important',
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          },
          
          // Строки таблицы
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            '&:nth-of-type(even)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          },
          
          // Ячейки
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 0.5)',
            fontSize: '0.875rem',
            '&:focus': {
              outline: 'none',
            },
          },
          
          // Закрепленные колонки
          '& .MuiDataGrid-cell--pinnedLeft': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRight: '2px solid rgba(25, 118, 210, 0.2)',
          },
          '& .MuiDataGrid-columnHeader--pinnedLeft': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            borderRight: '2px solid rgba(25, 118, 210, 0.3)',
          },
          
          // Панель инструментов
          '& .MuiDataGrid-toolbarContainer': {
            padding: '8px 16px',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            backgroundColor: 'rgba(248, 249, 250, 1)',
            minHeight: '56px',
          },
          
          // Пагинация
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid rgba(224, 224, 224, 1)',
            backgroundColor: 'rgba(248, 249, 250, 1)',
            minHeight: '56px',
          },
          
          // Скроллбары
          '& .MuiDataGrid-scrollbar--horizontal': {
            '& .MuiDataGrid-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
            },
          },
          '& .MuiDataGrid-scrollbar--vertical': {
            '& .MuiDataGrid-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
            },
          },
          
          // Адаптивность для мобильных
          ...(isMobile && {
            '& .MuiDataGrid-columnHeaders': {
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.75rem',
              padding: '4px 8px',
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '4px 8px',
              flexWrap: 'wrap',
              '& .MuiButton-root': {
                fontSize: '0.75rem',
                padding: '4px 8px',
              },
            },
          }),
        }}
        />
      </ScrollIndicator>
    </Box>
  );
};
