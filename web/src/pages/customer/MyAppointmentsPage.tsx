import { isAfter, parseISO } from "date-fns";
import { useMyAppointments } from "@/hooks/useAppointments";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { AppointmentCard } from "@/features/appointments/AppointmentCard";
import type { Appointment } from "@/types/api";

function isUpcoming(appt: Appointment): boolean {
  return appt.status !== "cancelled" && isAfter(parseISO(appt.starts_at), new Date());
}

export function MyAppointmentsPage() {
  const { data, isLoading, error } = useMyAppointments();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorBanner error={error} className="my-8" />;

  const upcoming = data?.filter(isUpcoming) ?? [];
  const history = data?.filter((a) => !isUpcoming(a)) ?? [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-foreground">התורים שלי</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">תורים עתידיים</h2>
        {upcoming.length === 0 ? (
          <EmptyState message="אין לך תורים קרובים." />
        ) : (
          upcoming.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} showCancelButton />
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-muted-foreground">היסטוריה</h2>
        {history.length === 0 ? (
          <EmptyState message="אין היסטוריית תורים." />
        ) : (
          history.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))
        )}
      </section>
    </div>
  );
}
