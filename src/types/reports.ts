// Types for operation logs reports

export interface ReportSummary {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  success_rate: string;
  avg_execution_time_ms: number;
  max_execution_time_ms: number;
  period?: {
    from: string;
    to: string;
  };
  filters?: {
    executor?: string;
    endpoint?: string;
  };
}

export interface GroupedDataByTime {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  date?: string;
  hour_of_day?: number;
  total_count: number;
  success_count: number;
  error_count: number;
  success_rate: string;
  avg_execution_time: number;
  min_execution_time: number;
  max_execution_time: number;
  unique_executors: number;
  unique_ips: number;
}

export interface GroupedDataByEndpoint {
  endpoint: string;
  total_count: number;
  success_count: number;
  error_count: number;
  success_rate: string;
  avg_execution_time: number;
  min_execution_time: number;
  max_execution_time: number;
  unique_executors: number;
  unique_ips: number;
}

export interface GroupedDataByExecutor {
  executor: string;
  total_count: number;
  success_count: number;
  error_count: number;
  success_rate: string;
  avg_execution_time: number;
  unique_ips: number;
}

export interface GroupedDataByStatusCode {
  status_code: number;
  total_count: number;
  success_count: number;
  error_count: number;
  success_rate: string;
  avg_execution_time: number;
}

export interface GroupedDataByMethod {
  http_method: string;
  total_count: number;
  success_count: number;
  error_count: number;
  success_rate: string;
  avg_execution_time: number;
}

export interface OperationLogDetail {
  id: number;
  endpoint: string;
  http_method: string;
  status_code: number;
  execution_time_ms: number;
  executor: string;
  operation_result: string;
  created_at: string;
  ip_address?: string;
  error_message?: string;
}

export type GroupedData = 
  | GroupedDataByTime 
  | GroupedDataByEndpoint 
  | GroupedDataByExecutor 
  | GroupedDataByStatusCode 
  | GroupedDataByMethod;

export type GroupByType = 'hour' | 'day' | 'endpoint' | 'executor' | 'status_code' | 'method';

export interface ReportData {
  summary: ReportSummary;
  grouped_data: GroupedData[];
  group_by: GroupByType;
  details?: OperationLogDetail[];
}

export interface ReportApiResponse {
  success: boolean;
  data: ReportData;
  message?: string;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  groupBy: GroupByType;
  executor?: string;
  endpoint?: string;
  includeDetails?: boolean;
}

export type TimeRangePreset = 'last24h' | 'last7d' | 'last30d' | 'today' | 'yesterday' | 'custom';
