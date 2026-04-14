import { Outlet, useLocation } from "react-router-dom";
import { EnterpriseShell, type SidebarLink } from "./EnterpriseShell";
import { useEmployeeAuth } from "../auth/EmployeeAuthContext";
import { useNotifications } from "../context/NotificationContext";

const dashboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
  </svg>
);

const serviceRequestsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
  </svg>
);

const chatIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const broadcastIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const documentsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const conversationIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const gmailIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const profileIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

function getSidebarLinks(unreadBroadcastCount: number): SidebarLink[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      to: "/app",
      exact: true,
      icon: dashboardIcon,
    },
    {
      id: "tasks-today",
      label: "Today’s Tasks",
      to: "/app/tasks/today",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "service-requests",
      label: "Service Requests",
      to: "/app/service-requests",
      icon: serviceRequestsIcon,
    },
    { id: "chat", label: "Chat", to: "/app/chat", icon: chatIcon },
    {
      id: "broadcast",
      label: "Broadcasts",
      to: "/app/broadcast",
      badgeCount: unreadBroadcastCount,
      icon: broadcastIcon,
    },
    {
      id: "documents",
      label: "Documents",
      to: "/app/documents",
      icon: documentsIcon,
    },
    {
      id: "conversation",
      label: "Conversation",
      to: "/app/conversation",
      icon: conversationIcon,
    },
    { id: "gmail", label: "Gmail", to: "/app/gmail", icon: gmailIcon },
    {
      id: "profile",
      label: "Profile",
      to: "/app/profile",
      icon: profileIcon,
    },
  ];
}

function getPageTitle(pathname: string): string {
  if (pathname === "/app" || pathname === "/app/") return "Dashboard";
  if (pathname.startsWith("/app/tasks/today")) return "Today’s Tasks";
  if (pathname.startsWith("/app/service-requests")) return "Service Requests";
  if (pathname.startsWith("/app/chat")) return "Chat";
  if (pathname.startsWith("/app/broadcast")) return "Broadcasts";
  if (pathname.startsWith("/app/documents")) return "Documents";
  if (pathname.startsWith("/app/conversation")) return "Conversation";
  if (pathname.startsWith("/app/gmail")) return "Gmail";
  if (pathname.startsWith("/app/profile")) return "Profile";
  return "Workspace";
}

export function EmployeeAppLayout() {
  const location = useLocation();
  const { user } = useEmployeeAuth();
  const { unreadBroadcastCount } = useNotifications();

  return (
      <EnterpriseShell
        pageTitle={getPageTitle(location.pathname)}
        sidebarLinks={getSidebarLinks(unreadBroadcastCount)}
        profileHref="/app/profile"
        userDisplayName={
          user?.name || user?.email || user?.user_id || "Employee"
        }
        userSubtitle={user?.roles?.[0] ?? "Employee"}
      >
      <Outlet />
    </EnterpriseShell>
  );
}
