import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Storage as StorageIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  totalItems?: number;
  filteredItems?: number;
  isLoading?: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalItems = 0,
  filteredItems = 0,
  isLoading = false,
  lastUpdated,
  onRefresh,
  onExport,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем активную вкладку по текущему пути
  const currentTab = location.pathname === '/reports' ? 1 : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Используем event, чтобы избежать предупреждения TypeScript о неиспользуемом параметре
    void event;
    if (newValue === 0) {
      navigate('/');
    } else if (newValue === 1) {
      navigate('/reports');
    }
  };

  const isReportsPage = location.pathname === '/reports';

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <StorageIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          STORAGE | Система управления складом
        </Typography>

        {/* Навигационные вкладки */}
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{ 
            flexGrow: 1,
            '& .MuiTab-root': { 
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': { color: 'white' },
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: 'white',
            },
          }}
        >
          <Tab 
            icon={<StorageIcon />} 
            label="Склад" 
            iconPosition="start"
          />
          <Tab 
            icon={<ReportsIcon />} 
            label="Отчеты" 
            iconPosition="start"
          />
        </Tabs>

        {/* Информация и действия (только для страницы склада) */}
        {!isReportsPage && (
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
        )}
      </Toolbar>
    </AppBar>
  );
};
