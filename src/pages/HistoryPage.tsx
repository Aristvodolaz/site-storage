import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  TablePagination,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { subHours } from 'date-fns';

import { TimeRangeSelector } from '@/components/reports/TimeRangeSelector';
import { useStorageHistory } from '@/hooks/useStorageHistory';
import { TimeRangePreset } from '@/types/reports';
import { StorageOperationType } from '@/types/history';
import { formatDateTime } from '@/utils/formatters';

const OPERATION_LABELS: Record<string, string> = {
  PLACE: 'Размещение',
  MOVE: 'Перемещение',
  PICK: 'Снятие',
};

const OPERATION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  PLACE: 'success',
  MOVE: 'info',
  PICK: 'warning',
};

export const HistoryPage: React.FC = () => {
  const [preset, setPreset] = useState<TimeRangePreset>('last24h');
  const [dateFrom, setDateFrom] = useState(subHours(new Date(), 24).toISOString());
  const [dateTo, setDateTo] = useState(new Date().toISOString());
  const [operationType, setOperationType] = useState<StorageOperationType>('');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [executor, setExecutor] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const filters = useMemo(() => ({
    dateFrom,
    dateTo,
    operationType: operationType || undefined,
    productId: productId.trim() || undefined,
    locationId: locationId.trim() || undefined,
    executor: executor.trim() || undefined,
    limit: pageSize,
    offset: page * pageSize,
  }), [dateFrom, dateTo, operationType, productId, locationId, executor, page, pageSize]);

  const { data, isLoading, error, refetch } = useStorageHistory(filters);

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const columns: GridColDef[] = [
    {
      field: 'executedAt',
      headerName: 'Дата и время',
      width: 160,
      valueFormatter: (params) => formatDateTime(params.value as string),
    },
    {
      field: 'operationType',
      headerName: 'Операция',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={OPERATION_LABELS[params.value as string] || params.value}
          color={OPERATION_COLORS[params.value as string] || 'default'}
        />
      ),
    },
    {
      field: 'productId',
      headerName: 'Артикул',
      width: 140,
    },
    {
      field: 'productName',
      headerName: 'Название',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'fromLocationId',
      headerName: 'Откуда',
      width: 140,
      valueGetter: (params) => params.row.fromLocationId || '—',
    },
    {
      field: 'toLocationId',
      headerName: 'Куда',
      width: 140,
      valueGetter: (params) => params.row.toLocationId || '—',
    },
    {
      field: 'quantity',
      headerName: 'Кол-во',
      width: 100,
      type: 'number',
    },
    {
      field: 'conditionState',
      headerName: 'Состояние',
      width: 120,
      valueGetter: (params) => params.row.conditionState || '—',
    },
    {
      field: 'executor',
      headerName: 'Исполнитель',
      width: 140,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          История операций
        </Typography>

        <TimeRangeSelector
          dateFrom={dateFrom}
          dateTo={dateTo}
          preset={preset}
          onDateFromChange={(value) => {
            setDateFrom(value);
            setPage(0);
          }}
          onDateToChange={(value) => {
            setDateTo(value);
            setPage(0);
          }}
          onPresetChange={(value) => {
            setPreset(value);
            setPage(0);
          }}
          onRefresh={() => refetch()}
        />

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Тип операции"
                value={operationType}
                onChange={(e) => {
                  setOperationType(e.target.value as StorageOperationType);
                  setPage(0);
                }}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="PLACE">Размещение</MenuItem>
                <MenuItem value="MOVE">Перемещение</MenuItem>
                <MenuItem value="PICK">Снятие</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Артикул"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Ячейка"
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Исполнитель"
                value={executor}
                onChange={(e) => {
                  setExecutor(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as Error).message || 'Не удалось загрузить историю операций'}
          </Alert>
        )}

        <Paper sx={{ height: 600, width: '100%' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                hideFooter
                disableRowSelectionOnClick
                sx={{ border: 0, height: 'calc(100% - 52px)' }}
                localeText={{
                  noRowsLabel: 'Нет операций за выбранный период',
                }}
              />
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`
                }
              />
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
