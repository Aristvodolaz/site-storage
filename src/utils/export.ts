import * as XLSX from 'xlsx';
import { Item } from '@/types/item';
import { format } from 'date-fns';
import { getSection, formatCellName } from './filters';

export interface ReportMeta {
  /** Заголовок отчёта */
  title?: string;
  /** Итоговая сумма «Общее кол-во» по отфильтрованным строкам */
  totalQuantity?: number;
  /** Описание активных фильтров (label / value) */
  filterSummary?: { label: string; value: string }[];
}

const expirationText = (value?: string): string =>
  !value || value === '2999-01-01' || value.startsWith('2999-') ? 'СГ отсутствует' : value;

/**
 * Экспорт отфильтрованного списка в Excel.
 * Лист «Товары» — данные, лист «Параметры отчёта» — фильтры и метаданные.
 */
export const exportToExcel = (items: Item[], meta: ReportMeta = {}, filename?: string) => {
  try {
    const exportData = items.map((item) => ({
      'Название': item.name,
      'Артикул': item.article,
      'Штрихкод': item.shk,
      'Кол-во ЕХ': item.quantity,
      'Вложенность ЕХ': item.nested_quantity,
      'Общее кол-во': item.product_qnt,
      'Ячейка (ШК)': item.wr_shk,
      'Название ячейки': formatCellName(item.wr_name),
      'Секция': getSection(item.wr_name || ''),
      'ID склада': item.id_sklad,
      'ЕХ': item.prunit_name,
      'Состояние': item.condition_state,
      'Причина': item.reason,
      'СГ': expirationText(item.expiration_date),
      'Создано': item.createDate,
      'Изменено': item.updateDate,
      'Исполнитель': item.executor,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    ws['!cols'] = [
      { wch: 50 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
      { wch: 24 }, { wch: 14 }, { wch: 19 }, { wch: 19 }, { wch: 26 },
    ];
    ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'] || 'A1')) };
    if (exportData.length > 0) ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, 'Товары');

    const metaRows: (string | number)[][] = [
      ['Отчёт', meta.title || 'Остатки на складе'],
      ['Дата формирования', format(new Date(), 'dd.MM.yyyy HH:mm:ss')],
      ['Строк в отчёте', items.length],
      ['Итого «Общее кол-во»', meta.totalQuantity ?? items.reduce((s, i) => s + (i.product_qnt || 0), 0)],
      [],
      ['Активные фильтры', ''],
      ...(meta.filterSummary && meta.filterSummary.length
        ? meta.filterSummary.map((r) => [r.label, r.value])
        : [['—', 'фильтры не заданы']]),
    ];
    const metaWs = XLSX.utils.aoa_to_sheet(metaRows);
    metaWs['!cols'] = [{ wch: 24 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, metaWs, 'Параметры отчёта');

    const defaultFilename = `storage_1383_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    XLSX.writeFile(wb, filename || defaultFilename);
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    throw new Error('Не удалось экспортировать данные в Excel');
  }
};
