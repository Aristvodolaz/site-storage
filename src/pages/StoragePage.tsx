import React, { useState, useMemo } from 'react';
import { Box, Container, Alert, Snackbar } from '@mui/material';
import { GridSortModel, GridFilterModel, GridPaginationModel } from '@mui/x-data-grid';

import { Header } from '@/components/Header';
import { SearchFilters } from '@/components/SearchFilters';
import { ItemsTable } from '@/components/ItemsTable';
import { StatusBar } from '@/components/StatusBar';
import { TableStats } from '@/components/TableStats';

import { useItems } from '@/hooks/useItems';
import { filterItems } from '@/utils/filters';
import { exportToExcel } from '@/utils/export';
import { FilterOptions } from '@/types/item';

export const StoragePage: React.FC = () => {
  // Состояние фильтров
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    filterType: 'all',
    warehouse: 1383,
  });

  // Состояние уведомлений
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Загрузка данных
  const { items, isLoading, error, refetch } = useItems(filters.warehouse);

  // Фильтрация данных
  const filteredItems = useMemo(() => {
    return filterItems(items, filters);
  }, [items, filters]);

  // Обработчики
  const handleRefresh = () => {
    refetch();
    setSnackbar({
      open: true,
      message: 'Данные обновляются...',
      severity: 'info',
    });
  };

  const handleExport = async () => {
    try {
      const itemsToExport = filteredItems.length > 0 ? filteredItems : items;
      await exportToExcel(itemsToExport);
      
      setSnackbar({
        open: true,
        message: `Экспортировано ${itemsToExport.length} записей в Excel`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при экспорте данных',
        severity: 'error',
      });
    }
  };

  const handleSortChange = (model: GridSortModel) => {
    // Обработка изменения сортировки, если необходимо
    console.log('Sort model changed:', model);
  };

  const handleFilterChange = (model: GridFilterModel) => {
    // Обработка изменения фильтров DataGrid, если необходимо
    console.log('Filter model changed:', model);
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    // Обработка изменения пагинации, если необходимо
    console.log('Pagination model changed:', model);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Заголовок */}
      <Header
        totalItems={items.length}
        filteredItems={filteredItems.length}
        isLoading={isLoading}
        lastUpdated={new Date()}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Основное содержимое */}
      <Container maxWidth={false} sx={{ flex: 1, py: 2, overflow: 'auto' }}>
        {/* Фильтры */}
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Статистика таблицы */}
        <TableStats
          items={items}
          filteredItems={filteredItems}
          isLoading={isLoading}
        />

        {/* Ошибка загрузки */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Произошла ошибка при загрузке данных'}
          </Alert>
        )}

        {/* Таблица товаров */}
        <ItemsTable
          items={filteredItems}
          loading={isLoading}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onPaginationChange={handlePaginationChange}
        />
      </Container>

      {/* Строка состояния */}
      <StatusBar
        totalItems={items.length}
        filteredItems={filteredItems.length}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        lastUpdated={new Date()}
        searchTerm={filters.search}
      />

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
