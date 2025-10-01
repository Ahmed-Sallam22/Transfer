// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Clock,
  SlidersHorizontal,
  FilePlus2,
  ClipboardCheck,
  ClipboardList,
  Users,
  // FolderKanban,
  // KanbanSquare,
  BarChart3,
  // Settings,
  // HelpCircle,
  LogOut,
  X,
  Workflow,
  // Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Tanfeez from "../assets/Tanfeezletter.png";
import { useLogout } from "../hooks/useLogout";
import { useUserRole, useUserLevel } from "../features/auth/hooks";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
  onToggle?: () => void; // desktop arrow toggler
  desktopHidden?: boolean; // controls arrow direction
};

const getSections = (userRole: string | null, userLevel: number | null) =>
  [
    {
      title: "",
      items: [
        {
          to: "/app",
          label: "Dashboard",
          icon: LayoutDashboard,
          allowedRoles: ["superadmin"],
          allowedLevels: [1, 2, 3, 4] as number[],
        },
        {
          to: "/app/reports",
          label: "Reports",
          icon: BarChart3,
          allowedRoles: ["superadmin"],
          allowedLevels: [] as number[],
        },
        // {
        //   to: "/app/envelope",
        //   label: "Envelope",
        //   icon: Mail,
        //   allowedRoles: ["superadmin"],
        //   allowedLevels: [4] as number[],
        // },
      ].filter((item) => {
        const hasRoleAccess =
          item.allowedRoles.length === 0 ||
          (userRole && item.allowedRoles.includes(userRole));
        const hasLevelAccess =
          item.allowedLevels.length === 0 ||
          (userLevel !== null && item.allowedLevels.includes(userLevel));
        return hasRoleAccess || hasLevelAccess;
      }),
    },
    {
      title: "Transfer",
      items: [
        {
          to: "/app/transfer",
          label: "Transfer",
          icon: ArrowLeftRight,
          allowedRoles: ["superadmin"],
          allowedLevels: [1] as number[],
        },
        {
          to: "/app/PendingTransfer",
          label: "Pending Transfer",
          icon: Clock,
          allowedRoles: ["superadmin"],
          allowedLevels: [2, 3, 4] as number[],
        },
      ].filter((item) => {
        const hasRoleAccess =
          item.allowedRoles.length === 0 ||
          (userRole && item.allowedRoles.includes(userRole));
        const hasLevelAccess =
          item.allowedLevels.length === 0 ||
          (userLevel !== null && item.allowedLevels.includes(userLevel));
        return hasRoleAccess || hasLevelAccess;
      }),
    },
    {
      title: "Additional Funds",
      items: [
        {
          to: "/app/fund-requests",
          label: "Fund Requests",
          icon: FilePlus2,
          allowedRoles: ["superadmin"],
          allowedLevels: [1] as number[],
        },
        {
          to: "/app/PendingRequests",
          label: "Pending Requests",
          icon: ClipboardList,
          allowedRoles: ["superadmin"],
          allowedLevels: [2, 3, 4] as number[],
        },
      ].filter((item) => {
        const hasRoleAccess =
          item.allowedRoles.length === 0 ||
          (userRole && item.allowedRoles.includes(userRole));
        const hasLevelAccess =
          item.allowedLevels.length === 0 ||
          (userLevel !== null && item.allowedLevels.includes(userLevel));
        return hasRoleAccess || hasLevelAccess;
      }),
    },
    {
      title: "Fund Adjustments",
      items: [
        {
          to: "/app/FundAdjustments",
          label: "Fund Adjustments",
          icon: SlidersHorizontal,
          allowedRoles: ["superadmin"],
          allowedLevels: [1] as number[],
        },
        {
          to: "/app/PendingAdjustments",
          label: "Pending Adjustments",
          icon: ClipboardCheck,
          allowedRoles: ["superadmin"],
          allowedLevels: [2, 3, 4] as number[],
        },
      ].filter((item) => {
        const hasRoleAccess =
          item.allowedRoles.length === 0 ||
          (userRole && item.allowedRoles.includes(userRole));
        const hasLevelAccess =
          item.allowedLevels.length === 0 ||
          (userLevel !== null && item.allowedLevels.includes(userLevel));
        return hasRoleAccess || hasLevelAccess;
      }),
    },
    {
      title: "Management",
      items: [
        {
          to: "/app/users",
          label: "User Management",
          icon: Users,
          allowedRoles: ["superadmin"],
          allowedLevels: [] as number[],
        },
        // {
        //   to: "/app/accounts-projects",
        //   label: "Accounts & Projects",
        //   icon: FolderKanban,
        //   allowedRoles: ["superadmin"],
        //   allowedLevels: [] as number[],
        // },
        // {
        //   to: "/app/projects-overview",
        //   label: "Projects Overview",
        //   icon: KanbanSquare,
        //   allowedRoles: ["superadmin"],
        //   allowedLevels: [] as number[],
        // },
        {
          to: "/app/WorkFlow",
          label: "WorkFlow",
          icon: Workflow,
          allowedRoles: ["superadmin"],
          allowedLevels: [] as number[],
        },
      ].filter(() => userRole === "superadmin"),
    },
    {
      title: "Preferences",
      items: [
        // {
        //   to: "/app/settings",
        //   label: "Settings",
        //   icon: Settings,
        //   allowedRoles: [] as string[],
        //   allowedLevels: [] as number[],
        // },
        // {
        //   to: "/app/help",
        //   label: "Help Center",
        //   icon: HelpCircle,
        //   allowedRoles: [] as string[],
        //   allowedLevels: [] as number[],
        // },
        {
          to: "/logout",
          label: "Log out",
          icon: LogOut,
          allowedRoles: [] as string[],
          allowedLevels: [] as number[],
        },
      ],
    },
  ].filter((section) => section.items.length > 0);

export default function Sidebar({
  onClose,
  onToggle,
  desktopHidden,
}: SidebarProps) {
  const logout = useLogout();
  const userRole = useUserRole();
  const userLevel = useUserLevel();
  const sections = getSections(userRole || null, userLevel);

  return (
    <aside className="w-full h-full bg-white rounded-2xl overflow-y-auto overflow-x-hidden flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 lg:border-none flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1">
          <img
            src={Tanfeez}
            alt="Tanfeez"
            className="w-auto max-w-[120px] sm:max-w-none"
          />
        </div>

        {/* Close (mobile) */}
        <button
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>

        {/* Arrow (desktop) */}
        <button
          type="button"
          onClick={onToggle}
          className="hidden lg:flex absolute right-2 top-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Collapse/Expand sidebar"
          title="Collapse/Expand"
        >
          {desktopHidden ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 sm:px-4 flex-1 overflow-y-auto overflow-x-hidden">
        {sections.map((sec, i) => (
          <div key={i} className="sm:mb-1">
            {!desktopHidden && sec.title && (
              <div className="px-2 sm:px-3 pb-1 sm:pb-2 text-[11px] sm:text-[12px] font-meduim tracking-wider text-[#AFAFAF] uppercase">
                {sec.title}
              </div>
            )}
            <ul className="space-y-0.5 sm:space-y-1">
              {sec.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  {to === "/logout" ? (
                    <button
                      onClick={() => {
                        logout();
                        onClose?.();
                      }}
                      className={`flex items-center ${
                        desktopHidden ? "justify-center" : "gap-2 sm:gap-3"
                      } px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-colors text-[#545454] hover:bg-gray-50 hover:text-gray-900 w-full text-left`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      {/* hide label when collapsed */}
                      {!desktopHidden && (
                        <span className="truncate min-w-0">{label}</span>
                      )}
                    </button>
                  ) : (
                    <NavLink
                      to={to}
                      className={({ isActive }) => {
                        let finalIsActive = false;

                        if (to === "/app") {
                          finalIsActive = window.location.pathname === "/app";
                        } else if (to === "/app/transfer") {
                          finalIsActive =
                            window.location.pathname === "/app/transfer" ||
                            window.location.pathname.startsWith(
                              "/app/transfer/"
                            );
                        } else {
                          finalIsActive = isActive;
                        }

                        return `flex items-center ${
                          desktopHidden ? "justify-center" : "gap-2 sm:gap-3"
                        } px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-colors
                          ${
                            finalIsActive
                              ? "bg=[#19efe4] text-[#00B7AD] border-r-2 sm:border-r-4 border-[#00B7AD]"
                              : "text-[#545454] hover:bg-gray-50 hover:text-gray-900"
                          }`;
                      }}
                      onClick={onClose}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      {/* hide label when collapsed */}
                      {!desktopHidden && (
                        <span className="truncate min-w-0">{label}</span>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
