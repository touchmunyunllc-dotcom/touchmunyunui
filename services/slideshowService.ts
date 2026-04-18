import apiClient from './apiClient';

export interface Slide {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSlideRequest {
  imageUrl: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSlideRequest {
  imageUrl?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
}

export const slideshowService = {
  getAll: async (options?: { page?: number; pageSize?: number }): Promise<Slide[] | { slides: Slide[]; totalCount: number; page: number; pageSize: number; totalPages: number }> => {
    const response = await apiClient.get<any>('/slideshow', {
      params: options,
    });
    
    // Check if response is paginated
    if (response.data.slides || response.data.Slides) {
      return {
        slides: response.data.slides || response.data.Slides || [],
        totalCount: response.data.totalCount || response.data.TotalCount || 0,
        page: response.data.page || response.data.Page || 1,
        pageSize: response.data.pageSize || response.data.PageSize || 10,
        totalPages: response.data.totalPages || response.data.TotalPages || 0,
      };
    }
    
    // Backward compatibility - return array
    return Array.isArray(response.data) ? response.data : [];
  },

  getActive: async (): Promise<Slide[]> => {
    try {
      const response = await apiClient.get<Slide[]>('/slideshow/active');
      console.log('Slideshow API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Slideshow API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  getById: async (id: string): Promise<Slide> => {
    const response = await apiClient.get<Slide>(`/slideshow/${id}`);
    return response.data;
  },

  create: async (slide: CreateSlideRequest): Promise<Slide> => {
    const response = await apiClient.post<Slide>('/slideshow', slide);
    return response.data;
  },

  update: async (id: string, slide: UpdateSlideRequest): Promise<Slide> => {
    const response = await apiClient.put<Slide>(`/slideshow/${id}`, slide);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/slideshow/${id}`);
  },

  reorder: async (slideIds: string[]): Promise<void> => {
    await apiClient.put('/slideshow/reorder', { slideIds });
  },
};

