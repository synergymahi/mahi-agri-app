"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getOrders, getProducts, getCustomers } from "@/app/actions/commerce-actions"
import { Order, Product, Customer } from "@/types"
import { OrderList } from "@/components/commerce/order-list"
import { CreateOrderDialog } from "@/components/commerce/create-order-dialog"
import { AddCustomerDialog } from "@/components/commerce/add-customer-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function OrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (user) {
                const [userData, userProducts, userCustomers] = await Promise.all([
                    getOrders(user.uid),
                    getProducts(user.uid),
                    getCustomers(user.uid),
                ])
                setOrders(userData)
                setProducts(userProducts)
                setCustomers(userCustomers)
            }
            setLoading(false)
        }
        loadData()
    }, [user])

    if (loading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
                    <p className="text-muted-foreground">
                        Liste de toutes les ventes et commandes clients.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddCustomerDialog />
                    <CreateOrderDialog products={products} customers={customers} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historique</CardTitle>
                    <CardDescription>
                        {orders.length} commande(s) enregistrée(s).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderList orders={orders} />
                </CardContent>
            </Card>
        </div>
    )
}
