import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SettingsProvider } from "@/context/settings-context";
import { ResultsProvider } from "@/context/results-context";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoading } from "@/components/shared/page-loading";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "TTB Label Verification",
  description: "AI-Powered Alcohol Label Compliance Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} font-sans bg-background text-foreground min-h-screen antialiased selection:bg-primary/30`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <ResultsProvider>
                <AppShell>
                  <Suspense fallback={<PageLoading />}>{children}</Suspense>
                </AppShell>
              </ResultsProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
