import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface HeaderProps {
  totalItems: number;
  filteredItems: number;
  isLoading: boolean;
  lastUpdated?: Date;
  onRefresh: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalItems,
  filteredItems,
  isLoading,
  lastUpdated,
  onRefresh,
  onExport,
}) => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <StorageIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          STORAGE | Система управления складом
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body2">
              {filteredItems !== totalItems 
                ? `Показано: ${filteredItems} из ${totalItems}` 
                : `Всего товаров: ${totalItems}`}
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Обновлено: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          <Button
            color="inherit"
            startIcon={<ExportIcon />}
            onClick={onExport}
            disabled={isLoading || filteredItems === 0}
          >
            Экспорт
          </Button>

          <IconButton
            color="inherit"
            onClick={onRefresh}
            disabled={isLoading}
            title="Обновить данные"
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
