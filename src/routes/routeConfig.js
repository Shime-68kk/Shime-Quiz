import { lazy } from 'react';
import { STUDENT_DEPLOYMENT } from '../config/studentDeployment.js';

// Keep route modules outside the startup bundle. Reusing each loader for lazy()
// and preload() avoids duplicate requests while letting navigation warm the next
// screen on pointer/focus intent.
const loadDashboard = () => import('./Dashboard.jsx');
const loadLibrary = () => import('./Library.jsx');
const loadStudyRoom = () => import('./StudyRoom.jsx');
const loadSettings = () => import('./Settings.jsx');
const loadCramStudy = () => import('./CramStudy.jsx');
const loadMockTest = () => import('./MockTest.jsx');
const loadStudentLibrary = () => import('./StudentLibrary.jsx');
const loadStudentSettings = () => import('./StudentSettings.jsx');
const loadFsrsUiFixture = () => import('./FsrsUiFixture.jsx');
const loadBackupHealthDevHarness = () => import('../components/dev/BackupHealthDevHarness.jsx');

const Dashboard = lazy(loadDashboard);
const Library = lazy(loadLibrary);
const StudyRoom = lazy(loadStudyRoom);
const Settings = lazy(loadSettings);
const CramStudy = lazy(loadCramStudy);
const MockTest = lazy(loadMockTest);
const StudentLibrary = lazy(loadStudentLibrary);
const StudentSettings = lazy(loadStudentSettings);
const FsrsUiFixture = lazy(loadFsrsUiFixture);
// Phase 26D — hidden default-off dev/test harness (showInNav: false, returns null with no props)
const BackupHealthDevHarness = lazy(loadBackupHealthDevHarness);

// Phase 1B migration boundary:
// Keep route/page definitions UI-only for now. Future learning behavior should be
// wired through dedicated services instead of embedding quiz algorithms in pages.
export const routes = [
  {
    // Ôn thi cấp tốc cho Lệ Thủy — the landing screen of the student deployment.
    path: '/on-thi',
    label: 'Ôn thi cấp tốc',
    shortLabel: 'Ôn thi',
    labelKey: 'nav.cram',
    shortLabelKey: 'nav.cramShort',
    icon: '★',
    // Shown first in the app navigation for the student deployment; the rest of the app stays available.
    showInNav: STUDENT_DEPLOYMENT,
    focusMode: false,
    element: CramStudy,
    preload: loadCramStudy
  },
  // Student deployment tabs: Ôn thi · Thư viện · Thi thử · Cài đặt (simple, learner-only screens).
  {
    path: '/thu-vien',
    label: 'Thư viện',
    shortLabel: 'Thư viện',
    labelKey: 'nav.library',
    shortLabelKey: 'nav.library',
    icon: '▦',
    showInNav: STUDENT_DEPLOYMENT,
    focusMode: false,
    element: StudentLibrary,
    preload: loadStudentLibrary
  },
  {
    path: '/thi-thu',
    label: 'Thi thử',
    shortLabel: 'Thi thử',
    labelKey: 'nav.mockTest',
    shortLabelKey: 'nav.mockTest',
    icon: '✓',
    showInNav: STUDENT_DEPLOYMENT,
    focusMode: false,
    element: MockTest,
    preload: loadMockTest
  },
  {
    path: '/cai-dat',
    label: 'Cài đặt',
    shortLabel: 'Cài đặt',
    labelKey: 'nav.settings',
    shortLabelKey: 'nav.settings',
    icon: '⚙',
    showInNav: STUDENT_DEPLOYMENT,
    focusMode: false,
    element: StudentSettings,
    preload: loadStudentSettings
  },
  {
    path: '/dashboard',
    label: 'Tổng quan',
    shortLabel: 'Tổng quan',
    labelKey: 'nav.overview',
    shortLabelKey: 'nav.overview',
    icon: '⌂',
    showInNav: !STUDENT_DEPLOYMENT,
    studentRedirect: '/on-thi',
    focusMode: false,
    element: Dashboard,
    preload: loadDashboard
  },
  {
    path: '/library',
    label: 'Thư viện',
    shortLabel: 'Thư viện',
    labelKey: 'nav.library',
    shortLabelKey: 'nav.library',
    icon: '▦',
    showInNav: !STUDENT_DEPLOYMENT,
    studentRedirect: '/thu-vien',
    focusMode: false,
    element: Library,
    preload: loadLibrary
  },
  {
    path: '/study-room',
    label: 'Phòng học',
    shortLabel: 'Học',
    labelKey: 'nav.studyRoom',
    shortLabelKey: 'nav.studyShort',
    icon: '◉',
    showInNav: !STUDENT_DEPLOYMENT,
    studentRedirect: '/on-thi',
    focusMode: true,
    element: StudyRoom,
    preload: loadStudyRoom
  },
  {
    path: '/settings',
    label: 'Cài đặt',
    shortLabel: 'Cài đặt',
    labelKey: 'nav.settings',
    shortLabelKey: 'nav.settings',
    icon: '⚙',
    showInNav: !STUDENT_DEPLOYMENT,
    studentRedirect: '/cai-dat',
    focusMode: false,
    element: Settings,
    preload: loadSettings
  },
  {
    path: '/dev/fsrs-ui-fixture',
    label: 'FSRS UI Fixture',
    shortLabel: 'FSRS Fixture',
    icon: '⚗',
    showInNav: false,
    focusMode: false,
    element: FsrsUiFixture,
    preload: loadFsrsUiFixture
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
    element: BackupHealthDevHarness,
    preload: loadBackupHealthDevHarness
  }
];

export const navRoutes = routes.filter(route => route.showInNav);

export function getRouteByPath(pathname) {
  return routes.find(route => route.path === pathname);
}

export function preloadRoute(pathname) {
  return getRouteByPath(pathname)?.preload?.();
}
