import { Product } from "@/types"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreVertical, Trash2, Pencil, Tag, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteProduct } from "@/app/actions/commerce-actions"
import { EditProductDialog } from "./edit-product-dialog"
import { toast } from "sonner"
import { useState, useTransition } from "react"

interface ProductListProps {
    products: Product[]
}

export function ProductList({ products }: ProductListProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = (productId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            startTransition(async () => {
                const result = await deleteProduct(productId)
                if (result.success) {
                    toast.success("Produit supprimé")
                } else {
                    toast.error("Erreur lors de la suppression")
                }
            })
        }
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-10 border border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Aucun produit dans le catalogue.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                    <div className="relative aspect-video w-full bg-muted">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <span className="text-2xl font-bold opacity-20">{product.name.charAt(0)}</span>
                            </div>
                        )}

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <EditProductDialog product={product}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                                        </DropdownMenuItem>
                                    </EditProductDialog>
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 focus:text-red-600 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <CardHeader className="p-4 pt-0 bg-transparent">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-semibold truncate">
                                {product.name}
                            </CardTitle>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {product.category}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                            {product.price.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">FCFA / {product.unit}</span>
                        </div>

                        {product.region && (
                            <div className="flex items-center text-xs text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {product.region}
                            </div>
                        )}

                        {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {product.description}
                            </p>
                        )}

                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                En stock
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
