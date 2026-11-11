export const SHIME_LAUNCH_DURATION_MS = 5150;
export const SHIME_LAUNCH_REDUCED_DURATION_MS = 650;

export function isShimeHomePath(pathname = '/') {
  return pathname === '/' || pathname === '';
}

export function createShimeLaunchDocumentState(initialPathname = '/') {
  let complete = false;
  const eligible = isShimeHomePath(initialPathname);
  return Object.freeze({
    shouldShow: pathname => eligible && !complete && isShimeHomePath(pathname),
    complete: () => { complete = true; },
    isComplete: () => complete,
    initialPathname,
    eligible
  });
}

const initialDocumentPath = typeof window === 'undefined' ? '/' : window.location.pathname;
const documentLaunchState = createShimeLaunchDocumentState(initialDocumentPath);

export function shouldShowShimeLaunch(pathname) {
  return documentLaunchState.shouldShow(pathname);
}

export function completeShimeLaunch() {
  documentLaunchState.complete();
}

export function prefersReducedShimeLaunch() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
