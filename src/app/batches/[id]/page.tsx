import { getBatch } from "@/app/actions/get-batch"
import { getDailyLogs } from "@/app/actions/daily-log-actions"
import { getHealthEvents } from "@/app/actions/health-actions"
import { CreateDailyLogDialog } from "@/components/livestock/create-daily-log-dialog"
import { EditBatchDialog } from "@/components/livestock/edit-batch-dialog"
import { DailyLogList } from "@/components/livestock/daily-log-list"
import { CreateHealthEventDialog } from "@/components/livestock/create-health-event-dialog"
import { HealthEventList } from "@/components/livestock/health-event-list"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface BatchDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function BatchDetailsPage({ params }: BatchDetailsPageProps) {
    const { id } = await params
    const batch = await getBatch(id)
    const logs = await getDailyLogs(id)
    const healthEvents = await getHealthEvents(id)

    if (!batch) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{batch.name}</h2>
                    <p className="text-muted-foreground">
                        {batch.type === "LAYER" && "Poule Pondeuse"}
                        {batch.type === "BROILER" && "Poulet de Chair"}
                        {batch.type === "PIG" && "Porc"}
                        {" • "}
                        Démarré le {format(new Date(batch.startDate), "dd MMMM yyyy", { locale: fr })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <EditBatchDialog batch={batch} />
                    <Badge variant={batch.status === "ACTIVE" ? "default" : "secondary"}>
                        {batch.status === "ACTIVE" ? "Actif" : "Fermé"}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Effectif Actuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{batch.currentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            sur {batch.initialCount} initial
                        </p>
                    </CardContent>
                </Card>
                {/* Add more summary cards here later (Mortality %, Feed Total, etc.) */}
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Suivi Quotidien</h3>
                    <CreateDailyLogDialog batchId={batch.id} batchName={batch.name} />
                </div>
                <DailyLogList logs={logs} />
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Santé (Vaccins & Traitements)</h3>
                    <CreateHealthEventDialog batchId={batch.id} batchName={batch.name} />
                </div>
                <HealthEventList events={healthEvents} />
            </div>
        </div>
    )
}
