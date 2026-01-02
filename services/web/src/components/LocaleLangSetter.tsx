'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/locale';

type Props = {
  locale: Locale;
};

export default function LocaleLangSetter({ locale }: Props) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
