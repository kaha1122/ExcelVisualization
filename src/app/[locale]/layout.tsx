import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import "../globals.css";

export const metadata: Metadata = {
  title: "Excel AI Visualization",
  description: "AI-powered multi-agent Excel analysis and visualization",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages();
  return (
    <html lang={locale ?? 'ko'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeRegistry>{props.children}</ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
