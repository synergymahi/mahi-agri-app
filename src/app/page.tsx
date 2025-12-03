"use client"

import { useEffect, useState } from "react"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { getDashboardStats, getRecentActivity } from "@/app/actions/dashboard-actions"
import { Loader2 } from "lucide-react"
import { CapacityIndicator } from "@/components/dashboard/capacity-indicator"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<{
    totalAnimals: number
    activeBatches: number
    lowStockItems: number
    monthlyRevenue: number
    capacityUtilization: any
  }>({
    totalAnimals: 0,
    activeBatches: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    capacityUtilization: null
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(user.uid),
          getRecentActivity(user.uid)
        ])
        setStats(statsData)
        setRecentActivity(activityData)
        setLoading(false)
      }
      fetchData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  if (loading || authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre exploitation.
        </p>
      </div>
      <Separator />
      <OverviewCards stats={stats} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold leading-none tracking-tight">Production d'oeufs</h3>
              <p className="text-sm text-muted-foreground">Aperçu des 30 derniers jours</p>
              <div className="mt-4 h-[300px] flex items-center justify-center border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">Graphique à venir</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3 space-y-4">
          <CapacityIndicator data={stats.capacityUtilization} />
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold leading-none tracking-tight">Activité Récente</h3>
              <p className="text-sm text-muted-foreground">Dernières ventes</p>
              <div className="mt-4">
                <RecentActivity activities={recentActivity} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
