"use client"

import {
  Home,
  LayoutDashboard,
  Settings,
  Activity,
  Package,
  Bird,
  DollarSign,
  Menu,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: Home,
  },
  {
    title: "Élevage",
    url: "/batches",
    icon: Bird,
  },
  {
    title: "Inventaire",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
  },
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bird className="h-5 w-5" />
          </div>
          <div className="font-bold text-lg">Mahi Agri</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium truncate">
                {user.phoneNumber}
              </div>
              <Button variant="outline" size="sm" onClick={signOut} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Non connecté
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
