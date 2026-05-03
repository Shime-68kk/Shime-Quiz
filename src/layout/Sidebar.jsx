import { NavLink } from 'react-router-dom';
import { APP_VERSION_LABEL } from '../version.js';
import { navRoutes } from '../routes/routeConfig.js';

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Điều hướng chính">
      <div className="brandBlock">
        <span className="brandMark" aria-hidden="true">S</span>
        <div>
          <p className="brandName">ShimeChamhoc</p>
          <p className="brandSub">Học thích ứng · {APP_VERSION_LABEL}</p>
        </div>
      </div>

      <nav className="sideNav" aria-label="Khu vực trong ứng dụng">
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
