import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ko', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
    // next-intl v4: requestLocale is a Promise<string | undefined>
    const requested = await requestLocale;
    const locale = locales.includes(requested ?? '') ? requested! : 'ko';

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
