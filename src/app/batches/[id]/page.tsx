import { getBatch } from "@/app/actions/get-batch"
import { getDailyLogs } from "@/app/actions/daily-log-actions"
import { getHealthEvents } from "@/app/actions/health-actions"
import { getReproductionRecords } from "@/app/actions/reproduction-actions"
import { getSalesByBatch, getExpensesByBatch } from "@/app/actions/finance-actions"
import { CreateDailyLogDialog } from "@/components/livestock/create-daily-log-dialog"
import { EditBatchDialog } from "@/components/livestock/edit-batch-dialog"
import { DailyLogList } from "@/components/livestock/daily-log-list"
import { CreateHealthEventDialog } from "@/components/livestock/create-health-event-dialog"
import { HealthEventList } from "@/components/livestock/health-event-list"
import { ReproductionList } from "@/components/livestock/reproduction-list"
import { CreateReproductionDialog } from "@/components/livestock/create-reproduction-dialog"
import { EditSaleDialog } from "@/components/finance/edit-sale-dialog"
import { DeleteSaleDialog } from "@/components/finance/delete-sale-dialog"
import { EditExpenseDialog } from "@/components/finance/edit-expense-dialog"
import { DeleteExpenseDialog } from "@/components/finance/delete-expense-dialog"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react"

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
    const reproductionRecords = await getReproductionRecords(id)
    const sales = await getSalesByBatch(id)
    const expenses = await getExpensesByBatch(id)

    if (!batch) {
        notFound()
    }

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0)
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0)
    const netProfit = totalRevenue - totalExpenses

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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {netProfit.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <Tabs defaultValue="daily-logs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="daily-logs">Suivi Quotidien</TabsTrigger>
                    <TabsTrigger value="health">Santé</TabsTrigger>
                    {batch.type === "LAYER" && <TabsTrigger value="reproduction">Ponte</TabsTrigger>}
                    <TabsTrigger value="financials">Finance</TabsTrigger>
                </TabsList>
                <TabsContent value="daily-logs" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Journal de bord</h2>
                        <CreateDailyLogDialog batchId={batch.id} batchName={batch.name} />
                    </div>
                    <DailyLogList logs={logs} />
                </TabsContent>
                <TabsContent value="health" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Événements de Santé</h2>
                        <CreateHealthEventDialog batchId={batch.id} batchName={batch.name} />
                    </div>
                    <HealthEventList events={healthEvents} />
                </TabsContent>
                <TabsContent value="reproduction" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Suivi de Ponte</h2>
                        <CreateReproductionDialog batchId={batch.id} />
                    </div>
                    <ReproductionList records={reproductionRecords} />
                </TabsContent>
                <TabsContent value="financials" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Rentabilité du Lot</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {totalRevenue.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {sales.map(sale => (
                                        <div key={sale.id} className="flex items-center justify-between text-sm border-b pb-1 last:border-0">
                                            <div>
                                                <span>{sale.item} ({format(new Date(sale.date), "dd/MM")})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">+{sale.totalAmount.toLocaleString("fr-FR")}</span>
                                                <div className="flex items-center">
                                                    <EditSaleDialog sale={sale} />
                                                    <DeleteSaleDialog sale={sale} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {sales.length === 0 && <p className="text-xs text-muted-foreground">Aucune vente.</p>}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {totalExpenses.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {expenses.map(expense => (
                                        <div key={expense.id} className="flex items-center justify-between text-sm border-b pb-1 last:border-0">
                                            <div>
                                                <span>{expense.category} ({format(new Date(expense.date), "dd/MM")})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">-{expense.amount.toLocaleString("fr-FR")}</span>
                                                <div className="flex items-center">
                                                    <EditExpenseDialog expense={expense} />
                                                    <DeleteExpenseDialog expense={expense} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {expenses.length === 0 && <p className="text-xs text-muted-foreground">Aucune dépense.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
