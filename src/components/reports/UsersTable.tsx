import React from 'react';
import { Paper, Typography, Chip, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GroupedDataByExecutor } from '@/types/reports';
import { chartStyle, seriesColors } from '@/theme';
import { DataTable, ReportColumn, toGridColumns } from '../DataTable';

interface UsersTableProps {
  data: GroupedDataByExecutor[];
}

const NO_EXECUTOR_LABEL = 'Без исполнителя (системные)';

// Пустой исполнитель в логах — это системные запросы, а не «null»
const executorName = (e: string | null | undefined) => (e?.trim() ? e.trim() : NO_EXECUTOR_LABEL);

const successColor = (rate: number): 'success' | 'warning' | 'error' => {
  if (rate >= 95) return 'success';
  if (rate >= 80) return 'warning';
  return 'error';
};

const columns: ReportColumn<GroupedDataByExecutor>[] = [
  {
    key: 'executor',
    label: 'Пользователь',
    value: (r) => executorName(r.executor),
    render: (r) => (
      <Typography variant="body2" fontWeight="medium" color={r.executor?.trim() ? 'text.primary' : 'text.secondary'}>
        {executorName(r.executor)}
      </Typography>
    ),
  },
  { key: 'total', label: 'Всего операций', align: 'right', value: (r) => r.total_count },
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
    render: (r) => <Chip label={`${r.success_rate}%`} size="small" color={successColor(parseFloat(r.success_rate))} />,
  },
  { key: 'time', label: 'Ср. время', align: 'right', value: (r) => r.avg_execution_time, render: (r) => `${r.avg_execution_time} ms` },
  { key: 'ips', label: 'IP адресов', align: 'right', value: (r) => r.unique_ips },
];

const gridColumns = toGridColumns(columns);

export const UsersTable: React.FC<UsersTableProps> = ({ data }) => {
  const theme = useTheme();
  const colors = seriesColors[theme.palette.mode];
  const sorted = [...data].sort((a, b) => b.total_count - a.total_count);

  // Топ-8 для круговой диаграммы; остальные — в таблице
  const pieData = sorted.slice(0, 8).map((item) => ({
    name: executorName(item.executor),
    value: item.total_count,
  }));

  return (
    <Box>
      {pieData.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Распределение операций по пользователям
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, x, y, textAnchor }) => (
                  <text x={x} y={y} textAnchor={textAnchor} fill={theme.palette.text.primary} fontSize={12}>
                    {`${name}: ${(percent * 100).toFixed(1)}%`}
                  </text>
                )}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartStyle(theme).tooltip.contentStyle} itemStyle={chartStyle(theme).tooltip.itemStyle} />
              <Legend wrapperStyle={chartStyle(theme).legend.wrapperStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Пользователи (КТО делал)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Детальная статистика по пользователям API. Нажмите на заголовок, чтобы отсортировать.
          </Typography>
        </Box>
        <DataTable
          columns={gridColumns}
          rows={sorted}
          getRowId={(r) => r.executor ?? 'none'}
          storageKey="reports-users"
          exportName="users"
          defaultSort={[{ field: 'total', sort: 'desc' }]}
          height={420}
          emptyText="Нет данных для отображения. Выберите другой период времени."
        />
      </Paper>
    </Box>
  );
};
