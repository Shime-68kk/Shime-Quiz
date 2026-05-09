import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import Home from './routes/Home.jsx';
import { routes } from './routes/routeConfig.js';
import './styles/global.css';

const routerBase = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBase}>
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
    </BrowserRouter>
  </React.StrictMode>
);
