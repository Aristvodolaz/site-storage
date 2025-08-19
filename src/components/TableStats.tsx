import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TableChart,
  Inventory,
  Warning,
  TrendingUp,
  Storage,
} from '@mui/icons-material';
import { Item } from '@/types/item';

interface TableStatsProps {
  items: Item[];
  filteredItems: Item[];
  isLoading?: boolean;
}

export const TableStats: React.FC<TableStatsProps> = ({
  items,
  filteredItems,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Вычисляем статистику
  const totalItems = items.length;
  const visibleItems = filteredItems.length;
  const filterActive = totalItems !== visibleItems;
  
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.product_qnt, 0);
  const defectiveItems = filteredItems.filter(item => 
    item.condition_state.toLowerCase().includes('некондиц')
  ).length;
  
  const warehouses = [...new Set(filteredItems.map(item => item.id_sklad))];
  const executors = [...new Set(filteredItems.map(item => item.executor).filter(Boolean))];

  const defectivePercentage = visibleItems > 0 ? (defectiveItems / visibleItems) * 100 : 0;
  const filterPercentage = totalItems > 0 ? (visibleItems / totalItems) * 100 : 100;

  const stats = [
    {
      icon: <TableChart />,
      label: 'Записей',
      value: visibleItems.toLocaleString('ru-RU'),
      subtext: filterActive ? `из ${totalItems.toLocaleString('ru-RU')}` : null,
      color: 'primary',
      progress: filterActive ? filterPercentage : null,
    },
    {
      icon: <Inventory />,
      label: 'Общее количество',
      value: totalQuantity.toLocaleString('ru-RU'),
      subtext: 'единиц товара',
      color: 'success',
    },
    {
      icon: <Warning />,
      label: 'Некондиция',
      value: defectiveItems.toString(),
      subtext: `${defectivePercentage.toFixed(1)}%`,
      color: defectiveItems > 0 ? 'error' : 'success',
      progress: defectivePercentage,
    },
    {
      icon: <Storage />,
      label: 'Складов',
      value: warehouses.length.toString(),
      subtext: warehouses.join(', '),
      color: 'info',
    },
    {
      icon: <TrendingUp />,
      label: 'Исполнителей',
      value: executors.length.toString(),
      subtext: `активных пользователей`,
      color: 'secondary',
    },
  ];

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TableChart color="primary" />
          <Typography variant="h6">Статистика таблицы</Typography>
        </Box>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Загрузка статистики...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TableChart color="primary" />
        <Typography variant="h6">Статистика таблицы</Typography>
        {filterActive && (
          <Chip
            label="Фильтр активен"
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      <Grid container spacing={isMobile ? 1 : 2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: isMobile ? 1 : 1.5,
                borderRadius: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: `${stat.color}.main`,
                  color: `${stat.color}.contrastText`,
                }}
              >
                {React.cloneElement(stat.icon, { fontSize: 'small' })}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                >
                  {stat.label}
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                
                {stat.subtext && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ 
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {stat.subtext}
                  </Typography>
                )}
                
                {stat.progress !== null && stat.progress !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    color={stat.color as any}
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
