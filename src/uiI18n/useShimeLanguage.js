import { useContext } from 'react';
import { ShimeLanguageContext } from './ShimeLanguageProvider.jsx';

export function useShimeLanguage() {
  return useContext(ShimeLanguageContext);
}
