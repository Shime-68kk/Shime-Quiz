import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { navRoutes } from '../routes/routeConfig.js';
import { preloadRoute } from '../routes/routeConfig.js';
import ShimeNavigationIcon from '../components/brand/ShimeNavigationIcon.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';
import LiquidGlassNavPill from '../components/navigation/LiquidGlassNavPill.jsx';

export default function BottomNav() {
  const { t } = useShimeLanguage();
  const navRef = useRef(null);

  return (
    <nav
      ref={navRef}
      className="bottomNav bottomNav--liquid primaryNavIndicatorHost phase36b-bottom-nav-touch-pilot phase37uih-hybrid-sliding-navigation-indicator-pilot phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile"
      aria-label={t('shell.mobileNavigation')}
      style={navRoutes.length !== 4 ? { '--nav-item-count': navRoutes.length } : undefined}
    >
      <LiquidGlassNavPill hostRef={navRef} activeSelector=".bottomNav__item--active" />
      {navRoutes.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          onPointerEnter={() => preloadRoute(item.path)}
          onFocus={() => preloadRoute(item.path)}
          className={({ isActive }) => (isActive ? 'bottomNav__item bottomNav__item--active' : 'bottomNav__item')}
        >
          {({ isActive }) => (
            <>
              <span className="bottomNav__icon" aria-hidden="true"><ShimeNavigationIcon route={item.path} /></span>
              <span>{t(item.shortLabelKey || item.labelKey)}</span>
              {isActive ? <span className="srOnly">{t('common.open')}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
