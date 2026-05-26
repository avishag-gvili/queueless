import { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOwnerServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Service } from "@/types/api";

const serviceSchema = z.object({
  name: z.string().min(1, "שם חובה").max(200),
  description: z.string().max(1000).optional(),
  duration_minutes: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(1, "מינימום 1 דקה").max(480, "מקסימום 480 דקות").optional(),
  ),
  price: z.coerce.number().min(0).optional(),
  customer_data_retention_days_override: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(0).optional(),
  ),
});

type ServiceForm = z.infer<typeof serviceSchema>;

function ServiceFormDialog({
  open,
  onOpenChange,
  initial,
  businessId,
  serviceId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Service;
  businessId: string;
  serviceId?: string;
}) {
  const { mutateAsync: createService, isPending: creating } = useCreateService(businessId);
  const { mutateAsync: updateService, isPending: updating } = useUpdateService(
    businessId,
    serviceId ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    values: initial
      ? {
          name: initial.name,
          description: initial.description ?? "",
          duration_minutes: initial.duration_minutes,
          price: initial.price ? parseFloat(initial.price) : undefined,
          customer_data_retention_days_override: initial.customer_data_retention_days_override ?? undefined,
        }
      : { name: "", description: "", duration_minutes: undefined, price: undefined, customer_data_retention_days_override: undefined },
  });

  const onSubmit = async (values: ServiceForm) => {
    setSubmitError(null);
    try {
      if (initial && serviceId) {
        await updateService({
          name: values.name,
          description: values.description || undefined,
          duration_minutes: values.duration_minutes,
          price: values.price,
          customer_data_retention_days_override: values.customer_data_retention_days_override ?? null,
        });
      } else {
        await createService({
          name: values.name,
          description: values.description || undefined,
          duration_minutes: values.duration_minutes,
          price: values.price,
          customer_data_retention_days_override: values.customer_data_retention_days_override ?? null,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setSubmitError(e.response?.data?.detail ?? "שגיאה בשמירת השירות.");
    }
  };

  const isPending = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? "עריכת שירות" : "שירות חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          {submitError && <ErrorBanner error={submitError} />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-name">שם *</Label>
            <Input id="svc-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-desc">תיאור</Label>
            <Input id="svc-desc" {...form.register("description")} />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="svc-dur">משך (דקות)</Label>
              <Input
                id="svc-dur"
                type="number"
                min={1}
                max={480}
                placeholder="השאר ריק למשך פתוח"
                {...form.register("duration_minutes")}
              />
              {form.formState.errors.duration_minutes ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.duration_minutes.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  אם לא תזין משך, התור יוצג ללקוח כ-'משך פתוח'
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="svc-price">מחיר (₪)</Label>
              <Input id="svc-price" type="number" min={0} step="0.01" {...form.register("price")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-retention">שמירת מידע (ימים)</Label>
            <Input
              id="svc-retention"
              type="number"
              min={0}
              placeholder="ברירת מחדל לעסק"
              {...form.register("customer_data_retention_days_override")}
            />
            <p className="text-xs text-muted-foreground">
              ריק = עוקב אחר הגדרות העסק
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "שומר..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ServicesPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const { data: services, isLoading, error } = useOwnerServices(businessId);
  const { mutateAsync: deleteService } = useDeleteService(businessId!);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  const openCreate = () => {
    setEditingService(undefined);
    setFormOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorBanner error={error} className="my-8" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">שירותים</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          שירות חדש
        </Button>
      </div>

      {!services || services.length === 0 ? (
        <EmptyState message="אין שירותים עדיין. לחץ 'שירות חדש' כדי להוסיף." />
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center justify-between gap-4 pt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{service.name}</p>
                    {!service.active && (
                      <Badge variant="outline" className="text-xs">
                        לא פעיל
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {service.duration_minutes != null ? `${service.duration_minutes} דק'` : 'משך פתוח'}
                    {service.price && ` · ₪${parseFloat(service.price).toFixed(0)}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">ערוך</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">מחק</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {businessId && (
        <ServiceFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingService}
          businessId={businessId}
          serviceId={editingService?.id}
        />
      )}
    </div>
  );
}
