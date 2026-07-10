import Dashboard from './Dashboard.jsx';
import FsrsUiFixture from './FsrsUiFixture.jsx';
import Library from './Library.jsx';
import Settings from './Settings.jsx';
import StudyRoom from './StudyRoom.jsx';
// Phase 26D — hidden default-off dev/test harness (showInNav: false, returns null with no props)
import BackupHealthDevHarness from '../components/dev/BackupHealthDevHarness.jsx';

// Phase 1B migration boundary:
// Keep route/page definitions UI-only for now. Future learning behavior should be
// wired through dedicated services instead of embedding quiz algorithms in pages.
export const routes = [
  {
    path: '/dashboard',
    label: 'Tổng quan',
    shortLabel: 'Tổng quan',
    labelKey: 'nav.overview',
    shortLabelKey: 'nav.overview',
    icon: '⌂',
    showInNav: true,
    focusMode: false,
    element: Dashboard
  },
  {
    path: '/library',
    label: 'Thư viện',
    shortLabel: 'Thư viện',
    labelKey: 'nav.library',
    shortLabelKey: 'nav.library',
    icon: '▦',
    showInNav: true,
    focusMode: false,
    element: Library
  },
  {
    path: '/study-room',
    label: 'Phòng học',
    shortLabel: 'Học',
    labelKey: 'nav.studyRoom',
    shortLabelKey: 'nav.studyShort',
    icon: '◉',
    showInNav: true,
    focusMode: true,
    element: StudyRoom
  },
  {
    path: '/settings',
    label: 'Cài đặt',
    shortLabel: 'Cài đặt',
    labelKey: 'nav.settings',
    shortLabelKey: 'nav.settings',
    icon: '⚙',
    showInNav: true,
    focusMode: false,
    element: Settings
  },
  {
    path: '/dev/fsrs-ui-fixture',
    label: 'FSRS UI Fixture',
    shortLabel: 'FSRS Fixture',
    icon: '⚗',
    showInNav: false,
    focusMode: false,
    element: FsrsUiFixture
  },
  {
    // Phase 26D — hidden default-off dev/test harness; never shown in nav
    // Renders null with no props (default-off). Enable via explicit props: { enabled: true, mode: 'test' }
    path: '/dev/backup-health-harness',
    label: 'Backup Health Dev Harness',
    shortLabel: 'BH Harness',
    icon: '⚕',
    showInNav: false,
    focusMode: false,
    element: BackupHealthDevHarness
  }
];

export const navRoutes = routes.filter(route => route.showInNav);

export function getRouteByPath(pathname) {
  return routes.find(route => route.path === pathname);
}
