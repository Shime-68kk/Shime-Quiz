import Button from '../Button.jsx';
import { useInternalBackNavigation } from '../../navigation/useInternalBackNavigation.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export default function ContextualBackControl() {
  const { canReturnFromHome, goBack } = useInternalBackNavigation();
  const { t } = useShimeLanguage();

  if (!canReturnFromHome) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="homeContextualBack"
      onClick={goBack}
      aria-label={t('home.back')}
    >
      <span aria-hidden="true">←</span> {t('home.back')}
    </Button>
  );
}
