import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import { useLocation } from 'react-router-dom';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';

export default function AppLayout({ children, focusMode = false }) {
  const location = useLocation();
  const { t } = useShimeLanguage();
  const routeStage = (
    <div className="routeStage" key={location.pathname} data-route-path={location.pathname}>
      {children}
    </div>
  );

  if (focusMode) {
    return (
      <div className="appRoot appRoot--focus">
        <a className="skipLink" href="#main-content">{t('shell.skipToContent')}</a>
        <main className="studyShell" id="main-content" tabIndex="-1">
          <div className="studyShell__content">{routeStage}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="appRoot">
      <a className="skipLink" href="#main-content">{t('shell.skipToContent')}</a>
      <div className="navigationShell">
        <Sidebar />
        <main className="mainContent" id="main-content" tabIndex="-1">
          {routeStage}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
