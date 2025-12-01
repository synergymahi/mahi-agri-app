import { getSales, getExpenses } from "@/app/actions/finance-actions"
import { CreateSaleDialog } from "@/components/finance/create-sale-dialog"
import { CreateExpenseDialog } from "@/components/finance/create-expense-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"

export default async function FinancePage() {
    const sales = await getSales()
    const expenses = await getExpenses()

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0)
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0)
    const netProfit = totalRevenue - totalExpenses

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
                    <p className="text-muted-foreground">
                        Vue d'ensemble de la santé financière de l'exploitation.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateExpenseDialog />
                    <CreateSaleDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalRevenue.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {totalExpenses.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                        </div>
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

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dernières Ventes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sales.slice(0, 5).map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{sale.item}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(sale.date), "dd MMM yyyy", { locale: fr })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            +{sale.totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {sale.quantity} x {sale.unitPrice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {sales.length === 0 && (
                                <p className="text-center text-muted-foreground">Aucune vente enregistrée.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dernières Dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenses.slice(0, 5).map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{expense.category}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(expense.date), "dd MMM yyyy", { locale: fr })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">
                                            -{expense.amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {expenses.length === 0 && (
                                <p className="text-center text-muted-foreground">Aucune dépense enregistrée.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
