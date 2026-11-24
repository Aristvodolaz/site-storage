import React from 'react';
import { Paper, Typography, Chip, Box } from '@mui/material';
import { OperationLogDetail } from '@/types/reports';
import { format } from 'date-fns';
import { ReportTable, ReportColumn } from './ReportTable';

interface DetailsTableProps {
  data: OperationLogDetail[];
}

const NO_EXECUTOR_LABEL = 'Без исполнителя';

const statusColor = (code: number): 'success' | 'warning' | 'error' | 'default' => {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'default';
  if (code >= 400 && code < 500) return 'warning';
  return 'error';
};

const methodColor = (method: string): 'primary' | 'secondary' | 'info' | 'warning' => {
  switch (method.toUpperCase()) {
    case 'GET': return 'info';
    case 'POST': return 'primary';
    case 'PUT':
    case 'PATCH': return 'warning';
    case 'DELETE': return 'secondary';
    default: return 'primary';
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm:ss');
  } catch {
    return dateString;
  }
};

const columns: ReportColumn<OperationLogDetail>[] = [
  {
    key: 'time',
    label: 'Время',
    value: (r) => r.created_at, // ISO-строка сортируется корректно
    render: (r) => <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</Typography>,
  },
  {
    key: 'executor',
    label: 'Пользователь (КТО)',
    value: (r) => r.executor?.trim() || NO_EXECUTOR_LABEL,
    render: (r) => (
      <Chip
        label={r.executor?.trim() || NO_EXECUTOR_LABEL}
        size="small"
        variant="outlined"
        color={r.executor?.trim() ? 'primary' : 'default'}
      />
    ),
  },
  {
    key: 'method',
    label: 'Метод',
    value: (r) => r.http_method,
    render: (r) => <Chip label={r.http_method} size="small" color={methodColor(r.http_method)} />,
  },
  {
    key: 'endpoint',
    label: 'Endpoint (ГДЕ)',
    value: (r) => r.endpoint,
    render: (r) => (
      <Typography
        variant="body2"
        title={r.endpoint}
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {r.endpoint}
      </Typography>
    ),
  },
  {
    key: 'status',
    label: 'Статус',
    align: 'center',
    value: (r) => r.status_code,
    render: (r) => <Chip label={r.status_code ?? '—'} size="small" color={statusColor(r.status_code)} />,
  },
  {
    key: 'ms',
    label: 'Время выполнения',
    align: 'right',
    value: (r) => r.execution_time_ms ?? -1, // у 404 и части ошибок времени нет
    render: (r) =>
      r.execution_time_ms == null ? (
        <Typography variant="body2" color="text.secondary">—</Typography>
      ) : (
        <Typography variant="body2" color={r.execution_time_ms > 1000 ? 'error.main' : 'text.primary'}>
          {r.execution_time_ms.toLocaleString('ru-RU')} ms
        </Typography>
      ),
  },
  {
    key: 'result',
    label: 'Результат',
    value: (r) => r.operation_result,
    render: (r) => (
      <Chip label={r.operation_result} size="small" color={r.operation_result === 'success' ? 'success' : 'error'} />
    ),
  },
];

export const DetailsTable: React.FC<DetailsTableProps> = ({ data }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Детальные логи операций
    </Typography>
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        КТО, ЧТО и ГДЕ — полная информация о каждой операции (до 1000 последних записей)
      </Typography>
    </Box>
    <ReportTable
      columns={columns}
      rows={data}
      rowKey={(r) => r.id}
      defaultSortKey="time"
      maxHeight={600}
      emptyText="Нет операций за выбранный период"
    />
  </Paper>
);
