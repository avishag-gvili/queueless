import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Slot } from "@/types/api";

export function useAvailableSlots(
  businessId: string | undefined,
  serviceId: string | undefined,
  date: string | undefined, // YYYY-MM-DD
) {
  return useQuery({
    queryKey: ["slots", businessId, serviceId, date],
    queryFn: async (): Promise<Slot[]> => {
      const { data } = await api.get<Slot[]>(
        `/businesses/${businessId}/services/${serviceId}/slots`,
        { params: { target_date: date } },
      );
      return data;
    },
    enabled: !!businessId && !!serviceId && !!date,
  });
}
