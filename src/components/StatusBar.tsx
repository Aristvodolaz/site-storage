import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StatusBarProps {
  totalItems: number;
  filteredItems: number;
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: Date;
  searchTerm?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalItems,
  filteredItems,
  isLoading,
  error,
  lastUpdated,
  searchTerm,
}) => {
  const getStatusMessage = () => {
    if (error) {
      return `Ошибка: ${error}`;
    }

    if (isLoading) {
      return 'Загрузка данных...';
    }

    if (searchTerm && filteredItems !== totalItems) {
      return `Найдено ${filteredItems} товаров • Фильтр: "${searchTerm}"`;
    }

    if (lastUpdated) {
      return `Загружено ${totalItems} товаров • Последнее обновление: ${format(
        lastUpdated,
        'HH:mm:ss',
        { locale: ru }
      )}`;
    }

    return 'Готово';
  };

  return (
    <Box
      sx={{
        p: 1,
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {getStatusMessage()}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {error && (
          <Chip
            label="Ошибка"
            color="error"
            size="small"
            variant="outlined"
          />
        )}
        
        {isLoading && (
          <Chip
            label="Загрузка"
            color="info"
            size="small"
            variant="outlined"
          />
        )}

        {searchTerm && filteredItems !== totalItems && (
          <Chip
            label={`Фильтр активен`}
            color="primary"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};
