import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDateTimeHebrew } from "@/lib/dates";
import { useUpdateAppointmentStatus } from "@/hooks/useAppointments";
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

interface Props {
  appointment: Appointment;
  showCancelButton?: boolean;
}

export function AppointmentCard({ appointment, showCancelButton = false }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutateAsync: updateStatus, isPending } = useUpdateAppointmentStatus();

  const handleCancel = async () => {
    await updateStatus({ appointmentId: appointment.id, payload: { status: "cancelled" } });
    setConfirmOpen(false);
  };

  return (
    <>
      <Card>
        <CardContent className="flex items-start justify-between gap-4 pt-4">
          <div className="flex flex-col gap-1">
            {(appointment.business_name || appointment.service_name) && (
              <p className="font-medium text-foreground">
                {appointment.business_name && (
                  <span>{appointment.business_name}</span>
                )}
                {appointment.business_name && appointment.service_name && " · "}
                {appointment.service_name && (
                  <span className="text-muted-foreground">{appointment.service_name}</span>
                )}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {formatDateTimeHebrew(appointment.starts_at)}
              {appointment.service_duration_minutes == null && (
                <span className="ms-1 text-xs">(משך פתוח)</span>
              )}
            </p>
            {appointment.notes && (
              <p className="text-sm text-muted-foreground">הערה: {appointment.notes}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[appointment.status]}>
              {STATUS_LABELS[appointment.status]}
            </Badge>
            {showCancelButton && appointment.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                בטל
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ביטול תור</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            האם אתה בטוח שברצונך לבטל את התור ל-{formatDateTimeHebrew(appointment.starts_at)}?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              חזרה
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
              {isPending ? "מבטל..." : "בטל תור"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
