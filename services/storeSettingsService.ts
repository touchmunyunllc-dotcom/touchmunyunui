import apiClient from './apiClient';
import publicApiClient from './publicApiClient';

export type SalesTaxSettings = {
  salesTaxRate: number;
  salesTaxPercent: number;
};

export const storeSettingsService = {
  async getSalesTax(): Promise<SalesTaxSettings> {
    const { data } = await publicApiClient.get<SalesTaxSettings>('/store-settings/sales-tax');
    return data;
  },

  async updateSalesTax(salesTaxPercent: number): Promise<SalesTaxSettings> {
    const { data } = await apiClient.put<SalesTaxSettings>('/store-settings/sales-tax', {
      salesTaxPercent,
    });
    return data;
  },
};
