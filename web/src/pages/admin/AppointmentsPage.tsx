import { useParams } from "react-router-dom";
import { useBusinessAppointments, useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimeHebrew } from "@/lib/dates";
import type { Appointment, AppointmentStatus } from "@/types/api";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "ממתין",
  confirmed: "מאושר",
  cancelled: "מבוטל",
  completed: "הושלם",
  no_show: "לא הגיע",
};

const STATUS_VARIANTS: Record<AppointmentStatus, BadgeProps["variant"]> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  completed: "secondary",
  no_show: "outline",
};

const OWNER_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  cancelled: [],
  completed: [],
  no_show: [],
};

const TRANSITION_LABELS: Record<AppointmentStatus, string> = {
  pending: "ממתין",
  confirmed: "אשר",
  cancelled: "בטל",
  completed: "הושלם",
  no_show: "לא הגיע",
};

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const { mutateAsync: updateStatus, isPending } = useUpdateAppointmentStatus();
  const transitions = OWNER_TRANSITIONS[appointment.status];
  const isAnonymized = appointment.anonymized_at != null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">
            {appointment.customer_name}
            {!isAnonymized && appointment.customer_phone && (
              <span className="text-muted-foreground font-normal"> · {appointment.customer_phone}</span>
            )}
          </p>
          {isAnonymized && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              מידע אנונימי
            </Badge>
          )}
        </div>
        {appointment.service_name && (
          <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {formatDateTimeHebrew(appointment.starts_at)}
          {appointment.service_duration_minutes == null && (
            <span className="ms-1 text-xs">(משך פתוח)</span>
          )}
        </p>
        {appointment.notes && (
          <p className="text-xs text-muted-foreground">הערה: {appointment.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <Badge variant={STATUS_VARIANTS[appointment.status]}>
          {STATUS_LABELS[appointment.status]}
        </Badge>
        {transitions.map((nextStatus) => (
          <Button
            key={nextStatus}
            variant={nextStatus === "cancelled" ? "destructive" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() =>
              updateStatus({ appointmentId: appointment.id, payload: { status: nextStatus } })
            }
          >
            {TRANSITION_LABELS[nextStatus]}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const { data: appointments, isLoading, error } = useBusinessAppointments(businessId);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorBanner error={error} className="my-8" />;

  const active = appointments?.filter((a) => a.status !== "cancelled") ?? [];
  const cancelled = appointments?.filter((a) => a.status === "cancelled") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">תורים</h1>

      {!appointments || appointments.length === 0 ? (
        <EmptyState message="אין תורים עדיין." />
      ) : (
        <>
          {active.length > 0 && (
            <section className="rounded-lg border border-border bg-card px-4">
              {active.map((appt) => (
                <AppointmentRow key={appt.id} appointment={appt} />
              ))}
            </section>
          )}

          {cancelled.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">מבוטלים</h2>
              <div className="rounded-lg border border-border bg-card px-4 opacity-60">
                {cancelled.map((appt) => (
                  <AppointmentRow key={appt.id} appointment={appt} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
