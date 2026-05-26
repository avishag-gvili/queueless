import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isBefore, startOfToday } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useAvailableSlots } from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { formatDateTimeHebrew, formatTimeHebrew, toApiDate } from "@/lib/dates";
import type { Business, Service, Appointment } from "@/types/api";

// ── Step types ──────────────────────────────────────────────────────────────

type Step = "date" | "slot" | "details" | "confirmation";

// ── Details form schema ─────────────────────────────────────────────────────

const detailsSchema = z.object({
  customer_name: z.string().min(1, "שם חובה").max(200),
  customer_email: z.string().email("אימייל לא תקין"),
  customer_phone: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

type DetailsValues = z.infer<typeof detailsSchema>;

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  business: Business;
  service: Service;
  onClose: () => void;
}

// ── BookingFlow ──────────────────────────────────────────────────────────────

export function BookingFlow({ business, service, onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dateStr = selectedDate ? toApiDate(selectedDate) : undefined;

  const { data: slots, isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } =
    useAvailableSlots(business.id, service.id, dateStr);

  const { mutateAsync: createAppointment, isPending: isBooking } = useCreateAppointment();

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      customer_name: user?.full_name ?? "",
      customer_email: user?.email ?? "",
      customer_phone: "",
      notes: "",
    },
  });

  const onSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) setStep("slot");
  };

  const onSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const onSubmitDetails = async (values: DetailsValues) => {
    if (!selectedSlot) return;
    setSubmitError(null);
    try {
      const appt = await createAppointment({
        service_id: service.id,
        starts_at: selectedSlot,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone || undefined,
        notes: values.notes || undefined,
      });
      setBookedAppointment(appt);
      setStep("confirmation");
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { detail?: string } } };
      if (e.response?.status === 409) {
        // Slot was just taken — go back to slot selection and refetch
        setSelectedSlot(null);
        setStep("slot");
        refetchSlots();
        setSubmitError("הזמן הנבחר כבר תפוס. בחר זמן אחר.");
      } else {
        setSubmitError(e.response?.data?.detail ?? "שגיאה בהזמנת התור. נסה שוב.");
      }
    }
  };

  const title =
    step === "date"
      ? "בחר תאריך"
      : step === "slot"
        ? "בחר שעה"
        : step === "details"
          ? "פרטי הזמנה"
          : "תור אושר!";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {service.name} · {service.duration_minutes != null ? `${service.duration_minutes} דק'` : 'משך פתוח'}
          </p>
        </DialogHeader>

        {/* Step 1: Date */}
        {step === "date" && (
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              disabled={(date) => isBefore(date, startOfToday())}
            />
          </div>
        )}

        {/* Step 2: Slot */}
        {step === "slot" && (
          <div className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}
            {slotsLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}
            {slotsError && <ErrorBanner error={slotsError} />}
            {!slotsLoading && !slotsError && slots && slots.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                אין זמנים פנויים ביום זה.
              </p>
            )}
            {!slotsLoading && slots && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <Button
                    key={slot.starts_at}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectSlot(slot.starts_at)}
                    title={
                      service.duration_minutes == null
                        ? `התחלה ${formatTimeHebrew(slot.starts_at)} (משך פתוח)`
                        : undefined
                    }
                  >
                    {service.duration_minutes == null
                      ? `${formatTimeHebrew(slot.starts_at)} (פתוח)`
                      : formatTimeHebrew(slot.starts_at)}
                  </Button>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setStep("date")}>
              ← חזרה לבחירת תאריך
            </Button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <form onSubmit={form.handleSubmit(onSubmitDetails)} className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_name">שם מלא *</Label>
              <Input id="customer_name" {...form.register("customer_name")} />
              {form.formState.errors.customer_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customer_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_email">אימייל *</Label>
              <Input
                id="customer_email"
                type="email"
                dir="ltr"
                {...form.register("customer_email")}
              />
              {form.formState.errors.customer_email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customer_email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_phone">טלפון (לא חובה)</Label>
              <Input id="customer_phone" type="tel" dir="ltr" {...form.register("customer_phone")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">הערות (לא חובה)</Label>
              <Input id="notes" {...form.register("notes")} />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("slot")}
                className="flex-1"
              >
                חזרה
              </Button>
              <Button type="submit" disabled={isBooking} className="flex-1">
                {isBooking ? "מזמין..." : "אשר הזמנה"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirmation" && bookedAppointment && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-lg font-semibold text-foreground">התור שלך אושר!</p>
            <p className="text-muted-foreground">
              {formatDateTimeHebrew(bookedAppointment.starts_at)}
            </p>
            <p className="text-sm text-muted-foreground">
              אישור נשלח לכתובת: {bookedAppointment.customer_email}
            </p>
            <Button onClick={onClose} className="w-full">
              סגור
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
