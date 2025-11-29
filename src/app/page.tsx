import { OverviewCards } from "@/components/dashboard/overview-cards"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre exploitation.
        </p>
      </div>
      <Separator />
      <OverviewCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Production d'oeufs</h3>
            <p className="text-sm text-muted-foreground">Aperçu des 30 derniers jours</p>
            <div className="mt-4 h-[300px] flex items-center justify-center border-dashed border-2 rounded-md">
              <p className="text-muted-foreground">Graphique à venir</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Activité Récente</h3>
            <p className="text-sm text-muted-foreground">Dernières interventions</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Vaccination (Bande A)</p>
                  <p className="text-sm text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Livraison Aliment</p>
                  <p className="text-sm text-muted-foreground">Il y a 5 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
