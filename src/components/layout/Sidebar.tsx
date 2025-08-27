
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Menu,
} from "lucide-react";

import RoleSwitcher from "@/components/RoleSwitcher";
import { cn } from "@/lib/utils";
import PlayerName from "../PlayerName";
import DataManager from "../DataManager";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
    { href: "/", label: "Today", icon: ClipboardList },
    { href: "/weekly", label: "Weekly", icon: CalendarDays },
];

const NavContent = () => {
    const pathname = usePathname();
    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                key={href}
                href={href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    (pathname === href || (href !== "/" && pathname.startsWith(href))) ? "bg-muted text-primary" : ""
                )}
                >
                <Icon className="h-4 w-4" />
                {label}
                </Link>
            ))}
        </nav>
    );
};

const UserControls = () => (
    <div className="p-4 space-y-4 border-t">
        <div className="flex justify-center">
            <PlayerName />
        </div>
        <div className="flex justify-center">
            <RoleSwitcher />
        </div>
        <DataManager />
    </div>
);

export const MobileHeader = () => {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <div className="flex h-14 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <span className="font-semibold text-primary">KEEP Going Broo</span>
                        </Link>
                    </div>
                    <div className="overflow-y-auto py-2">
                        <NavContent />
                    </div>
                    <UserControls />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <h1 className="text-lg font-semibold text-primary">
                    KEEP Going Broo
                </h1>
            </div>
        </header>
    );
}

export default function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="font-semibold text-primary">KEEP Going Broo</span>
            </Link>
        </div>
        <div className="overflow-y-auto py-2">
            <NavContent />
        </div>
        <UserControls />
    </div>
  );
}
