import apiClient from './apiClient';
import publicApiClient from './publicApiClient';

export type SalesTaxSettings = {
  salesTaxRate: number;
  salesTaxPercent: number;
};

export type ShippingSettings = {
  standardUsd: number;
  internationalUsd: number;
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

  async getShipping(): Promise<ShippingSettings> {
    const { data } = await publicApiClient.get<ShippingSettings>('/store-settings/shipping');
    return data;
  },

  async updateShipping(standardUsd: number, internationalUsd: number): Promise<ShippingSettings> {
    const { data } = await apiClient.put<ShippingSettings>('/store-settings/shipping', {
      standardUsd,
      internationalUsd,
    });
    return data;
  },
};
