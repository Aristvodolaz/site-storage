import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { TimeRangePreset } from '@/types/reports';
import { format, subDays, startOfDay, endOfDay, subHours } from 'date-fns';

interface TimeRangeSelectorProps {
  dateFrom: string;
  dateTo: string;
  preset: TimeRangePreset;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onPresetChange: (preset: TimeRangePreset) => void;
  onRefresh: () => void;
}

// Функция для получения диапазона дат по пресету
const getDateRangeFromPreset = (preset: TimeRangePreset): { from: string; to: string } => {
  const now = new Date();
  
  switch (preset) {
    case 'last24h':
      return {
        from: subHours(now, 24).toISOString(),
        to: now.toISOString(),
      };
    case 'last7d':
      return {
        from: subDays(now, 7).toISOString(),
        to: now.toISOString(),
      };
    case 'last30d':
      return {
        from: subDays(now, 30).toISOString(),
        to: now.toISOString(),
      };
    case 'today':
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        from: startOfDay(yesterday).toISOString(),
        to: endOfDay(yesterday).toISOString(),
      };
    default:
      return { from: '', to: '' };
  }
};

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  dateFrom,
  dateTo,
  preset,
  onDateFromChange,
  onDateToChange,
  onPresetChange,
  onRefresh,
}) => {
  const handlePresetChange = (newPreset: TimeRangePreset) => {
    onPresetChange(newPreset);
    
    if (newPreset !== 'custom') {
      const range = getDateRangeFromPreset(newPreset);
      onDateFromChange(range.from);
      onDateToChange(range.to);
    }
  };

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return '';
    return format(new Date(isoDate), "yyyy-MM-dd'T'HH:mm");
  };

  const handleDateFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onDateFromChange(date.toISOString());
    onPresetChange('custom');
  };

  const handleDateToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onDateToChange(date.toISOString());
    onPresetChange('custom');
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Период</InputLabel>
            <Select
              value={preset}
              label="Период"
              onChange={(e) => handlePresetChange(e.target.value as TimeRangePreset)}
            >
              <MenuItem value="last24h">Последние 24 часа</MenuItem>
              <MenuItem value="last7d">Последние 7 дней</MenuItem>
              <MenuItem value="last30d">Последние 30 дней</MenuItem>
              <MenuItem value="today">Сегодня</MenuItem>
              <MenuItem value="yesterday">Вчера</MenuItem>
              <MenuItem value="custom">Произвольный период</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Дата начала"
            type="datetime-local"
            value={formatDateForInput(dateFrom)}
            onChange={handleDateFromInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Дата окончания"
            type="datetime-local"
            value={formatDateForInput(dateTo)}
            onChange={handleDateToInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{ height: 40 }}
          >
            Обновить
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
