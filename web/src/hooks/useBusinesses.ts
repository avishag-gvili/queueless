import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Business, BusinessCreate, BusinessUpdate } from "@/types/api";

export function useBusiness(id: string | undefined) {
  return useQuery({
    queryKey: ["businesses", id, "public"],
    queryFn: async (): Promise<Business> => {
      const { data } = await api.get<Business>(`/public/businesses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useMyBusinesses() {
  return useQuery({
    queryKey: ["businesses", "my"],
    queryFn: async (): Promise<Business[]> => {
      const { data } = await api.get<Business[]>("/businesses");
      return data;
    },
  });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BusinessCreate): Promise<Business> => {
      const { data } = await api.post<Business>("/businesses", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}

export function useUpdateBusiness(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BusinessUpdate): Promise<Business> => {
      const { data } = await api.patch<Business>(`/businesses/${businessId}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}

export function useDeleteBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (businessId: string): Promise<void> => {
      await api.delete(`/businesses/${businessId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}
