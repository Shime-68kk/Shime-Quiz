import { NavLink, useLocation } from 'react-router-dom';
import { navRoutes } from '../routes/routeConfig.js';
import ShimeNavigationIcon from '../components/brand/ShimeNavigationIcon.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useShimeLanguage();
  const activeIndex = navRoutes.findIndex(item => item.path === location.pathname);
  const hasActiveItem = activeIndex >= 0;

  return (
    <nav
      className="bottomNav primaryNavIndicatorHost phase36b-bottom-nav-touch-pilot phase37uih-hybrid-sliding-navigation-indicator-pilot phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile"
      aria-label={t('shell.mobileNavigation')}
      data-nav-active={hasActiveItem ? 'true' : 'false'}
      style={{
        '--nav-active-index': hasActiveItem ? activeIndex : 0,
        '--phase37uih-active-index': hasActiveItem ? activeIndex : 0,
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
