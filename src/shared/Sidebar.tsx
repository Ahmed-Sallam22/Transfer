// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Clock,
  SlidersHorizontal,
  FilePlus2,
  ClipboardCheck,
  ClipboardList,
  Users,
  FolderKanban,
  KanbanSquare,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Workflow,
} from 'lucide-react';
import Tanfeez from '../assets/Tanfeezletter.png';
import { useLogout } from '../hooks/useLogout';
type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const sections = [
  {
    title: '',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/app/reports', label: 'Reports', icon: BarChart3 },

    ],
  },
  {
    title: 'Transfer',
    items: [
      { to: '/app/transfer', label: 'Transfer', icon: ArrowLeftRight },
      { to: '/app/PendingTransfer', label: 'Pending Transfer', icon: Clock },
    ],
  },
  {
    title: 'Fund',
    items: [
      { to: '/app/FundAdjustments', label: 'Fund Adjustments', icon: SlidersHorizontal },
      { to: '/app/fund-requests', label: 'Fund Requests', icon: FilePlus2 },
      { to: '/app/PendingAdjustments', label: 'Pending Adjustments', icon: ClipboardCheck },
      { to: '/app/PendingRequests', label: 'Pending Requests', icon: ClipboardList },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/app/users', label: 'User Management', icon: Users },
      { to: '/app/accounts-projects', label: 'Accounts & Projects', icon: FolderKanban },
      { to: '/app/projects-overview', label: 'Projects Overview', icon: KanbanSquare },
            { to: '/app/WorkFlow', label: 'WorkFlow', icon: Workflow },

    ],
  },
  {
    title: 'Preferences',
    items: [
      { to: '/app/settings', label: 'Settings', icon: Settings },
      { to: '/app/help', label: 'Help Center', icon: HelpCircle },
      { to: '/logout', label: 'Log out', icon: LogOut },
    ],
  },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const logout = useLogout();

  return (
    <aside className="w-full   h-full bg-white rounded-2xl overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 lg:border-none flex-shrink-0">
        <div className="flex items-center min-w-0 flex-1">
          <img src={Tanfeez} alt="Tanfeez" className=' w-auto max-w-[120px] sm:max-w-none' />
        </div>
        <button 
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0 ml-2" 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 sm:px-4 flex-1 overflow-y-auto">
        {sections.map((sec, i) => (
          <div key={i} className=" sm:mb-1">
            {sec.title && (
              <div className="px-2 sm:px-3 pb-1 sm:pb-2 text-[11px] sm:text-[12px] font-meduim tracking-wider text-[#AFAFAF] uppercase">
                {sec.title}
              </div>
            )}
            <ul className="space-y-0.5 sm:space-y-1">
              {sec.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  {to === '/logout' ? (
                    <button
                      onClick={() => {
                        logout();
                        onClose?.();
                      }}
                      className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-colors text-[#545454] hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                    >
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`} />
                      <span className="truncate min-w-0">{label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={to}
                      className={({ isActive }) => {
                        let finalIsActive = false;
                        
                        if (to === '/app') {
                          finalIsActive = window.location.pathname === '/app';
                        } else if (to === '/app/transfer') {
                          finalIsActive = window.location.pathname === '/app/transfer' || window.location.pathname.startsWith('/app/transfer/');
                        } else {
                          finalIsActive = isActive;
                        }
                        
                        return `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-colors
                          ${finalIsActive 
                            ? 'bg-blue-50 text-[#0052FF] border-r-2 sm:border-r-4 border-[#0052FF]' 
                            : 'text-[#545454] hover:bg-gray-50 hover:text-gray-900'
                          }`;
                      }}
                      onClick={onClose}
                    >
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0`} />
                      <span className="truncate min-w-0">{label}</span>
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
