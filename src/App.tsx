import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ruRU } from '@mui/x-data-grid';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { StoragePage } from '@/pages/StoragePage';
import { ReportsPage } from '@/pages/ReportsPage';

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

// Создаем тему Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
}, ruRU);

function App() {
  const [storagePageData, setStoragePageData] = useState<{
    totalItems: number;
    filteredItems: number;
    isLoading: boolean;
    lastUpdated: Date;
    onRefresh?: () => void;
    onExport?: () => void;
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
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* Общий Header для всех страниц */}
              <Header
                totalItems={storagePageData.totalItems}
                filteredItems={storagePageData.filteredItems}
                isLoading={storagePageData.isLoading}
                lastUpdated={storagePageData.lastUpdated}
                onRefresh={storagePageData.onRefresh}
                onExport={storagePageData.onExport}
              />

              {/* Роуты */}
              <Routes>
                <Route 
                  path="/" 
                  element={<StoragePage onDataChange={setStoragePageData} />} 
                />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </Box>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;