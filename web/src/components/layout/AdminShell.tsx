import { NavLink, Outlet, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMyBusinesses } from "@/hooks/useBusinesses";
import {
  LayoutDashboard,
  Building2,
  Scissors,
  Clock,
  CalendarDays,
  ChevronLeft,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

function SidebarLink({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function AdminShell() {
  const { id: businessId } = useParams<{ id: string }>();
  const { data: businesses } = useMyBusinesses();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-e border-border bg-muted/30 px-3 py-4 flex flex-col gap-1">
        <SidebarLink
          to="/admin/businesses"
          icon={<Building2 className="h-4 w-4" />}
          label="העסקים שלי"
          end
        />
        <SidebarLink
          to="/admin/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="לוח בקרה"
        />

        {/* Per-business sub-nav — shown when a business is selected */}
        {businessId && businesses && (
          <div className="mt-4 flex flex-col gap-1">
            <p className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              {businesses.find((b) => b.id === businessId)?.name ?? "עסק"}
            </p>
            <SidebarLink
              to={`/admin/businesses/${businessId}/services`}
              icon={<Scissors className="h-4 w-4" />}
              label="שירותים"
            />
            <SidebarLink
              to={`/admin/businesses/${businessId}/working-hours`}
              icon={<Clock className="h-4 w-4" />}
              label="שעות פעילות"
            />
            <SidebarLink
              to={`/admin/businesses/${businessId}/appointments`}
              icon={<CalendarDays className="h-4 w-4" />}
              label="תורים"
            />
            <SidebarLink
              to={`/admin/businesses/${businessId}`}
              icon={<ChevronLeft className="h-4 w-4" />}
              label="עריכת עסק"
              end
            />
          </div>
        )}
      </aside>

      {/* Page content */}
      <main className="flex-1 min-w-0 px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}
