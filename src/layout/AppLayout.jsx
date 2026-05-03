import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppLayout({ children, focusMode = false }) {
  if (focusMode) {
    return (
      <div className="appRoot appRoot--focus">
        <main className="studyShell" id="main-content" tabIndex="-1">
          <div className="studyShell__content">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="appRoot">
      <div className="navigationShell">
        <Sidebar />
        <main className="mainContent" id="main-content" tabIndex="-1">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
