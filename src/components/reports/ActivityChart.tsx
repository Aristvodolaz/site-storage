import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { GroupedDataByTime } from '@/types/reports';
import { chartStyle } from '@/theme';

interface ActivityChartProps {
  data: GroupedDataByTime[];
  groupBy: 'hour' | 'day';
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, groupBy }) => {
  const theme = useTheme();
  const style = chartStyle(theme);

  // Проверка на пустые данные
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Активность по времени
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения. Выберите другой период времени.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Подготовка данных для графика
  const chartData = data.map((item) => {
    let label = '';

    if (groupBy === 'hour') {
      label = item.hour_of_day !== undefined
        ? `${item.date} ${String(item.hour_of_day).padStart(2, '0')}:00`
        : item.date || '';
    } else {
      label = item.date || '';
    }

    return {
      label,
      Успешно: item.success_count,
      Ошибки: item.error_count,
      'Всего операций': item.total_count,
      'Success Rate': parseFloat(item.success_rate),
      'Ср. время (ms)': item.avg_execution_time,
    };
  });

  const xAxisProps = {
    dataKey: 'label',
    angle: -45,
    textAnchor: 'end' as const,
    height: 80,
    tick: style.tick,
    stroke: theme.palette.divider,
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Активность по времени
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={style.grid.stroke} />
            <XAxis {...xAxisProps} />
            <YAxis tick={style.tick} stroke={theme.palette.divider} />
            <Tooltip contentStyle={style.tooltip.contentStyle} labelStyle={style.tooltip.labelStyle} itemStyle={style.tooltip.itemStyle} />
            <Legend wrapperStyle={style.legend.wrapperStyle} />
            <Bar dataKey="Успешно" fill={theme.palette.success.main} />
            <Bar dataKey="Ошибки" fill={theme.palette.error.main} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Success Rate и среднее время выполнения
      </Typography>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={style.grid.stroke} />
          <XAxis {...xAxisProps} />
          <YAxis
            yAxisId="left"
            tick={style.tick}
            stroke={theme.palette.divider}
            label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={style.tick}
            stroke={theme.palette.divider}
            label={{ value: 'Время (ms)', angle: 90, position: 'insideRight', fill: theme.palette.text.secondary }}
          />
          <Tooltip contentStyle={style.tooltip.contentStyle} labelStyle={style.tooltip.labelStyle} itemStyle={style.tooltip.itemStyle} />
          <Legend wrapperStyle={style.legend.wrapperStyle} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Success Rate"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Ср. время (ms)"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};
