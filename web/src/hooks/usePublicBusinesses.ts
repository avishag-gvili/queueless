import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BusinessCategory, PublicBusinessList } from '@/types/api';

interface UsePublicBusinessesParams {
  q?: string;
  category?: BusinessCategory | null;
  city?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  limit?: number;
  offset?: number;
}

export function usePublicBusinesses({
  q,
  category,
  city,
  priceMin,
  priceMax,
  limit = 20,
  offset = 0,
}: UsePublicBusinessesParams = {}) {
  return useQuery({
    queryKey: ['businesses-public', { q, category, city, priceMin, priceMax, limit, offset }],
    queryFn: async (): Promise<PublicBusinessList> => {
      const params: Record<string, string | number> = { limit, offset };
      if (q) params.q = q;
      if (category) params.category = category;
      if (city) params.city = city;
      if (priceMin != null) params.price_min = priceMin;
      if (priceMax != null) params.price_max = priceMax;
      const { data } = await api.get<PublicBusinessList>('/public/businesses', { params });
      return data;
    },
  });
}

export function usePublicCities() {
  return useQuery({
    queryKey: ['public-cities'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await api.get<string[]>('/public/cities');
      return data;
    },
    staleTime: 5 * 60 * 1000, // cities don't change often, cache 5 min
  });
}
