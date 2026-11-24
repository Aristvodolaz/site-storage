import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { makeTheme } from '@/theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { StoragePage } from '@/pages/StoragePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { WarehouseProvider } from '@/hooks/useWarehouse';

// Создаем клиент React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 минут
      refetchOnWindowFocus: false, // Отключаем автоматическое обновление при фокусе
    },
  },
});

function App() {
  // Тема следует за системной настройкой светлая/тёмная
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => makeTheme(prefersDark ? 'dark' : 'light'), [prefersDark]);

  const [storagePageData, setStoragePageData] = useState<{
    totalItems: number;
    filteredItems: number;
    isLoading: boolean;
    lastUpdated: Date;
    onRefresh?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
  }>({
    totalItems: 0,
    filteredItems: 0,
    isLoading: false,
    lastUpdated: new Date(),
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <WarehouseProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* Общий Header для всех страниц */}
              <Header
                totalItems={storagePageData.totalItems}
                filteredItems={storagePageData.filteredItems}
                isLoading={storagePageData.isLoading}
                lastUpdated={storagePageData.lastUpdated}
                onRefresh={storagePageData.onRefresh}
              />

              {/* Роуты */}
              <Routes>
                <Route 
                  path="/" 
                  element={<StoragePage onDataChange={setStoragePageData} />} 
                />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </Box>
            </WarehouseProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;