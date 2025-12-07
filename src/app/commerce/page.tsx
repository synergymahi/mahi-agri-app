"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getProducts, getOrders } from "@/app/actions/commerce-actions"
import { Product, Order, Customer } from "@/types"
import { AddProductDialog } from "@/components/commerce/add-product-dialog"
import { ProductList } from "@/components/commerce/product-list"
import { CreateOrderDialog } from "@/components/commerce/create-order-dialog"
import { AddCustomerDialog } from "@/components/commerce/add-customer-dialog"
import { OrderList } from "@/components/commerce/order-list"
import { getCustomers } from "@/app/actions/commerce-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, Store, CreditCard } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CommercePage() {
    const { user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (user) {
                const [userProducts, userOrders, userCustomers] = await Promise.all([
                    getProducts(user.uid),
                    getOrders(user.uid),
                    getCustomers(user.uid),
                ])
                setProducts(userProducts)
                setOrders(userOrders)
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
                    <h2 className="text-3xl font-bold tracking-tight">Commerce & Ventes</h2>
                    <p className="text-muted-foreground">
                        Gérez votre catalogue, vos clients et vos commandes.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddProductDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Chiffre d'Affaires
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()} FCFA
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {orders.filter(o => o.status === 'PENDING').length} en attente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Catalogue
                        </CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Produits en vente
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="catalog" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="catalog">Catalogue Produits</TabsTrigger>
                    <TabsTrigger value="orders">Commandes & Suivi</TabsTrigger>
                    <TabsTrigger value="marketplace">Ma Boutique (Aperçu)</TabsTrigger>
                </TabsList>

                <TabsContent value="catalog" className="space-y-4">
                    <ProductList products={products} />
                </TabsContent>



                <TabsContent value="orders" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Commandes Récentes</h3>
                        <div className="flex space-x-2">
                            <AddCustomerDialog />
                            <CreateOrderDialog products={products} customers={customers} />
                        </div>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <OrderList orders={orders} />
                        </CardContent>
                    </Card>
                    <div className="flex justify-end pt-4">
                        <Link href="/commerce/orders">
                            <Button variant="outline">Voir tout l'historique</Button>
                        </Link>
                    </div>
                </TabsContent>

                <TabsContent value="marketplace" className="space-y-4">
                    <div className="flex justify-center p-8 border border-dashed rounded-lg bg-muted/10">
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Aperçu Boutique</h3>
                            <p className="text-muted-foreground mb-4">C'est ici que vos clients verront vos produits.</p>
                            <Link href="/shop" target="_blank">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Store className="mr-2 h-4 w-4" />
                                    Visiter la Boutique Publique
                                </Button>
                            </Link>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
