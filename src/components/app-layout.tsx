"use strict";
"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { ProfileBanner } from "@/components/profile-banner"
import { Toaster } from "@/components/ui/sonner"
import Image from "next/image"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isPublic = pathname?.startsWith("/shop")

    if (isPublic) {
        return (
            <div className="min-h-screen bg-background font-sans antialiased">
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center">
                        <div className="mr-4 flex">
                            <a href="/shop" className="mr-6 flex items-center space-x-2">
                                <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full border" />
                                <span className="font-bold text-xl text-emerald-700">Lafermedemahi</span>
                            </a>
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    {children}
                </main>
                <Toaster />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex flex-col">
                <ProfileBanner />
                <div className="flex items-center p-4 border-b">
                    <SidebarTrigger />
                    <div className="ml-4 flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-full border object-cover" />
                        <h1 className="font-semibold">Lafermedemahi</h1>
                    </div>
                </div>
                <div className="p-4 flex-1 pb-20 md:pb-4">
                    {children}
                </div>
                <BottomNav />
            </main>
            <Toaster />
        </SidebarProvider>
    )
}
