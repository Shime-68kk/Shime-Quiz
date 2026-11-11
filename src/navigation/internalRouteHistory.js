const RETURNABLE_ROUTE_ROOTS = Object.freeze([
  '/dashboard',
  '/library',
  '/study-room',
  '/settings'
]);

export function normalizeInternalPath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return null;
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  return normalized.includes('://') ? null : normalized;
}

export function isReturnableInternalPath(pathname) {
  const normalized = normalizeInternalPath(pathname);
  if (!normalized || normalized === '/') return false;
  return RETURNABLE_ROUTE_ROOTS.some(root => normalized === root || normalized.startsWith(`${root}/`));
}

export function createInternalRouteHistory(pathname) {
  return {
    currentPath: normalizeInternalPath(pathname),
    previousInternalPath: null
  };
}

export function recordInternalRoute(history, pathname, navigationType = 'PUSH') {
  const nextPath = normalizeInternalPath(pathname);
  if (!nextPath || nextPath === history.currentPath) return history;

  return {
    currentPath: nextPath,
    previousInternalPath: nextPath === '/' && navigationType === 'PUSH' && isReturnableInternalPath(history.currentPath)
      ? history.currentPath
      : null
  };
}
