import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
} from '@mui/material';
import { subHours, startOfDay, endOfDay } from 'date-fns';

import { ReportSummary } from '@/components/reports/ReportSummary';
import { TimeRangeSelector } from '@/components/reports/TimeRangeSelector';
import { ActivityChart } from '@/components/reports/ActivityChart';
import { OperationsTable } from '@/components/reports/OperationsTable';
import { UsersTable } from '@/components/reports/UsersTable';
import { DetailsTable } from '@/components/reports/DetailsTable';

import { useReports } from '@/hooks/useReports';
import { TimeRangePreset, GroupByType } from '@/types/reports';
import type { 
  GroupedDataByTime, 
  GroupedDataByEndpoint, 
  GroupedDataByExecutor 
} from '@/types/reports';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [preset, setPreset] = useState<TimeRangePreset>('last24h');
  const [dateFrom, setDateFrom] = useState(subHours(new Date(), 24).toISOString());
  const [dateTo, setDateTo] = useState(new Date().toISOString());
  const [includeDetails, setIncludeDetails] = useState(false);

  // Определяем group_by в зависимости от активной вкладки
  const getGroupBy = (): GroupByType => {
    switch (activeTab) {
      case 0: return 'hour'; // Активность по времени
      case 1: return 'endpoint'; // Операции
      case 2: return 'executor'; // Пользователи
      case 3: return 'hour'; // Детали
      default: return 'hour';
    }
  };

  // Загрузка данных
  const { data: reportData, isLoading, error, refetch } = useReports({
    dateFrom,
    dateTo,
    groupBy: getGroupBy(),
    includeDetails: activeTab === 3 ? true : includeDetails,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Отчеты по операциям
        </Typography>

        {/* Фильтры времени */}
        <TimeRangeSelector
          dateFrom={dateFrom}
          dateTo={dateTo}
          preset={preset}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onPresetChange={setPreset}
          onRefresh={handleRefresh}
        />

        {/* Опция для включения деталей */}
        {activeTab !== 3 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                />
              }
              label="Включить детальные логи (макс. 1000 записей)"
            />
          </Paper>
        )}

        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Ошибка при загрузке отчета'}
          </Alert>
        )}

        {/* Загрузка */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Данные отчета */}
        {!isLoading && reportData && (
          <>
            {/* Сводка */}
            <ReportSummary summary={reportData.summary} />

            {/* Вкладки */}
            <Paper sx={{ mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Активность по времени" />
                <Tab label="Операции (ЧТО)" />
                <Tab label="Пользователи (КТО)" />
                <Tab label="Детали (КТО+ЧТО+ГДЕ)" />
              </Tabs>
            </Paper>

            {/* Контент вкладок */}
            <Box>
              {activeTab === 0 && (
                <ActivityChart 
                  data={reportData.grouped_data as GroupedDataByTime[]} 
                  groupBy={reportData.group_by === 'hour' ? 'hour' : 'day'}
                />
              )}

              {activeTab === 1 && (
                <OperationsTable data={reportData.grouped_data as GroupedDataByEndpoint[]} />
              )}

              {activeTab === 2 && (
                <UsersTable data={reportData.grouped_data as GroupedDataByExecutor[]} />
              )}

              {activeTab === 3 && (
                <DetailsTable data={reportData.details || []} />
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};
