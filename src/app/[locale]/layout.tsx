import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import theme from '../../theme/theme';
import "../globals.css";

export const metadata: Metadata = {
  title: "Excel AI Visualization - PronunFit",
  description: "AI-powered Excel analysis and visualization report generator",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale ?? 'ko';
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {props.children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
