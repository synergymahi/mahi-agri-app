import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bird, AlertTriangle, DollarSign } from "lucide-react"

export function OverviewCards() {
    // Mock data - will be replaced by real data fetching
    const stats = [
        {
            title: "Total Animaux",
            value: "1,250",
            description: "+20% depuis le mois dernier",
            icon: Bird,
        },
        {
            title: "Mortalité (Mois)",
            value: "2.4%",
            description: "+0.1% depuis la semaine dernière",
            icon: Activity,
            alert: true,
        },
        {
            title: "Stock Critique",
            value: "2",
            description: "Aliment Démarrage, Vaccin B",
            icon: AlertTriangle,
            alert: true,
        },
        {
            title: "Revenu (Mois)",
            value: "4.5M FCFA",
            description: "+15% par rapport au mois dernier",
            icon: DollarSign,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.alert ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
