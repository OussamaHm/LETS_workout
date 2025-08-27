
import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { LayoutClient } from "@/components/layout/LayoutClient";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ProgressPad",
  description: "A no-login weekly coaching platform for coaches and players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ptSans.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning={true}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
