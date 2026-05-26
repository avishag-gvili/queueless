import type { ReactNode } from "react";
import type { UserRole } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: Props) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold text-destructive">403</h1>
        <p className="text-muted-foreground">אין לך הרשאה לצפות בדף זה.</p>
      </div>
    );
  }

  return <>{children}</>;
}
