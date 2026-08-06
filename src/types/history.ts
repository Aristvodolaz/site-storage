// Типы истории складских операций

export type StorageOperationType = 'PLACE' | 'MOVE' | 'PICK' | '';

export interface StorageOperation {
  id: number;
  operationType: StorageOperationType;
  productId: string | null;
  productName: string | null;
  prunitId: number | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number | null;
  expirationDate: string | null;
  conditionState: string | null;
  executor: string | null;
  executedAt: string;
}

export interface StorageOperationsFilters {
  operationType?: StorageOperationType;
  productId?: string;
  locationId?: string;
  executor?: string;
  dateFrom: string;
  dateTo: string;
  limit?: number;
  offset?: number;
}

export interface StorageOperationsResponse {
  success: boolean;
  data: StorageOperation[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
  msg?: string;
}
