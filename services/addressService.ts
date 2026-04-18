import apiClient from './apiClient';

export interface Address {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export const addressService = {
  async getUserAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>('/address');
    return response.data;
  },

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<Address>(`/address/${id}`);
    return response.data;
  },

  async createAddress(data: CreateAddressData): Promise<Address> {
    const response = await apiClient.post<Address>('/address', data);
    return response.data;
  },

  async updateAddress(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    const response = await apiClient.put<Address>(`/address/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/address/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.put<Address>(`/address/${id}/set-default`);
    return response.data;
  },
};
