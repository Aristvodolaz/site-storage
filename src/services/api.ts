import axios, { AxiosResponse } from 'axios';
import { Item, ApiResponse } from '@/types/item';

const API_BASE_URL = 'http://10.171.12.36:3006';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Интерсептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Ошибка от сервера
      throw new Error(`Ошибка сервера: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      // Ошибка сети
      throw new Error('Ошибка сети. Проверьте подключение к интернету');
    } else {
      // Другие ошибки
      throw new Error(`Неизвестная ошибка: ${error.message}`);
    }
  }
);

export class StorageApi {
  /**
   * Получение списка товаров со склада
   */
  static async getItems(limit: number = 50000, idSklad: number = 1383): Promise<Item[]> {
    try {
      const response: AxiosResponse<ApiResponse<Item>> = await apiClient.get(
        `/api/storage/all?limit=${limit}&id_sklad=${idSklad}`
      );

      if (response.data?.data?.items) {
        return response.data.data.items.map(this.transformItem);
      }

      return [];
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      throw error;
    }
  }

  /**
   * Добавление нового товара
   */
  static async addItem(item: Partial<Item>, executor: string): Promise<any> {
    const payload = {
      ...item,
      executor,
    };

    const response = await apiClient.post('/api/storage/all', payload);
    return response.data;
  }

  /**
   * Перемещение товара
   */
  static async moveItem(
    article: string,
    shk: string,
    quantity: number,
    oldWrShk: string,
    newWrShk: string,
    executor: string
  ): Promise<any> {
    const payload = {
      article,
      shk,
      quantity,
      old_wr_shk: oldWrShk,
      new_wr_shk: newWrShk,
      executor,
    };

    const response = await apiClient.patch('/storage/item/move', payload);
    return response.data;
  }

  /**
   * Списание товара
   */
  static async writeOffItem(
    article: string,
    shk: string,
    quantity: number,
    wrShk: string,
    executor: string,
    reason: string = ''
  ): Promise<any> {
    const payload = {
      article,
      shk,
      quantity,
      wr_shk: wrShk,
      executor,
      reason,
    };

    const response = await apiClient.patch('/storage/item/write-off', payload);
    return response.data;
  }

  /**
   * Трансформация данных товара из API в клиентский формат
   */
  private static transformItem(apiItem: any): Item {
    // Вычисляем правильные значения количества
    const rawQuantity = parseInt(apiItem.placeQnt || '0');
    const rawProductQnt = parseInt(apiItem.productQnt || '0');
    
    let quantity = 0;
    let nestedQuantity = rawProductQnt;
    let productQnt = rawQuantity;

    if (rawProductQnt > 0 && rawQuantity > 0) {
      productQnt = rawQuantity;
      nestedQuantity = rawProductQnt;
      quantity = Math.floor(productQnt / nestedQuantity);
    }

    return {
      id: apiItem.id,
      name: apiItem.name || '',
      article: apiItem.article || '',
      shk: apiItem.shk || '',
      quantity,
      nested_quantity: nestedQuantity,
      product_qnt: productQnt,
      wr_shk: apiItem.wrShk || '',
      wr_name: apiItem.name_wr_shk || '',
      id_sklad: apiItem.idScklad,
      prunit_name: apiItem.prunitName || '',
      condition_state: apiItem.conditionState || '',
      reason: apiItem.reason || '',
      expiration_date: apiItem.expirationDate,
      createDate: apiItem.createDate || '',
      updateDate: apiItem.updateDate || '',
      executor: apiItem.executor || '',
    };
  }
}

export default StorageApi;
