"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getOrders, updateOrderStatus } from "@/app/actions/commerce-actions"
import { Order } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Printer, Check, Truck, Ban } from "lucide-react"
import { toast } from "sonner"

export default function OrderDetailPage() {
    const { user } = useAuth()
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    // Helper to fetch single order - reusing getOrders for MVP simplicy
    // In production we would have getOrderById
    useEffect(() => {
        async function loadData() {
            if (user) {
                const allOrders = await getOrders(user.uid)
                const found = allOrders.find(o => o.id === id)
                setOrder(found || null)
            }
            setLoading(false)
        }
        loadData()
    }, [user, id])

    const handleStatusUpdate = async (status: "PAID" | "DELIVERED" | "CANCELLED") => {
        if (!order) return
        const res = await updateOrderStatus(order.id, status)
        if (res.success) {
            toast.success("Statut mis à jour")
            setOrder({ ...order, status })
        } else {
            toast.error(res.message)
        }
    }

    if (loading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>
    }

    if (!order) {
        return <div className="p-8">Commande introuvable.</div>
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between space-y-2 print:hidden">
                <Button variant="outline" onClick={() => router.back()}>
                    Retour
                </Button>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimer Facture
                    </Button>
                    {order.status === "PENDING" && (
                        <>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate("PAID")}>
                                <Check className="mr-2 h-4 w-4" />
                                Marquer Payé
                            </Button>
                            <Button variant="destructive" onClick={() => handleStatusUpdate("CANCELLED")}>
                                <Ban className="mr-2 h-4 w-4" />
                                Annuler
                            </Button>
                        </>
                    )}
                    {order.status === "PAID" && (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate("DELIVERED")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Marquer Livré
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border shadow-lg p-8 bg-white text-black" id="invoice-content">
                <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-emerald-700">FACTURE</h1>
                        <p className="text-sm text-gray-500 mt-1">№ {order.id.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">Lafermedemahi</h2>
                        <p className="text-sm text-gray-500">Plateforme Agricole</p>
                        <p className="text-sm text-gray-500">{user?.phoneNumber}</p>
                    </div>
                </div>

                <div className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-900">Facturé à :</h3>
                        <div className="text-gray-600">
                            <p className="font-bold">{order.customerName}</p>
                            {/* In a real app we would have customer address here */}
                            <p>Client enregistré</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="font-semibold text-gray-900">Détails :</h3>
                        <div className="text-gray-600">
                            <p>Date: {format(order.date, "dd/MM/yyyy")}</p>
                            <p>Statut: <span className="uppercase font-bold">{order.status}</span></p>
                            <p>Paiement: {order.paymentMethod || "Non spécifié"}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-y border-gray-300">
                                <th className="py-3 font-semibold">Description</th>
                                <th className="py-3 font-semibold text-right">Quantité</th>
                                <th className="py-3 font-semibold text-right">Prix Unitaire</th>
                                <th className="py-3 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3">{item.productName}</td>
                                    <td className="py-3 text-right">{item.quantity}</td>
                                    <td className="py-3 text-right">{item.unitPrice.toLocaleString()}</td>
                                    <td className="py-3 text-right font-medium">{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end border-t pt-8">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-bold text-lg">Total à payer (FCFA)</span>
                            <span className="font-bold text-lg text-emerald-700">{order.totalAmount.toLocaleString()}</span>
                        </div>
                        {order.notes && (
                            <div className="mt-4 text-sm text-gray-500">
                                <strong>Notes:</strong> {order.notes}
                            </div>
                        )}
                    </div>
                </div>

                <CardFooter className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
                    Merci de votre confiance. Généré par Lafermedemahi.
                </CardFooter>
            </Card>
        </div>
    )
}
