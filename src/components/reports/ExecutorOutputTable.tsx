import React, { useMemo } from 'react';
import { Paper, Typography, Box, Alert, CircularProgress, useTheme } from '@mui/material';
import { useExecutorOutput } from '@/hooks/useReports';
import { useWarehouse } from '@/hooks/useWarehouse';
import type { ExecutorOutputRow } from '@/types/reports';
import { ReportTable, ReportColumn } from './ReportTable';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { chartStyle, seriesColors } from '@/theme';

type OpType = ExecutorOutputRow['operationType'];

const OP_COLUMNS: { type: OpType; label: string }[] = [
  { type: 'PLACE', label: 'Приход' },
  { type: 'PICK', label: 'Расход' },
  { type: 'INVENTORY', label: 'Инвент' },
  { type: 'MOVE', label: 'Перемещение' },
];

interface OutputRow {
  name: string; // '' = системные операции без исполнителя
  counts: Partial<Record<OpType, number>>;
  total: number;
}

// Сводит строки (исполнитель, тип) в одну строку на исполнителя
const buildRows = (data: ExecutorOutputRow[]): OutputRow[] => {
  const map = new Map<string, OutputRow>();
  for (const r of data) {
    const name = r.executor?.trim() ?? '';
    let row = map.get(name);
    if (!row) {
      row = { name, counts: {}, total: 0 };
      map.set(name, row);
    }
    row.counts[r.operationType] = (row.counts[r.operationType] ?? 0) + r.cnt;
    row.total += r.cnt;
  }
  return [...map.values()];
};

const buildColumns = (firstLabel: string): ReportColumn<OutputRow>[] => [
  {
    key: 'name',
    label: firstLabel,
    value: (r) => r.name || 'Без исполнителя',
  },
  ...OP_COLUMNS.map((c) => ({
    key: c.type,
    label: c.label,
    align: 'right' as const,
    value: (r: OutputRow) => r.counts[c.type] ?? 0,
  })),
  { key: 'total', label: 'Итого', align: 'right', value: (r) => r.total },
];

// Итоги по колонкам для строки footer
const sumFooter = (rows: OutputRow[]): Record<string, React.ReactNode> => {
  const footer: Record<string, React.ReactNode> = { name: 'Итого' };
  for (const c of OP_COLUMNS) {
    footer[c.type] = rows.reduce((s, r) => s + (r.counts[c.type] ?? 0), 0).toLocaleString('ru-RU');
  }
  footer.total = rows.reduce((s, r) => s + r.total, 0).toLocaleString('ru-RU');
  return footer;
};

interface ExecutorOutputTableProps {
  dateFrom: string;
  dateTo: string;
}

export const ExecutorOutputTable: React.FC<ExecutorOutputTableProps> = ({ dateFrom, dateTo }) => {
  const { warehouse } = useWarehouse();
  const theme = useTheme();
  const style = chartStyle(theme);
  const colors = seriesColors[theme.palette.mode];
  const { data, isLoading, error } = useExecutorOutput(dateFrom, dateTo, warehouse);

  const all = useMemo(() => buildRows(data ?? []), [data]);
  const people = useMemo(() => all.filter((r) => r.name !== ''), [all]);
  const system = useMemo(() => all.filter((r) => r.name === ''), [all]);

  // Диаграмма: доля сотрудников в общем количестве операций, топ-8 по итогу
  const pieData = useMemo(
    () => [...people].sort((a, b) => b.total - a.total).slice(0, 8).map((r) => ({ name: r.name, value: r.total })),
    [people],
  );

  const personColumns = useMemo(() => buildColumns('Сотрудник'), []);
  const systemColumns = useMemo(() => buildColumns('Источник'), []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>Не удалось загрузить выработку по сотрудникам</Alert>;
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Выработка по сотрудникам
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Склад {warehouse} · количество складских операций за период по типам
          </Typography>
        </Box>
        {pieData.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent, x, y, textAnchor }) => (
                    <text x={x} y={y} textAnchor={textAnchor} fill={theme.palette.text.primary} fontSize={12}>
                      {`${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                    </text>
                  )}
                >
                  {pieData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={style.tooltip.contentStyle} itemStyle={style.tooltip.itemStyle} />
                <Legend wrapperStyle={style.legend.wrapperStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
        <ReportTable
          columns={personColumns}
          rows={people}
          rowKey={(r) => r.name}
          defaultSortKey="total"
          footer={people.length > 0 ? sumFooter(people) : undefined}
          emptyText="Нет операций с исполнителем за выбранный период"
        />
      </Paper>

      {system.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Системные операции
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Операции без исполнителя, отдельно от выработки сотрудников
            </Typography>
          </Box>
          <ReportTable columns={systemColumns} rows={system} rowKey={(r) => r.name || 'system'} />
        </Paper>
      )}
    </Box>
  );
};
