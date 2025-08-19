import * as XLSX from 'xlsx';
import { Item } from '@/types/item';
import { format } from 'date-fns';

export const exportToExcel = (items: Item[], filename?: string) => {
  try {
    // Подготавливаем данные для экспорта
    const exportData = items.map((item) => ({
      'Название': item.name,
      'Артикул': item.article,
      'Штрихкод': item.shk,
      'Кол-во ЕХ': item.quantity,
      'Вложенность ЕХ': item.nested_quantity,
      'Общее кол-во': item.product_qnt,
      'Ячейка': item.wr_shk,
      'Название ячейки': item.wr_name,
      'ID склада': item.id_sklad,
      'ЕХ': item.prunit_name,
      'Состояние': item.condition_state,
      'Причина': item.reason,
      'СГ': item.expiration_date === '2999-01-01' ? 'СГ отсутствует' : item.expiration_date,
      'Создано': item.createDate,
      'Изменено': item.updateDate,
      'Исполнитель': item.executor,
    }));

    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();

    // Создаем лист с данными
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Настраиваем ширину столбцов
    const columnWidths = [
      { wch: 50 }, // Название
      { wch: 15 }, // Артикул
      { wch: 20 }, // Штрихкод
      { wch: 12 }, // Кол-во ЕХ
      { wch: 15 }, // Вложенность ЕХ
      { wch: 15 }, // Общее кол-во
      { wch: 15 }, // Ячейка
      { wch: 25 }, // Название ячейки
      { wch: 12 }, // ID склада
      { wch: 10 }, // ЕХ
      { wch: 15 }, // Состояние
      { wch: 20 }, // Причина
      { wch: 15 }, // СГ
      { wch: 20 }, // Создано
      { wch: 20 }, // Изменено
      { wch: 20 }, // Исполнитель
    ];

    ws['!cols'] = columnWidths;

    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, 'Товары');

    // Создаем лист с метаданными
    const metadata = [
      ['Информация', 'Отчет по товарам на складе'],
      ['Дата формирования', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      ['Количество записей', items.length.toString()],
    ];

    const metaWs = XLSX.utils.aoa_to_sheet(metadata);
    metaWs['!cols'] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, metaWs, 'Информация');

    // Генерируем имя файла
    const defaultFilename = `inventory_report_${format(new Date(), 'yyyyMMdd')}.xlsx`;
    const finalFilename = filename || defaultFilename;

    // Сохраняем файл
    XLSX.writeFile(wb, finalFilename);

    return true;
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    throw new Error('Не удалось экспортировать данные в Excel');
  }
};
