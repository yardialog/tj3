import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeenJob - Биржа труда для подростков",
  description: "Безопасная платформа для поиска работы подростками 14-17 лет. Проверенные работодатели, модерируемые вакансии, защита персональных данных.",
  keywords: ["работа для подростков", "подработка", "вакансии 14 лет", "вакансии 16 лет", "летний заработок", "TeenJob"],
  authors: [{ name: "TeenJob Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "TeenJob - Биржа труда для подростков",
    description: "Найди свою первую работу безопасно и легко",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
