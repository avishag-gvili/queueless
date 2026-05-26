import { useQueries } from "@tanstack/react-query";
import { isToday, isThisWeek, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { useMyBusinesses } from "@/hooks/useBusinesses";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CalendarDays, CalendarCheck } from "lucide-react";
import type { Appointment, Business } from "@/types/api";

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-accent-warm">{value}</p>
      </CardContent>
    </Card>
  );
}

function activeOnly(appointments: Appointment[]) {
  return appointments.filter((a) => a.status !== "cancelled");
}

function countToday(appointments: Appointment[]) {
  return activeOnly(appointments).filter((a) => isToday(parseISO(a.starts_at))).length;
}

function countThisWeek(appointments: Appointment[]) {
  return activeOnly(appointments).filter((a) =>
    isThisWeek(parseISO(a.starts_at), { weekStartsOn: 0 }),
  ).length;
}

function BreakdownRow({
  business,
  appointments,
}: {
  business: Business;
  appointments: Appointment[];
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium">{business.name}</span>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>{countToday(appointments)} היום</span>
        <span>{countThisWeek(appointments)} השבוע</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: businesses, isLoading: isLoadingBusinesses } = useMyBusinesses();

  const appointmentQueries = useQueries({
    queries: (businesses ?? []).map((b) => ({
      queryKey: ["appointments", "business", b.id] as const,
      queryFn: async (): Promise<Appointment[]> => {
        const { data } = await api.get<Appointment[]>(`/businesses/${b.id}/appointments`);
        return data;
      },
    })),
  });

  const isLoadingAppointments = appointmentQueries.some((q) => q.isLoading);

  if (isLoadingBusinesses) return <LoadingSpinner fullPage />;

  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">לוח בקרה</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center gap-4">
          <p className="text-sm text-muted-foreground">
            עדיין לא הוספת עסק. צור עסק ראשון כדי להתחיל.
          </p>
          <Button asChild size="sm">
            <Link to="/admin/businesses/new">צור עסק ראשון</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingAppointments) return <LoadingSpinner fullPage />;

  const allAppointments = appointmentQueries.flatMap((q) => q.data ?? []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">לוח בקרה</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="עסקים"
          value={businesses.length}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatsCard
          title="תורים היום"
          value={countToday(allAppointments)}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatsCard
          title="תורים השבוע"
          value={countThisWeek(allAppointments)}
          icon={<CalendarCheck className="h-4 w-4" />}
        />
      </div>

      {businesses.length > 1 && (
        <div className="rounded-lg border border-border bg-card px-4">
          <h2 className="text-sm font-semibold text-muted-foreground pt-3 pb-1">פירוט לפי עסק</h2>
          {businesses.map((b, i) => (
            <BreakdownRow
              key={b.id}
              business={b}
              appointments={appointmentQueries[i]?.data ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
