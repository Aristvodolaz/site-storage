import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Assessment as TotalIcon,
} from '@mui/icons-material';
import { ReportSummary as ReportSummaryType } from '@/types/reports';

interface ReportSummaryProps {
  summary: ReportSummaryType;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          color: color,
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

export const ReportSummary: React.FC<ReportSummaryProps> = ({ summary }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Всего операций"
          value={summary.total_operations.toLocaleString()}
          icon={<TotalIcon />}
          color="#1976d2"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Успешных"
          value={summary.successful_operations.toLocaleString()}
          icon={<SuccessIcon />}
          color="#2e7d32"
          subtitle={`${summary.success_rate}% успеха`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Ошибок"
          value={summary.failed_operations.toLocaleString()}
          icon={<ErrorIcon />}
          color="#d32f2f"
          subtitle={`${(100 - parseFloat(summary.success_rate)).toFixed(2)}% ошибок`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Среднее время"
          value={`${summary.avg_execution_time_ms}ms`}
          icon={<SpeedIcon />}
          color="#ed6c02"
          subtitle={`Макс: ${summary.max_execution_time_ms}ms`}
        />
      </Grid>
    </Grid>
  );
};
