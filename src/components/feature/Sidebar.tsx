import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRef, useCallback } from 'react';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: 'ri-dashboard-3-line', path: '/' },
  { label: 'Inventory', icon: 'ri-archive-stack-line', path: '/inventory' },
  { label: 'Orders', icon: 'ri-shopping-bag-3-line', path: '/orders' },
  { label: 'Deliveries', icon: 'ri-truck-line', path: '/deliveries' },
  { label: 'Transfers', icon: 'ri-swap-box-line', path: '/transfers' },
  { label: 'Returns', icon: 'ri-arrow-go-back-line', path: '/returns' },
  { label: 'Purchases', icon: 'ri-shopping-cart-2-line', path: '/purchases' },
  { label: 'Promotions', icon: 'ri-price-tag-3-line', path: '/promotions' },
  { label: 'Vendors', icon: 'ri-store-2-line', path: '/vendors' },
  { label: 'Warehouses', icon: 'ri-building-2-line', path: '/warehouses' },
];

const managementNavItems: NavItem[] = [
  { label: 'Reports', icon: 'ri-bar-chart-2-line', path: '/reports' },
  { label: 'Teams', icon: 'ri-team-line', path: '/teams' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || !onClose) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    if (diff > 80) {
      onClose();
      touchStartX.current = null;
    }
  }, [onClose]);

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = null;
  }, []);

  return (
    <aside
      ref={sidebarRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`w-60 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <i className="ri-box-3-fill text-white text-sm"></i>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight">StockManagement</span>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors lg:hidden cursor-pointer"
        >
          <i className="ri-close-line text-lg"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6">Management</p>
        {managementNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${item.icon} text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
        {profile?.role === 'admin' && (
          <NavLink
            to="/requirements"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`ri-list-check-2 text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
                </div>
                Requirements
              </>
            )}
          </NavLink>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3 mt-6">Notifications</p>
        <NavLink
          to="/notifications/history"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-history-line text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
              </div>
              History
            </>
          )}
        </NavLink>
        <NavLink
          to="/notifications/analytics"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-bar-chart-box-line text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
              </div>
              Analytics
            </>
          )}
        </NavLink>
        <NavLink
          to="/notifications/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`ri-notification-3-line text-base ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}></i>
              </div>
              Settings
            </>
          )}
        </NavLink>
      </nav>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <i className="ri-user-line text-emerald-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{profile?.role || 'admin'}@stockmanagement.io</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <i className="ri-logout-box-r-line text-sm"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}