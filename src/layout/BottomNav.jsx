import { NavLink, useLocation } from 'react-router-dom';
import { navRoutes } from '../routes/routeConfig.js';

export default function BottomNav() {
  const location = useLocation();
  const activeIndex = navRoutes.findIndex(item => item.path === location.pathname);
  const hasActiveItem = activeIndex >= 0;

  return (
    <nav
      className="bottomNav primaryNavIndicatorHost phase36b-bottom-nav-touch-pilot"
      aria-label="Điều hướng di động"
      data-nav-active={hasActiveItem ? 'true' : 'false'}
      style={{
        '--nav-active-index': hasActiveItem ? activeIndex : 0,
        '--nav-item-count': navRoutes.length
      }}
    >
      <span className="primaryNavSlidingIndicator" aria-hidden="true" />
      {navRoutes.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => (isActive ? 'bottomNav__item bottomNav__item--active' : 'bottomNav__item')}
        >
          {({ isActive }) => (
            <>
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.shortLabel || item.label}</span>
              {isActive ? <span className="srOnly">Đang mở</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
