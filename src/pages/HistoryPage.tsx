import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DataTable } from '@/components/DataTable';
import { subHours } from 'date-fns';

import { TimeRangeSelector, getDateRangeFromPreset } from '@/components/reports/TimeRangeSelector';
import { useStorageHistory } from '@/hooks/useStorageHistory';
import { useWarehouse } from '@/hooks/useWarehouse';
import { TimeRangePreset } from '@/types/reports';
import { StorageOperationType } from '@/types/history';
import { formatDateTime } from '@/utils/formatters';

const OPERATION_LABELS: Record<string, string> = {
  PLACE: 'Размещение',
  MOVE: 'Перемещение',
  PICK: 'Снятие',
  INVENTORY: 'Инвентаризация',
};

const OPERATION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  PLACE: 'success',
  MOVE: 'info',
  PICK: 'warning',
  INVENTORY: 'default',
};

// Окно дат сдвигаем раз в минуту, а не каждые 10 сек: иначе каждый тик создаёт новый
// запрос, старые копятся и сервер не успевает ответить (таймауты)
const LIVE_WINDOW_MS = 60_000;

const floorToMinute = (iso: string) => {
  const d = new Date(iso);
  d.setSeconds(0, 0);
  return d.toISOString();
};

// Конец окна округляем вверх до минуты, чтобы текущая минута попадала в выборку
const ceilToMinute = (iso: string) => {
  const d = new Date(iso);
  d.setSeconds(0, 0);
  return new Date(d.getTime() + 60_000).toISOString();
};

export const HistoryPage: React.FC = () => {
  const [preset, setPreset] = useState<TimeRangePreset>('last24h');
  const [dateFrom, setDateFrom] = useState(subHours(new Date(), 24).toISOString());
  const [dateTo, setDateTo] = useState(new Date().toISOString());
  const [operationType, setOperationType] = useState<StorageOperationType>('');
  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [executor, setExecutor] = useState('');
  const { warehouse } = useWarehouse();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // Сдвигаем «дата окончания» к now, иначе новые операции не попадают в фильтр
  const refreshDateWindow = () => {
    if (preset === 'custom' || preset === 'yesterday') return;
    const range = getDateRangeFromPreset(preset);
    if (!range.from || !range.to) return;
    setDateFrom(floorToMinute(range.from));
    setDateTo(ceilToMinute(range.to));
  };

  useEffect(() => {
    if (preset === 'custom' || preset === 'yesterday') return undefined;

    refreshDateWindow();
    const timer = window.setInterval(refreshDateWindow, LIVE_WINDOW_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const filters = useMemo(() => ({
    dateFrom,
    dateTo,
    operationType: operationType || undefined,
    productId: productId.trim() || undefined,
    locationId: locationId.trim() || undefined,
    executor: executor.trim() || undefined,
    id_sklad: warehouse,
    limit: pageSize,
    offset: page * pageSize,
  }), [dateFrom, dateTo, operationType, productId, locationId, executor, warehouse, page, pageSize]);

  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useStorageHistory(filters);

  const handleRefresh = () => {
    refreshDateWindow();
    void refetch();
  };

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
      field: 'fromLocationName',
      headerName: 'Название ячейки (откуда)',
      width: 170,
      valueGetter: (params) => params.row.fromLocationName || '—',
    },
    {
      field: 'toLocationId',
      headerName: 'Куда',
      width: 140,
      valueGetter: (params) => params.row.toLocationId || '—',
    },
    {
      field: 'toLocationName',
      headerName: 'Название ячейки (куда)',
      width: 170,
      valueGetter: (params) => params.row.toLocationName || '—',
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
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          История операций
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Онлайн-обновление каждые 10 сек
          {dataUpdatedAt
            ? ` · обновлено ${new Date(dataUpdatedAt).toLocaleTimeString()}`
            : ''}
          {isFetching && !isLoading ? ' · загрузка…' : ''}
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
          onRefresh={handleRefresh}
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
                <MenuItem value="INVENTORY">Инвентаризация</MenuItem>
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

        <Paper sx={{ p: 2 }}>
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading}
            error={error ? (error as Error).message || 'Не удалось загрузить историю операций' : null}
            storageKey="history"
            checkboxSelection
            exportName="history"
            emptyText="Нет операций за выбранный период"
            caption={`Найдено операций: ${total.toLocaleString('ru-RU')}`}
            height={600}
            server={{
              rowCount: total,
              paginationModel: { page, pageSize },
              onPaginationModelChange: (m) => {
                setPage(m.page);
                setPageSize(m.pageSize);
              },
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};
