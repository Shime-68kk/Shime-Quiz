import { NavLink } from 'react-router-dom';
import { navRoutes } from '../routes/routeConfig.js';

export default function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="Điều hướng di động">
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
