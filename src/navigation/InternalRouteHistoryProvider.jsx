import { createContext, useMemo, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import {
  createInternalRouteHistory,
  isReturnableInternalPath,
  recordInternalRoute
} from './internalRouteHistory.js';

export const InternalRouteHistoryContext = createContext({
  previousInternalPath: null,
  canReturnFromHome: false
});

export default function InternalRouteHistoryProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const historyRef = useRef(createInternalRouteHistory(location.pathname));
  historyRef.current = recordInternalRoute(historyRef.current, location.pathname, navigationType);

  const previousInternalPath = historyRef.current.currentPath === '/' &&
    isReturnableInternalPath(historyRef.current.previousInternalPath)
    ? historyRef.current.previousInternalPath
    : null;

  const value = useMemo(() => ({
    previousInternalPath,
    canReturnFromHome: Boolean(previousInternalPath)
  }), [previousInternalPath]);

  return (
    <InternalRouteHistoryContext.Provider value={value}>
      {children}
    </InternalRouteHistoryContext.Provider>
  );
}
