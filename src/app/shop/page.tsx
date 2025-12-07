"use client"

import { useEffect, useState } from "react"
import { getAllProducts } from "@/app/actions/commerce-actions"
import { Product } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("ALL")

    useEffect(() => {
        async function loadProducts() {
            setLoading(true)
            // Ideally we pass filters to backend, but for MVP we fetch all and filter client-side 
            // to show instant results, or pass simple filters.
            // Let's pass basic filters to server if our action supports it, or just fetch all.
            const allProducts = await getAllProducts({ category: categoryFilter, search: searchTerm })
            setProducts(allProducts)
            setLoading(false)
        }

        // Debounce search
        const timer = setTimeout(() => {
            loadProducts()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, categoryFilter])

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/30 p-6 rounded-lg">
                <div className="w-full md:w-1/3 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un produit..."
                        className="pl-9 bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Toutes catégories</SelectItem>
                            <SelectItem value="CROP">Cultures</SelectItem>
                            <SelectItem value="LIVESTOCK">Élevage</SelectItem>
                            <SelectItem value="PROCESSED">Transformé</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-muted-foreground">Aucun produit trouvé</h2>
                    <p className="text-muted-foreground mt-2">Essayez de modifier vos filtres</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.id}`} className="group">
                            <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg border-muted">
                                <div className="relative aspect-square bg-muted">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <span className="text-4xl opacity-20 font-bold">{product.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur">
                                            {product.category === "CROP" ? "Culture" : product.category}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1 mb-2">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {product.region || "Non spécifié"}
                                    </div>
                                    <div className="font-bold text-xl text-emerald-600">
                                        {product.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA / {product.unit}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                        Voir Détails
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
