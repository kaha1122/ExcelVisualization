import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ko', 'en'];

export default getRequestConfig(async (params) => {
    // In next-intl v4, locale comes from params
    const locale = typeof params.requestLocale === 'string'
        ? params.requestLocale
        : (await params.requestLocale) ?? 'ko';

    if (!locales.includes(locale)) notFound();

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
