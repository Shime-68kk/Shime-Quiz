import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternalRouteHistoryContext } from './InternalRouteHistoryProvider.jsx';

export function useInternalBackNavigation() {
  const navigate = useNavigate();
  const history = useContext(InternalRouteHistoryContext);

  const goBack = useCallback(() => {
    if (history.canReturnFromHome) navigate(-1);
  }, [history.canReturnFromHome, navigate]);

  return {
    ...history,
    goBack
  };
}
