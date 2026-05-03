import { Outlet, useLocation } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import { getRouteByPath } from './routes/routeConfig.js';

export default function App() {
  const location = useLocation();
  const route = getRouteByPath(location.pathname);

  return (
    <AppLayout focusMode={Boolean(route?.focusMode)}>
      <Outlet />
    </AppLayout>
  );
}
