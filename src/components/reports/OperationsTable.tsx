import React from 'react';
import { Paper, Typography, Chip, Box } from '@mui/material';
import { GroupedDataByEndpoint } from '@/types/reports';
import { DataTable, ReportColumn, toGridColumns } from '../DataTable';

interface OperationsTableProps {
  data: GroupedDataByEndpoint[];
}

const successColor = (rate: number): 'success' | 'warning' | 'error' => {
  if (rate >= 95) return 'success';
  if (rate >= 80) return 'warning';
  return 'error';
};

const columns: ReportColumn<GroupedDataByEndpoint>[] = [
  {
    key: 'endpoint',
    label: 'Endpoint',
    value: (r) => r.endpoint,
    render: (r) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {r.endpoint}
      </Typography>
    ),
  },
  { key: 'total', label: 'Всего', align: 'right', value: (r) => r.total_count },
  {
    key: 'success',
    label: 'Успешно',
    align: 'right',
    value: (r) => r.success_count,
    render: (r) => <Typography component="span" variant="body2" color="success.main">{r.success_count.toLocaleString('ru-RU')}</Typography>,
  },
  {
    key: 'error',
    label: 'Ошибки',
    align: 'right',
    value: (r) => r.error_count,
    render: (r) => <Typography component="span" variant="body2" color="error.main">{r.error_count.toLocaleString('ru-RU')}</Typography>,
  },
  {
    key: 'rate',
    label: 'Success Rate',
    align: 'center',
    value: (r) => parseFloat(r.success_rate),
    render: (r) => (
      <Chip label={`${r.success_rate}%`} size="small" color={successColor(parseFloat(r.success_rate))} />
    ),
  },
  { key: 'time', label: 'Ср. время', align: 'right', value: (r) => r.avg_execution_time, render: (r) => `${r.avg_execution_time} ms` },
  { key: 'users', label: 'Пользователей', align: 'right', value: (r) => r.unique_executors },
];

const gridColumns = toGridColumns(columns);

export const OperationsTable: React.FC<OperationsTableProps> = ({ data }) => {
  // Топ-20 по количеству; сортировка по любой колонке — на клик по заголовку
  const top = [...data].sort((a, b) => b.total_count - a.total_count).slice(0, 20);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Операции (ЧТО делали)
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Топ-20 самых частых операций
        </Typography>
      </Box>
      <DataTable
        columns={gridColumns}
        rows={top}
        getRowId={(r) => r.endpoint}
        storageKey="reports-operations"
        exportName="operations"
        defaultSort={[{ field: 'total', sort: 'desc' }]}
        height={420}
        emptyText="Нет данных для отображения. Выберите другой период времени."
      />
    </Paper>
  );
};
