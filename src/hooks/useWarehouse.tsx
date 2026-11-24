import React, { createContext, useContext, useMemo, useState } from 'react';
import { WAREHOUSES } from '@/utils/warehouses';

// Выбранный склад общий для всех страниц (склад, история, отчеты) и помнится между визитами
const STORAGE_KEY = 'selected-warehouse';
const DEFAULT_WAREHOUSE = Number(WAREHOUSES[0]);

const isKnown = (value: number) => WAREHOUSES.map(Number).includes(value);

// Приоритет: склад из адреса (?warehouse=706), затем запомненный, затем по умолчанию
const readSaved = (): number => {
  try {
    const fromUrl = Number(new URLSearchParams(window.location.search).get('warehouse'));
    if (isKnown(fromUrl)) return fromUrl;
  } catch {
    // нет доступа к адресу: читаем запомненный
  }
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return isKnown(saved) ? saved : DEFAULT_WAREHOUSE;
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
    try {
      // адрес следует за выбором, чтобы перезагрузка не возвращала старый склад из ссылки
      const url = new URL(window.location.href);
      url.searchParams.set('warehouse', String(next));
      window.history.replaceState(null, '', url);
    } catch {
      // адрес не обновился: выбор всё равно сохранён
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
