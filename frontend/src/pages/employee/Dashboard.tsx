import { Card } from "../../components/ui/Card";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";
import { DashboardWidgets } from "./DashboardWidgets";
import { TodayTasksSnippet } from "./TodayTasksSnippet";

export function EmployeeDashboard() {
  const { user } = useEmployeeAuth();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Welcome"
          description="Your personal workspace overview"
          className="md:col-span-2"
        >
          <p className="text-sm text-slate-700 dark:text-slate-100">
            Signed in as{" "}
            <span className="font-semibold">
              {user?.name || user?.email || user?.user_id || "employee user"}
            </span>
            .
          </p>
          {user?.roles && user.roles.length > 0 && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Roles: {user.roles.join(", ")}
            </p>
          )}
        </Card>

        <TodayTasksSnippet />
      </div>

      <DashboardWidgets />
    </div>
  );
}

