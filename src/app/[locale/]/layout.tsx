import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";

export const metadata: Metadata = {
    title: "Excel AI Visualization - PronunFit",
    description: "AI-powered Excel analysis and visualization report generator",
};

export default async function RootLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <html lang={locale || 'ko'}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <ThemeRegistry>
                        {children}
                    </ThemeRegistry>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
