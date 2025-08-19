import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату для отображения
 */
export const formatDate = (dateString: string, formatStr: string = 'dd.MM.yyyy'): string => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    
    return format(date, formatStr, { locale: ru });
  } catch {
    return dateString;
  }
};

/**
 * Форматирует дату и время для отображения
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'dd.MM.yyyy HH:mm');
};

/**
 * Форматирует срок годности
 */
export const formatExpirationDate = (dateString?: string): string => {
  if (!dateString || dateString === '2999-01-01') {
    return 'СГ отсутствует';
  }
  
  return formatDate(dateString);
};

/**
 * Форматирует числа с разделителями тысяч
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ru-RU');
};

/**
 * Обрезает длинный текст с многоточием
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
