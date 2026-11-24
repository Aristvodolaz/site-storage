import React, { createContext, useContext, useMemo, useState } from 'react';
import { WAREHOUSES } from '@/utils/warehouses';

// Выбранный склад общий для всех страниц (склад, история, отчеты) и помнится между визитами
const STORAGE_KEY = 'selected-warehouse';
const DEFAULT_WAREHOUSE = Number(WAREHOUSES[0]);

const readSaved = (): number => {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return WAREHOUSES.map(Number).includes(saved) ? saved : DEFAULT_WAREHOUSE;
  } catch {
    return DEFAULT_WAREHOUSE;
  }
};

interface WarehouseContextValue {
  warehouse: number;
  setWarehouse: (warehouse: number) => void;
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [warehouse, setWarehouseState] = useState<number>(readSaved);

  const setWarehouse = (next: number) => {
    setWarehouseState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // приватный режим / заблокированное хранилище: выбор действует до перезагрузки
    }
  };

  const value = useMemo(() => ({ warehouse, setWarehouse }), [warehouse]);
  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
};

export const useWarehouse = (): WarehouseContextValue => {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error('useWarehouse используется вне WarehouseProvider');
  return ctx;
};
