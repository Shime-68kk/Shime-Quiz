import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Home from './routes/Home.jsx';
import { routes } from './routes/routeConfig.js';
import { initTheme } from './ui/theme.js';
import { ShimeLanguageProvider } from './uiI18n/ShimeLanguageProvider.jsx';
import { initializeUiLocale } from './uiI18n/localeStorage.js';
import './styles/global.css';
import './styles/phase34b-leader-ui-effects.css';

// Khởi tạo theme từ localStorage ngay lập tức để tránh nhấp nháy giao diện khi F5
initTheme();
initializeUiLocale();

const routerBase = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBase}>
      <ShimeLanguageProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Home />} />
            {routes.map(route => {
              const RouteElement = route.element;
              return <Route key={route.path} path={route.path.replace(/^\//, '')} element={<RouteElement />} />;
            })}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </ShimeLanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
