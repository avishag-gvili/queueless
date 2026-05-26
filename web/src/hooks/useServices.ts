import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Service, ServiceCreate, ServiceUpdate } from "@/types/api";

/** Public — no auth required */
export function useBusinessServices(businessId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", businessId, "services", "public"],
    queryFn: async (): Promise<Service[]> => {
      const { data } = await api.get<Service[]>(`/public/businesses/${businessId}/services`);
      return data;
    },
    enabled: !!businessId,
  });
}

/** Owner — requires auth */
export function useOwnerServices(businessId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", businessId, "services"],
    queryFn: async (): Promise<Service[]> => {
      const { data } = await api.get<Service[]>(`/businesses/${businessId}/services`);
      return data;
    },
    enabled: !!businessId,
  });
}

export function useCreateService(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServiceCreate): Promise<Service> => {
      const { data } = await api.post<Service>(`/businesses/${businessId}/services`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses", businessId, "services"] });
    },
  });
}

export function useUpdateService(businessId: string, serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServiceUpdate): Promise<Service> => {
      const { data } = await api.patch<Service>(
        `/businesses/${businessId}/services/${serviceId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses", businessId, "services"] });
    },
  });
}

export function useDeleteService(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: string): Promise<void> => {
      await api.delete(`/businesses/${businessId}/services/${serviceId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses", businessId, "services"] });
    },
  });
}
