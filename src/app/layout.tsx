import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/context";
import { ThemeProvider } from "@/theme/context";
import { Layout } from "@/components/layout";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Atlantis - 知识库",
  description: "运维与开发知识体系构建平台",
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <Layout>{children}</Layout>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
