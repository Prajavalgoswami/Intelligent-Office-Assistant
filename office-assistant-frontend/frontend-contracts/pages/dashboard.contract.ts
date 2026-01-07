export const DashboardPageContract = {
  route: "/dashboard",
  title: "Dashboard",
  layout: "dashboard",

  stats: [
    { key: "emails", label: "Emails", value: 42 },
    { key: "tasks", label: "Pending Tasks", value: 3 },
    { key: "meetings", label: "Meetings", value: 2 }
  ]
};
