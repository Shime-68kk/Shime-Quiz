import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import { routes } from './routes/routeConfig.js';
import { initTheme } from './ui/theme.js';
import { ShimeLanguageProvider } from './uiI18n/ShimeLanguageProvider.jsx';
import { initializeUiLocale } from './uiI18n/localeStorage.js';
import { CRAM_ROUTE_PATH, STUDENT_DEPLOYMENT } from './config/studentDeployment.js';
import InternalRouteHistoryProvider from './navigation/InternalRouteHistoryProvider.jsx';
import './styles/global.css';
import './styles/phase34b-leader-ui-effects.css';
import './styles/route-loading.css';
import './styles/cram.css';

const Home = React.lazy(() => import('./routes/Home.jsx'));

// Khởi tạo theme từ localStorage ngay lập tức để tránh nhấp nháy giao diện khi F5
initTheme();
initializeUiLocale();

const routerBase = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
// Hash routing for hosts that serve the app from a sub-path without SPA rewrites (e.g. a shared preview link).
const useHashRouter = String(import.meta.env.VITE_SHIME_HASH_ROUTER || '').toLowerCase() === 'on';
const Router = useHashRouter ? HashRouter : BrowserRouter;
const routerProps = useHashRouter ? {} : { basename: routerBase };

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router {...routerProps}>
      <ShimeLanguageProvider>
          <InternalRouteHistoryProvider>
            <Routes>
              <Route element={<App />}>
                <Route index element={STUDENT_DEPLOYMENT ? <Navigate to={CRAM_ROUTE_PATH} replace /> : <Home />} />
                {routes.map(route => {
                  const RouteElement = route.element;
                  // Student deployment: legacy screens send the learner to the simple equivalent.
                  const element = STUDENT_DEPLOYMENT && route.studentRedirect
                    ? <Navigate to={route.studentRedirect} replace />
                    : <RouteElement />;
                  return <Route key={route.path} path={route.path.replace(/^\//, '')} element={element} />;
                })}
                <Route path="*" element={<Navigate to={STUDENT_DEPLOYMENT ? CRAM_ROUTE_PATH : '/dashboard'} replace />} />
              </Route>
            </Routes>
          </InternalRouteHistoryProvider>
      </ShimeLanguageProvider>
    </Router>
  </React.StrictMode>
);
