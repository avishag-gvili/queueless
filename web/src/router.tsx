import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { HomePage } from "@/pages/public/HomePage";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";

// Lazy-loaded pages — not needed for most visitors
const HowItWorksPage = lazy(() =>
  import("@/pages/public/HowItWorksPage").then((m) => ({ default: m.HowItWorksPage })),
);
const ForBusinessPage = lazy(() =>
  import("@/pages/public/ForBusinessPage").then((m) => ({ default: m.ForBusinessPage })),
);
const BusinessesIndexPage = lazy(() =>
  import("@/pages/public/BusinessesIndexPage").then((m) => ({ default: m.BusinessesIndexPage })),
);
const BusinessPublicPage = lazy(() =>
  import("@/pages/public/BusinessPublicPage").then((m) => ({ default: m.BusinessPublicPage })),
);
const PrivacyPolicyPage = lazy(() =>
  import("@/pages/public/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage })),
);
const TermsOfServicePage = lazy(() =>
  import("@/pages/public/TermsOfServicePage").then((m) => ({ default: m.TermsOfServicePage })),
);
const MyAppointmentsPage = lazy(() =>
  import("@/pages/customer/MyAppointmentsPage").then((m) => ({
    default: m.MyAppointmentsPage,
  })),
);
const AdminShell = lazy(() =>
  import("@/components/layout/AdminShell").then((m) => ({ default: m.AdminShell })),
);
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const BusinessesListPage = lazy(() =>
  import("@/pages/admin/BusinessesListPage").then((m) => ({ default: m.BusinessesListPage })),
);
const BusinessNewPage = lazy(() =>
  import("@/pages/admin/BusinessNewPage").then((m) => ({ default: m.BusinessNewPage })),
);
const BusinessEditPage = lazy(() =>
  import("@/pages/admin/BusinessEditPage").then((m) => ({ default: m.BusinessEditPage })),
);
const ServicesPage = lazy(() =>
  import("@/pages/admin/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
const WorkingHoursPage = lazy(() =>
  import("@/pages/admin/WorkingHoursPage").then((m) => ({ default: m.WorkingHoursPage })),
);
const AppointmentsPage = lazy(() =>
  import("@/pages/admin/AppointmentsPage").then((m) => ({ default: m.AppointmentsPage })),
);

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner />
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/how-it-works"
          element={
            <Suspense fallback={<PageFallback />}>
              <HowItWorksPage />
            </Suspense>
          }
        />
        <Route
          path="/for-business"
          element={
            <Suspense fallback={<PageFallback />}>
              <ForBusinessPage />
            </Suspense>
          }
        />
        <Route
          path="/businesses"
          element={
            <Suspense fallback={<PageFallback />}>
              <BusinessesIndexPage />
            </Suspense>
          }
        />
        <Route
          path="/businesses/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <BusinessPublicPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<PageFallback />}>
              <PrivacyPolicyPage />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageFallback />}>
              <TermsOfServicePage />
            </Suspense>
          }
        />

        {/* Customer routes — any authenticated user */}
        <Route
          path="/my/appointments"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageFallback />}>
                <MyAppointmentsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin routes — business_owner only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["business_owner"]}>
                <Suspense fallback={<PageFallback />}>
                  <AdminShell />
                </Suspense>
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/businesses" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="businesses"
            element={
              <Suspense fallback={<PageFallback />}>
                <BusinessesListPage />
              </Suspense>
            }
          />
          <Route
            path="businesses/new"
            element={
              <Suspense fallback={<PageFallback />}>
                <BusinessNewPage />
              </Suspense>
            }
          />
          <Route
            path="businesses/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <BusinessEditPage />
              </Suspense>
            }
          />
          <Route
            path="businesses/:id/services"
            element={
              <Suspense fallback={<PageFallback />}>
                <ServicesPage />
              </Suspense>
            }
          />
          <Route
            path="businesses/:id/working-hours"
            element={
              <Suspense fallback={<PageFallback />}>
                <WorkingHoursPage />
              </Suspense>
            }
          />
          <Route
            path="businesses/:id/appointments"
            element={
              <Suspense fallback={<PageFallback />}>
                <AppointmentsPage />
              </Suspense>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
