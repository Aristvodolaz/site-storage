import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GroupedDataByExecutor } from '@/types/reports';

interface UsersTableProps {
  data: GroupedDataByExecutor[];
}

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2', '#c2185b'];

export const UsersTable: React.FC<UsersTableProps> = ({ data }) => {
  // Проверка на пустые данные
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Пользователи (КТО делал)
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения. Выберите другой период времени.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Сортировка по количеству операций
  const sortedData = [...data].sort((a, b) => b.total_count - a.total_count);

  // Данные для pie chart (топ-8 пользователей)
  const pieData = sortedData.slice(0, 8).map((item) => ({
    name: item.executor,
    value: item.total_count,
  }));

  const getSuccessRateColor = (rate: string): 'success' | 'warning' | 'error' => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 95) return 'success';
    if (rateNum >= 80) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Pie Chart */}
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
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Таблица пользователей */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Пользователи (КТО делал)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Детальная статистика по пользователям
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Пользователь</strong></TableCell>
                <TableCell align="right"><strong>Всего операций</strong></TableCell>
                <TableCell align="right"><strong>Успешно</strong></TableCell>
                <TableCell align="right"><strong>Ошибки</strong></TableCell>
                <TableCell align="center"><strong>Success Rate</strong></TableCell>
                <TableCell align="right"><strong>Ср. время</strong></TableCell>
                <TableCell align="right"><strong>IP адресов</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {row.executor}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{row.total_count.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {row.success_count.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {row.error_count.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.success_rate}%`}
                      size="small"
                      color={getSuccessRateColor(row.success_rate)}
                    />
                  </TableCell>
                  <TableCell align="right">{row.avg_execution_time}ms</TableCell>
                  <TableCell align="right">{row.unique_ips}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
