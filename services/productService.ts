import apiClient from './apiClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  colors: string[];
  sizes: number[];
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  async getAll(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  }): Promise<Product[] | { products: Product[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
    const response = await apiClient.get<any>('/products', {
      params: filters,
    });
    
    // Check if response is paginated
    if (response.data.products || response.data.Products) {
      return {
        products: response.data.products || response.data.Products || [],
        totalCount: response.data.totalCount || response.data.TotalCount || 0,
        page: response.data.page || response.data.Page || 1,
        pageSize: response.data.pageSize || response.data.PageSize || 10,
        totalPages: response.data.totalPages || response.data.TotalPages || 0,
      };
    }
    
    // Backward compatibility - return array
    return Array.isArray(response.data) ? response.data : [];
  },

  async getNewArrivals(limit: number = 50): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/new-arrivals', {
      params: { limit },
    });
    return response.data;
  },

  async getBestSellers(limit: number = 50): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/best-sellers', {
      params: { limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(product: {
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    imageUrl: string;
    category: string;
    stock: number;
    colors?: string[];
    sizes?: number[];
  }) {
    const response = await apiClient.post<Product>('/products', product);
    return response.data;
  },

  async update(id: string, product: {
    name?: string;
    description?: string;
    price?: number;
    salePrice?: number;
    imageUrl?: string;
    category?: string;
    stock?: number;
    colors?: string[];
    sizes?: number[];
  }) {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  async updatePrice(id: string, price?: number, salePrice?: number, clearSalePrice?: boolean) {
    const response = await apiClient.put<Product>(`/products/${id}/price`, {
      price,
      salePrice,
      clearSalePrice,
    });
    return response.data;
  },

  async bulkUpdatePrices(productIds: string[], options: {
    price?: number;
    salePrice?: number;
    adjustmentType?: 'percentage' | 'fixed';
    adjustmentValue?: number;
  }) {
    const response = await apiClient.put<{ message: string; count: number }>('/products/bulk-price', {
      productIds,
      ...options,
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

