import { NavLink, useLocation } from 'react-router-dom';
import { APP_VERSION_LABEL } from '../version.js';
import { navRoutes } from '../routes/routeConfig.js';

export default function Sidebar() {
  const location = useLocation();
  const activeIndex = navRoutes.findIndex(item => item.path === location.pathname);
  const hasActiveItem = activeIndex >= 0;

  return (
    <aside className="sidebar" aria-label="Điều hướng chính">
      <div
        className="brandBlock phase37uin-collapsible-avatar-header-pilot"
        data-phase37uin-collapsible-avatar-header="sidebar-brand-identity"
      >
        <span className="brandMark" aria-hidden="true">S</span>
        <div>
          <p className="brandName">ShimeChamhoc</p>
          <p className="brandSub">Học thích ứng · {APP_VERSION_LABEL}</p>
        </div>
      </div>

      <nav
        className="sideNav primaryNavIndicatorHost phase37uih-hybrid-sliding-navigation-indicator-pilot phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop"
        aria-label="Khu vực trong ứng dụng"
        data-nav-active={hasActiveItem ? 'true' : 'false'}
        style={{
          '--nav-active-index': hasActiveItem ? activeIndex : 0,
          '--nav-active-offset': `${hasActiveItem ? activeIndex * 58 : 0}px`,
          '--phase37uih-active-index': hasActiveItem ? activeIndex : 0,
          '--nav-item-count': navRoutes.length
        }}
      >
        <span className="primaryNavSlidingIndicator" aria-hidden="true" />
        {navRoutes.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'navItem navItem--active' : 'navItem')}
          >
            {({ isActive }) => (
              <>
                <span className="navItem__icon" aria-hidden="true">{item.icon}</span>
                <span className="navItem__label">{item.label}</span>
                {isActive ? <span className="navItem__status">Đang mở</span> : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
