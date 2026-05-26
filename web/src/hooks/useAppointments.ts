import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Appointment, AppointmentCreate, AppointmentStatusUpdate } from "@/types/api";

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AppointmentCreate): Promise<Appointment> => {
      const { data } = await api.post<Appointment>("/appointments", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useMyAppointments() {
  return useQuery({
    queryKey: ["appointments", "my"],
    queryFn: async (): Promise<Appointment[]> => {
      const { data } = await api.get<Appointment[]>("/appointments/my");
      return data;
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: AppointmentStatusUpdate;
    }): Promise<Appointment> => {
      const { data } = await api.patch<Appointment>(
        `/appointments/${appointmentId}/status`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useBusinessAppointments(businessId: string | undefined) {
  return useQuery({
    queryKey: ["appointments", "business", businessId],
    queryFn: async (): Promise<Appointment[]> => {
      const { data } = await api.get<Appointment[]>(`/businesses/${businessId}/appointments`);
      return data;
    },
    enabled: !!businessId,
  });
}
