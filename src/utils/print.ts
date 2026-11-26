import { Item } from '@/types/item';
import { ReportMeta } from './export';
import { formatCellName, naturalCompare } from './filters';

// Поля сетки, которых нет в Item: сортируем по исходной дате (формат ISO сортируется так же)
const SORT_SOURCE: Record<string, keyof Item> = {
  createDateFormatted: 'createDate',
  updateDateFormatted: 'updateDate',
  expirationDateFormatted: 'expiration_date',
};

// Порядок как в сетке: одна колонка, ячейки — natural compare, числа — по значению
const sortLikeGrid = (items: Item[], sortModel: ReportMeta['sortModel'] = []): Item[] => {
  const active = sortModel.find((m) => m.sort);
  if (!active) return items;
  const key = SORT_SOURCE[active.field] ?? (active.field as keyof Item);
  const dir = active.sort === 'desc' ? -1 : 1;
  const compare = (a: unknown, b: unknown): number => {
    if (key === 'wr_name') return naturalCompare(String(a ?? ''), String(b ?? ''));
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a ?? '').localeCompare(String(b ?? ''), 'ru', { numeric: true });
  };
  return [...items].sort((x, y) => dir * compare(x[key], y[key]));
};

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const expirationText = (value?: string): string =>
  !value || value === '2999-01-01' || value.startsWith('2999-') ? 'СГ отсутствует' : value;

const now = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/**
 * Открывает новое окно с версией отчёта для печати и вызывает печать.
 * Печатается ровно то, что отфильтровано (все строки, без пагинации) и только видимые в таблице столбцы.
 */
export const printReport = (rawItems: Item[], meta: ReportMeta = {}): void => {
  const items = sortLikeGrid(rawItems, meta.sortModel);
  // noopener делает window.open() null → печать не открывалась; контент пишем сами, opener не опасен
  const win = window.open('', '_blank');
  if (!win) {
    alert('Разрешите всплывающие окна для печати отчёта');
    return;
  }

  const totalQuantity =
    meta.totalQuantity ?? items.reduce((s, i) => s + (i.product_qnt || 0), 0);

  // Столбец печатается, если виден хотя бы один из его полей (поле → false = скрыто)
  const isVisible = (...fields: string[]) =>
    fields.some((f) => meta.columnVisibility?.[f] !== false);

  const allColumns = [
    { key: 'name', head: 'Название', show: isVisible('name'), cell: (i: Item) => esc(i.name) },
    { key: 'article', head: 'Артикул', show: isVisible('article'), cell: (i: Item) => esc(i.article) },
    { key: 'shk', head: 'ШК', show: isVisible('shk'), cell: (i: Item) => esc(i.shk) },
    {
      key: 'product_qnt', head: 'Кол-во', num: true, show: isVisible('product_qnt'),
      cell: (i: Item) => esc(i.product_qnt),
    },
    { key: 'prunit_name', head: 'ЕХ', show: isVisible('prunit_name'), cell: (i: Item) => esc(i.prunit_name) },
    {
      key: 'wr_name', head: 'Ячейка', show: isVisible('wr_name', 'wr_shk'),
      cell: (i: Item) =>
        esc((isVisible('wr_name') && formatCellName(i.wr_name)) || (isVisible('wr_shk') ? i.wr_shk : '')),
    },
    { key: 'condition_state', head: 'Состояние', show: isVisible('condition_state'), cell: (i: Item) => esc(i.condition_state) },
    {
      key: 'expirationDateFormatted', head: 'СГ', show: isVisible('expirationDateFormatted'),
      cell: (i: Item) => esc(expirationText(i.expiration_date)),
    },
    { key: 'reason', head: 'Причина', show: isVisible('reason'), cell: (i: Item) => esc(i.reason) },
    { key: 'executor', head: 'Исполнитель', show: isVisible('executor'), cell: (i: Item) => esc(i.executor) },
  ];
  const columns = allColumns.filter((c) => c.show);
  const qtyIndex = columns.findIndex((c) => c.key === 'product_qnt');
  const showTotal = qtyIndex !== -1;

  const filterRows = (meta.filterSummary || [])
    .map((r) => `<div><span class="k">${esc(r.label)}:</span> ${esc(r.value)}</div>`)
    .join('');

  const body = items
    .map(
      (i, idx) => `<tr>
        <td class="num">${idx + 1}</td>
        ${columns.map((c) => `<td${c.num ? ' class="num"' : ''}>${c.cell(i)}</td>`).join('')}
      </tr>`
    )
    .join('');

  const head = columns
    .map((c) => `<th${c.num ? ' class="num"' : ''}>${c.head}</th>`)
    .join('');

  const footer = showTotal
    ? `<tfoot><tr>${qtyIndex ? `<td colspan="${qtyIndex + 1}">Итого</td>` : ''}` +
      `<td class="num">${totalQuantity.toLocaleString('ru-RU')}</td>` +
      `${columns.length - qtyIndex - 1 ? `<td colspan="${columns.length - qtyIndex - 1}"></td>` : ''}</tr></tfoot>`
    : '';

  win.document.write(`<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>${esc(meta.title || 'Отчёт по остаткам склада 1383')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, "Segoe UI", sans-serif; color: #111; margin: 16mm 10mm; font-size: 11px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 6px 0 4px; color: #333; }
  .meta .k { color: #666; }
  .summary { margin: 4px 0 10px; font-weight: bold; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #999; padding: 3px 5px; text-align: left; vertical-align: top; }
  thead { display: table-header-group; }
  th { background: #e8eef7; font-size: 10px; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  tr { page-break-inside: avoid; }
  tfoot td { font-weight: bold; background: #f3f3f3; }
  .toolbar { margin-bottom: 12px; }
  .toolbar button { font-size: 13px; padding: 6px 14px; margin-right: 8px; cursor: pointer; }
  @media print { .toolbar { display: none; } body { margin: 0; } }
</style></head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Печать</button>
    <button onclick="window.close()">Закрыть</button>
  </div>
  <h1>${esc(meta.title || 'Отчёт по остаткам склада 1383')}</h1>
  <div class="meta">
    <div><span class="k">Сформирован:</span> ${esc(now())}</div>
    ${filterRows}
  </div>
  <div class="summary">Строк: ${items.length}${showTotal ? ` &nbsp;|&nbsp; Итого «Общее кол-во»: ${totalQuantity.toLocaleString('ru-RU')}` : ''}</div>
  <table>
    <thead><tr>
      <th class="num">№</th>${head}
    </tr></thead>
    <tbody>${body}</tbody>
    ${footer}
  </table>
</body></html>`);
  win.document.close();

  // Ждём полной загрузки/раскладки документа перед печатью — с большими таблицами
  // фиксированная пауза в 300мс могла срабатывать до завершения рендера, и печать
  // тихо не запускалась (жалобы на реестры из более чем ~20 строк).
  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      win.focus();
      win.print();
    } catch (error) {
      console.error('Ошибка при печати отчёта:', error);
    }
  };

  if (win.document.readyState === 'complete') {
    triggerPrint();
  } else {
    win.addEventListener('load', triggerPrint);
    // Подстраховка на случай, если событие load не сработает в некоторых браузерах
    setTimeout(triggerPrint, 1000);
  }
};
