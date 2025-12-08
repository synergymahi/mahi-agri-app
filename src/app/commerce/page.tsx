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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 gap-4">
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

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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

            {/* Desktop View: Tabs */}
            <div className="hidden md:block">
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h3 className="text-lg font-medium">Commandes Récentes</h3>
                            <div className="flex space-x-2 w-full md:w-auto">
                                <div className="flex-1 md:flex-none"><AddCustomerDialog /></div>
                                <div className="flex-1 md:flex-none"><CreateOrderDialog products={products} customers={customers} /></div>
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

            {/* Mobile View: Accordion */}
            <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-2">
                    <AccordionItem value="catalog" className="border rounded-lg px-2">
                        <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <Store className="h-5 w-5" />
                                <span className="font-semibold">Catalogue Produits</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                            <ProductList products={products} />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="orders" className="border rounded-lg px-2">
                        <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-blue-700">
                                <ShoppingBag className="h-5 w-5" />
                                <span className="font-semibold">Commandes & Suivi</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 space-y-4">
                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex gap-2">
                                    <div className="flex-1"><AddCustomerDialog /></div>
                                    <div className="flex-1"><CreateOrderDialog products={products} customers={customers} /></div>
                                </div>
                            </div>
                            <Card className="border-0 shadow-none">
                                <CardContent className="p-0">
                                    <OrderList orders={orders} />
                                </CardContent>
                            </Card>
                            <div className="flex justify-center pt-2">
                                <Link href="/commerce/orders" className="w-full">
                                    <Button variant="outline" className="w-full">Voir tout l'historique</Button>
                                </Link>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="marketplace" className="border rounded-lg px-2">
                        <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-purple-700">
                                <Store className="h-5 w-5" />
                                <span className="font-semibold">Ma Boutique (Aperçu)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                            <div className="flex justify-center p-6 border border-dashed rounded-lg bg-muted/10">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-4">Aperçu public de votre boutique.</p>
                                    <Link href="/shop" target="_blank">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 w-full">
                                            Visiter la Boutique
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
