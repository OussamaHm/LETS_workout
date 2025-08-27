
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import Sidebar, { MobileHeader } from "@/components/layout/Sidebar";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <AppProvider>
      <div className="relative md:flex">
        <Sidebar />
        <div className="flex flex-col w-full">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <footer className="p-4 text-center text-sm text-muted-foreground">
            © {year} Copyright by {" "}
            <Link href="https://www.instagram.com/reda.adjar/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              Reda Adjar
            </Link>
          </footer>
        </div>
      </div>
      <Toaster />
    </AppProvider>
  );
}
