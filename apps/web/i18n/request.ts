import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'fr';
  const supportedLocales = ['fr', 'wo'];
  const finalLocale = supportedLocales.includes(locale) ? locale : 'fr';

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
  };
});
