import { cn } from "@humblebrag/ui/lib/utils";
// import { Provider as Analytics } from "@midday/events/client";
// import { Toaster } from "@midday/ui/toaster";
import type { Metadata } from "next";
import { Hedvig_Letters_Serif, Inter } from "next/font/google";
// import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactElement } from "react";
import { Providers } from "./providers";
// suppress missing module/type declarations for this side-effect CSS import
// @ts-ignore
import "@humblebrag/ui/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.humblebrag.so"),
  title: "Humblebrag | Your AI-Powered Career Assistant",
  description:
    "Automate career tasks, stay organized, and make informed decisions effortlessly with Humblebrag, your AI-powered career assistant.",
  twitter: {
    title: "Humblebrag | Your AI-Powered Career Assistant",
    description:
      "Automate career tasks, stay organized, and make informed decisions effortlessly with Humblebrag, your AI-powered career assistant.",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 1800,
        height: 1600,
      },
    ],
  },
  openGraph: {
    title: "Humblebrag | Your AI-Powered Career Assistant",
    description:
      "Automate career tasks, stay organized, and make informed decisions effortlessly with Humblebrag, your AI-powered career assistant.",
    url: "https://app.humblebrag.so",
    siteName: "Humblebrag",
    images: [
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://cdn.midday.ai/opengraph-image-v1.jpg",
        width: 1800,
        height: 1600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hedvig-serif",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          `${inter.variable} ${hedvigSerif.variable} font-sans`,
          "whitespace-pre-line overscroll-none antialiased",
          "mx-auto max-w-4xl",
        )}
      >
        {/* <NuqsAdapter> */}
        <Providers locale={locale}>
          {children}
          {/* <Toaster /> */}
        </Providers>
        {/* <Analytics /> */}
        {/* </NuqsAdapter> */}
      </body>
    </html>
  );
}
