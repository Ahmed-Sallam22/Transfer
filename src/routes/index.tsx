import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TanfeezLoader } from "../components/ui";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import Transfer from "@/pages/dashboard/Transfer";
import TransferDetails from "@/pages/dashboard/TransferDetails";
import FundRequests from "@/pages/dashboard/FundRequests";
import FundRequestsDetails from "@/pages/dashboard/FundRequestsDetails";
import FundAdjustments from "@/pages/dashboard/FundAdjustments";
import FundAdjustmentsDetails from "@/pages/dashboard/FundAdjustmentsDetails";
import PendingTransfer from "@/pages/dashboard/PendingTransfer";
import PendingTransferDetails from "@/pages/dashboard/PendingTransferDetails";
import PendingAdjustments from "@/pages/dashboard/PendingAdjustments";
import PendingAdjustmentsDetails from "@/pages/dashboard/PendingAdjustmentsDetails";
import PendingRequests from "@/pages/dashboard/PendingRequests";
import PendingRequestsDetails from "@/pages/dashboard/PendingRequestsDetails";
import ProjectsOverview from "@/pages/dashboard/ProjectsOverview";
import AccountsProjects from "@/pages/dashboard/AccountsProjects";
import Users from "@/pages/dashboard/Users";
import Reports from "@/pages/dashboard/Reports";
import AddWorkFlow from "@/pages/dashboard/AddWorkFlow";
import WorkFlow from "@/pages/dashboard/WorkFlow";
import Envelope from "@/pages/dashboard/Envelope";

const SignIn = lazy(() => import("../pages/auth/SignIn"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Home = lazy(() => import("../pages/dashboard/Home"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<TanfeezLoader />}>
      <Routes>
        <Route
          path="/auth/sign-in"
          element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="PendingTransfer" element={<PendingTransfer />} />
          <Route
            path="PendingTransfer/:id"
            element={<PendingTransferDetails />}
          />
          <Route path="PendingAdjustments" element={<PendingAdjustments />} />
          <Route
            path="PendingAdjustments/:id"
            element={<PendingAdjustmentsDetails />}
          />
          <Route path="PendingRequests" element={<PendingRequests />} />
          <Route
            path="PendingRequests/:id"
            element={<PendingRequestsDetails />}
          />

          <Route path="transfer/:id" element={<TransferDetails />} />
          <Route path="fund-requests" element={<FundRequests />} />
          <Route path="FundAdjustments" element={<FundAdjustments />} />
          <Route
            path="FundAdjustments/:id"
            element={<FundAdjustmentsDetails />}
          />

          <Route path="FundRequests/:id" element={<FundRequestsDetails />} />
          <Route path="projects-overview" element={<ProjectsOverview />} />
          <Route path="accounts-projects" element={<AccountsProjects />} />
          <Route path="reports" element={<Reports />} />
          <Route path="envelope" element={<Envelope />} />
          <Route path="WorkFlow" element={<WorkFlow />} />
          <Route path="AddWorkFlow" element={<AddWorkFlow />} />
          <Route path="EditWorkFlow/:id" element={<AddWorkFlow />} />
          {/* Admin-only routes */}
          <Route
            path="users"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <Users />
              </RoleProtectedRoute>
            }
          />

          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/app" />} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Suspense>
  );
}
