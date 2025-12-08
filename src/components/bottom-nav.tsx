"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, DollarSign, Sprout, Menu, Bird } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

export function BottomNav() {
    const pathname = usePathname()
    // access sidebar context to toggle menu
    // Note: useSidebar must be used within SidebarProvider. 
    // AppLayout wraps everything in SidebarProvider, so this should work if placed inside.
    const { toggleSidebar } = useSidebar()

    const navItems = [
        {
            title: "Accueil",
            url: "/",
            icon: Home,
        },
        {
            title: "Élevage",
            url: "/batches",
            icon: Bird,
        },
        {
            title: "Cultures",
            url: "/crops",
            icon: Sprout,
        },
        {
            title: "Commerce",
            url: "/commerce",
            icon: Store,
        },
        {
            title: "Finance",
            url: "/finance",
            icon: DollarSign,
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 backdrop-blur-lg md:hidden safe-area-bottom">
            {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                    <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                    </Link>
                )
            })}
            <button
                onClick={toggleSidebar}
                className="flex flex-col items-center justify-center space-y-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                <Menu className="h-5 w-5" />
                <span>Menu</span>
            </button>
        </div>
    )
}
