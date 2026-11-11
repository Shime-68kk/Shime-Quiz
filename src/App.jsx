import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import { getRouteByPath } from './routes/routeConfig.js';
import { useShimeLanguage } from './uiI18n/useShimeLanguage.js';

function RouteLoadingFallback() {
  const { t } = useShimeLanguage();

  return (
    <div className="routeLoading" role="status" aria-live="polite">
      <span className="routeLoading__spinner" aria-hidden="true" />
      <p>{t('shell.loadingPage')}</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const route = getRouteByPath(location.pathname);

  return (
    <AppLayout focusMode={Boolean(route?.focusMode)}>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}
