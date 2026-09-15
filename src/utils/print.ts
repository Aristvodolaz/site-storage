import { Item } from '@/types/item';
import { ReportMeta } from './export';

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
 * Печатается ровно то, что отфильтровано (все строки, без пагинации).
 */
export const printReport = (items: Item[], meta: ReportMeta = {}): void => {
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) {
    alert('Разрешите всплывающие окна для печати отчёта');
    return;
  }

  const totalQuantity =
    meta.totalQuantity ?? items.reduce((s, i) => s + (i.product_qnt || 0), 0);

  const filterRows = (meta.filterSummary || [])
    .map((r) => `<div><span class="k">${esc(r.label)}:</span> ${esc(r.value)}</div>`)
    .join('');

  const body = items
    .map(
      (i, idx) => `<tr>
        <td class="num">${idx + 1}</td>
        <td>${esc(i.name)}</td>
        <td>${esc(i.article)}</td>
        <td>${esc(i.shk)}</td>
        <td class="num">${esc(i.product_qnt)}</td>
        <td>${esc(i.prunit_name)}</td>
        <td>${esc(i.wr_name || i.wr_shk)}</td>
        <td>${esc(i.condition_state)}</td>
        <td>${esc(expirationText(i.expiration_date))}</td>
        <td>${esc(i.reason)}</td>
        <td>${esc(i.executor)}</td>
      </tr>`
    )
    .join('');

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
  <div class="summary">Строк: ${items.length} &nbsp;|&nbsp; Итого «Общее кол-во»: ${totalQuantity.toLocaleString('ru-RU')}</div>
  <table>
    <thead><tr>
      <th class="num">№</th><th>Название</th><th>Артикул</th><th>ШК</th>
      <th class="num">Кол-во</th><th>ЕХ</th><th>Ячейка</th><th>Состояние</th>
      <th>СГ</th><th>Причина</th><th>Исполнитель</th>
    </tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><td colspan="4">Итого</td><td class="num">${totalQuantity.toLocaleString('ru-RU')}</td><td colspan="6"></td></tr></tfoot>
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
