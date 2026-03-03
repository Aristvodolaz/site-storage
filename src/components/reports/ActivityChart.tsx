import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
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
import { format } from 'date-fns';

interface ActivityChartProps {
  data: GroupedDataByTime[];
  groupBy: 'hour' | 'day';
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, groupBy }) => {
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

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Активность по времени
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Успешно" fill="#2e7d32" />
            <Bar dataKey="Ошибки" fill="#d32f2f" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Success Rate и среднее время выполнения
      </Typography>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="label" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="left" label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Время (ms)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="Success Rate" 
            stroke="#1976d2" 
            strokeWidth={2}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="Ср. время (ms)" 
            stroke="#ed6c02" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};
