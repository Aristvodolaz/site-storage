import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
} from '@mui/material';
import { WAREHOUSES } from '@/utils/warehouses';
import { useWarehouse } from '@/hooks/useWarehouse';
import {
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Assessment as ReportsIcon,
  History as HistoryIcon,
  Inventory2Outlined as BoxIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  totalItems?: number;
  filteredItems?: number;
  isLoading?: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
}

const TAB_PATHS = ['/', '/history', '/reports'] as const;

export const Header: React.FC<HeaderProps> = ({
  totalItems = 0,
  filteredItems = 0,
  isLoading = false,
  lastUpdated,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { warehouse, setWarehouse } = useWarehouse();

  const currentTab = Math.max(0, TAB_PATHS.indexOf(location.pathname as (typeof TAB_PATHS)[number]));
  const isStoragePage = location.pathname === '/';

  return (
    // На телефоне шапка занимает много высоты, поэтому липкая только на большом экране
    <AppBar position="sticky" sx={{ position: { xs: 'relative', md: 'sticky' } }}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 1.5, py: 1, px: { xs: 2, md: 3 }, minHeight: 'auto' }}>
        {/* Бренд */}
        <Box
          aria-hidden
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <BoxIcon fontSize="small" />
        </Box>
        <Box sx={{ mr: { md: 3 }, lineHeight: 1.2 }}>
          <Typography variant="h6" component="h1" sx={{ fontSize: '1.05rem' }}>
            Storage
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Система управления складом
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Склад общий для всех страниц: влияет на остатки, историю и отчеты */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={warehouse}
            onChange={(e) => setWarehouse(Number(e.target.value))}
            inputProps={{ 'aria-label': 'Склад' }}
            startAdornment={<StorageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
            sx={{ borderRadius: 999, fontWeight: 600 }}
          >
            {WAREHOUSES.map((w) => (
              <MenuItem key={w} value={Number(w)}>Склад {w}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {isStoragePage && (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {filteredItems !== totalItems
                  ? `Показано ${filteredItems} из ${totalItems}`
                  : `Всего товаров: ${totalItems}`}
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Обновлено {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>

            <Tooltip title="Обновить данные">
              <span>
                <IconButton
                  onClick={onRefresh}
                  disabled={isLoading}
                  aria-label="Обновить данные"
                >
                  {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {/* Навигация: отдельная строка под брендом */}
        <Box sx={{ width: '100%', borderTop: 1, borderColor: 'divider', mx: { xs: -2, md: -3 }, px: { xs: 1, md: 2 } }}>
          <Tabs
            value={currentTab}
            onChange={(_, value: number) => navigate(TAB_PATHS[value])}
            aria-label="Разделы"
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 44, '& .MuiTabs-indicator': { height: 3, borderRadius: 3 } }}
          >
            <Tab icon={<StorageIcon />} iconPosition="start" label="Склад" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="История" />
            <Tab icon={<ReportsIcon />} iconPosition="start" label="Отчеты" />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
