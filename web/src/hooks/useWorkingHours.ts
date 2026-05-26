import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkingHours, WorkingHoursCreate } from "@/types/api";

/** Public — no auth required */
export function useWorkingHours(businessId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", businessId, "working-hours", "public"],
    queryFn: async (): Promise<WorkingHours[]> => {
      const { data } = await api.get<WorkingHours[]>(`/public/businesses/${businessId}/working-hours`);
      return data;
    },
    enabled: !!businessId,
  });
}

/** Owner — requires auth */
export function useOwnerWorkingHours(businessId: string | undefined) {
  return useQuery({
    queryKey: ["businesses", businessId, "working-hours"],
    queryFn: async (): Promise<WorkingHours[]> => {
      const { data } = await api.get<WorkingHours[]>(`/businesses/${businessId}/working-hours`);
      return data;
    },
    enabled: !!businessId,
  });
}

export function useCreateWorkingHours(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WorkingHoursCreate): Promise<WorkingHours> => {
      const { data } = await api.post<WorkingHours>(`/businesses/${businessId}/working-hours`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses", businessId, "working-hours"] });
    },
  });
}

export function useDeleteWorkingHours(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (whId: string): Promise<void> => {
      await api.delete(`/businesses/${businessId}/working-hours/${whId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses", businessId, "working-hours"] });
    },
  });
}
