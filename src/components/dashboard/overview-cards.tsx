import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bird, AlertTriangle, DollarSign } from "lucide-react"

export function OverviewCards({ stats }: { stats: any }) {
    const cards = [
        {
            title: "Total Animaux",
            value: stats.totalAnimals.toLocaleString(),
            description: "Dans les bandes actives",
            icon: Bird,
        },
        {
            title: "Bandes Actives",
            value: stats.activeBatches.toString(),
            description: "En cours de production",
            icon: Activity,
        },
        {
            title: "Stock Critique",
            value: stats.lowStockItems.toString(),
            description: "Articles sous le seuil",
            icon: AlertTriangle,
            alert: stats.lowStockItems > 0,
        },
        {
            title: "Revenu (Mois)",
            value: `${stats.monthlyRevenue.toLocaleString()} FCFA`,
            description: "Depuis le début du mois",
            icon: DollarSign,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.alert ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
