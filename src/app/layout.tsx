import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SettingsProvider } from "@/context/settings-context";
import { ResultsProvider } from "@/context/results-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen antialiased selection:bg-blue-500/30`}>
        <AuthProvider>
          <SettingsProvider>
            <ResultsProvider>
              {/* Authenticated Layout Wrapper */}
              <div className="flex h-screen overflow-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Header />
                  <main className="flex-1 overflow-y-auto ml-64 bg-zinc-950 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 pointer-events-none" />
                    <div className="relative z-10">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </ResultsProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
