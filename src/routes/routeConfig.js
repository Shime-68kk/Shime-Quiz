import Dashboard from './Dashboard.jsx';
import Library from './Library.jsx';
import StudyRoom from './StudyRoom.jsx';

// Phase 1B migration boundary:
// Keep route/page definitions UI-only for now. Future learning behavior should be
// wired through dedicated services instead of embedding quiz algorithms in pages.
export const routes = [
  {
    path: '/dashboard',
    label: 'Tổng quan',
    shortLabel: 'Tổng quan',
    icon: '⌂',
    showInNav: true,
    focusMode: false,
    element: Dashboard
  },
  {
    path: '/library',
    label: 'Thư viện',
    shortLabel: 'Thư viện',
    icon: '▦',
    showInNav: true,
    focusMode: false,
    element: Library
  },
  {
    path: '/study-room',
    label: 'Phòng học',
    shortLabel: 'Học',
    icon: '◉',
    showInNav: true,
    focusMode: true,
    element: StudyRoom
  }
];

export const navRoutes = routes.filter(route => route.showInNav);

export function getRouteByPath(pathname) {
  return routes.find(route => route.path === pathname);
}
