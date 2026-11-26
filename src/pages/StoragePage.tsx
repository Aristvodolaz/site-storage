import React, { useCallback, useMemo, useState } from 'react';
import { Box, Container, Alert, Snackbar } from '@mui/material';

import { SearchFilters } from '@/components/SearchFilters';
import { ItemsTable } from '@/components/ItemsTable';
import { StatusBar } from '@/components/StatusBar';
import { TableStats } from '@/components/TableStats';

import { useItems } from '@/hooks/useItems';
import { useWarehouse } from '@/hooks/useWarehouse';
import { filterItems, buildFacets, describeFilters, EMPTY_FILTERS } from '@/utils/filters';
import { exportToExcel, ReportMeta } from '@/utils/export';
import { printReport } from '@/utils/print';
import { FilterOptions } from '@/types/item';

interface StoragePageProps {
  onDataChange?: (data: {
    totalItems: number;
    filteredItems: number;
    isLoading: boolean;
    lastUpdated: Date;
    onRefresh: () => void;
    onExport: () => void;
    onPrint: () => void;
  }) => void;
}

export const StoragePage: React.FC<StoragePageProps> = ({ onDataChange }) => {
  const { warehouse } = useWarehouse();
  const [userFilters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS);
  const filters = useMemo<FilterOptions>(() => ({ ...userFilters, warehouse }), [userFilters, warehouse]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const { items, isLoading, error, refetch } = useItems(filters.warehouse);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [sortModel, setSortModel] = useState<ReportMeta['sortModel']>([]);

  const facets = useMemo(() => buildFacets(items), [items]);

  const filteredItems = useMemo(
    () => filterItems(items, filters),
    [items, filters]
  );

  const reportMeta = useCallback(
    (): ReportMeta => ({
      title: `Отчёт по остаткам склада ${filters.warehouse}`,
      totalQuantity: filteredItems.reduce((s, i) => s + (i.product_qnt || 0), 0),
      filterSummary: describeFilters(filters),
      columnVisibility,
      sortModel,
    }),
    [filters, filteredItems, columnVisibility, sortModel]
  );

  const handleRefresh = useCallback(() => {
    refetch();
    setSnackbar({ open: true, message: 'Данные обновляются…', severity: 'info' });
  }, [refetch]);

  const handleExport = useCallback(() => {
    try {
      if (filteredItems.length === 0) {
        setSnackbar({ open: true, message: 'Нечего экспортировать: список пуст', severity: 'info' });
        return;
      }
      exportToExcel(filteredItems, reportMeta());
      setSnackbar({
        open: true,
        message: `Экспортировано ${filteredItems.length} записей в Excel`,
        severity: 'success',
      });
    } catch (e) {
      console.error('Ошибка экспорта:', e);
      setSnackbar({ open: true, message: 'Ошибка при экспорте данных', severity: 'error' });
    }
  }, [filteredItems, reportMeta]);

  const handlePrint = useCallback(() => {
    if (filteredItems.length === 0) {
      setSnackbar({ open: true, message: 'Нечего печатать: список пуст', severity: 'info' });
      return;
    }
    printReport(filteredItems, reportMeta());
  }, [filteredItems, reportMeta]);

  React.useEffect(() => {
    onDataChange?.({
      totalItems: items.length,
      filteredItems: filteredItems.length,
      isLoading,
      lastUpdated: new Date(),
      onRefresh: handleRefresh,
      onExport: handleExport,
      onPrint: handlePrint,
    });
  }, [
    items.length,
    filteredItems.length,
    isLoading,
    onDataChange,
    handleRefresh,
    handleExport,
    handlePrint,
  ]);

  const handleSnackbarClose = () => setSnackbar((p) => ({ ...p, open: false }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Container maxWidth={false} sx={{ flex: 1, py: 2, overflow: 'auto' }}>
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          facets={facets}
          resultCount={filteredItems.length}
          onExport={handleExport}
          onPrint={handlePrint}
        />

        <TableStats items={items} filteredItems={filteredItems} isLoading={isLoading} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Произошла ошибка при загрузке данных'}
          </Alert>
        )}

        <ItemsTable
          items={filteredItems}
          loading={isLoading}
          onColumnVisibilityChange={setColumnVisibility}
          onSortModelChange={setSortModel}
        />
      </Container>

      <StatusBar
        totalItems={items.length}
        filteredItems={filteredItems.length}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        lastUpdated={new Date()}
        searchTerm={filters.search}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
