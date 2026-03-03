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
import { OperationLogDetail } from '@/types/reports';
import { format } from 'date-fns';

interface DetailsTableProps {
  data: OperationLogDetail[];
}

export const DetailsTable: React.FC<DetailsTableProps> = ({ data }) => {
  const getStatusColor = (statusCode: number): 'success' | 'warning' | 'error' | 'default' => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    return 'error';
  };

  const getMethodColor = (method: string): 'primary' | 'secondary' | 'info' | 'warning' => {
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Детальные логи операций
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        КТО, ЧТО и ГДЕ - полная информация о каждой операции
      </Typography>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Пользователь (КТО)</strong></TableCell>
              <TableCell><strong>Метод</strong></TableCell>
              <TableCell><strong>Endpoint (ГДЕ)</strong></TableCell>
              <TableCell align="center"><strong>Статус</strong></TableCell>
              <TableCell align="right"><strong>Время выполнения</strong></TableCell>
              <TableCell><strong>Результат</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Нет данных для отображения. Включите опцию "Показать детали" в фильтрах.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {formatDate(row.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.executor} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.http_method} 
                      size="small" 
                      color={getMethodColor(row.http_method)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.8rem',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.endpoint}
                    >
                      {row.endpoint}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.status_code} 
                      size="small" 
                      color={getStatusColor(row.status_code)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2"
                      color={row.execution_time_ms > 1000 ? 'error.main' : 'text.primary'}
                    >
                      {row.execution_time_ms}ms
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.operation_result} 
                      size="small" 
                      color={row.operation_result === 'success' ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
