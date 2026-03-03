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
import { GroupedDataByEndpoint } from '@/types/reports';

interface OperationsTableProps {
  data: GroupedDataByEndpoint[];
}

export const OperationsTable: React.FC<OperationsTableProps> = ({ data }) => {
  // Проверка на пустые данные
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Операции (ЧТО делали)
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
  const sortedData = [...data].sort((a, b) => b.total_count - a.total_count).slice(0, 20);

  const getSuccessRateColor = (rate: string): 'success' | 'warning' | 'error' => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 95) return 'success';
    if (rateNum >= 80) return 'warning';
    return 'error';
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Операции (ЧТО делали)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Топ-20 самых частых операций
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Endpoint</strong></TableCell>
              <TableCell align="right"><strong>Всего</strong></TableCell>
              <TableCell align="right"><strong>Успешно</strong></TableCell>
              <TableCell align="right"><strong>Ошибки</strong></TableCell>
              <TableCell align="center"><strong>Success Rate</strong></TableCell>
              <TableCell align="right"><strong>Ср. время</strong></TableCell>
              <TableCell align="right"><strong>Пользователей</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {row.endpoint}
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
                <TableCell align="right">{row.unique_executors}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
