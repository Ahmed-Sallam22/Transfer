// src/layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '@/shared/Sidebar';
import DashboardHeader from '@/shared/DashboardHeader';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen">
      {/* Mobile & Tablet Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Layout - Grid */}
      <div className="hidden lg:grid lg:grid-cols-12 h-full">
        {/* Desktop Sidebar */}
        <div className='sticky top-0 col-span-2 h-[97.5vh] m-3 overflow-y-auto'>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Desktop Main Content */}
        <main className="col-span-10 h-full overflow-y-auto">
          <div className="p-6">
            <DashboardHeader />
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile & Tablet Layout - Flexbox */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile/Tablet Sidebar - Overlay */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile/Tablet Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <DashboardHeader />
            <div className="mt-6 sm:mt-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
