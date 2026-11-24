import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';

export interface ReportColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  /** Значение для сортировки; без render выводится как есть (числа — с разделителями) */
  value: (row: T) => number | string;
  /** Своя разметка ячейки (чипы, моноширинный текст и т.п.) */
  render?: (row: T) => React.ReactNode;
}

interface ReportTableProps<T> {
  columns: ReportColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Колонка сортировки по умолчанию (по убыванию для чисел) */
  defaultSortKey?: string;
  emptyText?: string;
  /** Строка итогов: значение по ключу колонки */
  footer?: Record<string, React.ReactNode>;
  maxHeight?: number;
}

type Direction = 'asc' | 'desc';

const formatValue = (v: number | string) =>
  typeof v === 'number' ? v.toLocaleString('ru-RU') : v;

// Первая колонка закреплена при горизонтальной прокрутке (узкие экраны)
const stickyFirst = (index: number, header: boolean): React.CSSProperties | undefined =>
  index === 0
    ? {
        position: 'sticky',
        left: 0,
        top: header ? 0 : undefined,
        zIndex: header ? 3 : 1,
        backgroundColor: 'background.paper',
      }
    : undefined;

/**
 * Единая таблица для отчетов: сортировка по клику на заголовок,
 * фиксированная шапка, закрепленная первая колонка, строка итогов.
 */
export function ReportTable<T>({
  columns,
  rows,
  rowKey,
  defaultSortKey,
  emptyText = 'Нет данных для отображения',
  footer,
  maxHeight,
}: ReportTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: Direction } | null>(
    defaultSortKey ? { key: defaultSortKey, dir: 'desc' } : null,
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.value(a);
      const vb = col.value(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sign;
      return String(va).localeCompare(String(vb), 'ru') * sign;
    });
  }, [rows, columns, sort]);

  const toggleSort = (col: ReportColumn<T>) => {
    setSort((prev) => {
      if (prev?.key === col.key) {
        return { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      const isNumeric = rows.length > 0 && typeof col.value(rows[0]) === 'number';
      return { key: col.key, dir: isNumeric ? 'desc' : 'asc' };
    });
  };

  return (
    <TableContainer sx={{ maxHeight }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((c, i) => {
              const active = sort?.key === c.key;
              return (
                <TableCell
                  key={c.key}
                  align={c.align ?? 'left'}
                  sortDirection={active ? sort.dir : false}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', ...stickyFirst(i, true) }}
                >
                  <TableSortLabel
                    active={active}
                    direction={active ? sort.dir : 'asc'}
                    onClick={() => toggleSort(c)}
                  >
                    {c.label}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((row) => (
              <TableRow key={rowKey(row)} hover>
                {columns.map((c, i) => (
                  <TableCell key={c.key} align={c.align ?? 'left'} sx={stickyFirst(i, false)}>
                    {c.render ? c.render(row) : formatValue(c.value(row))}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>

        {footer && sorted.length > 0 && (
          <TableFooter>
            <TableRow>
              {columns.map((c, i) => (
                <TableCell
                  key={c.key}
                  align={c.align ?? 'left'}
                  sx={{
                    fontWeight: 700,
                    borderTop: 2,
                    borderColor: 'divider',
                    ...stickyFirst(i, false),
                  }}
                >
                  {footer[c.key] ?? ''}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
}
