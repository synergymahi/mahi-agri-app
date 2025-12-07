"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createOrder } from "@/app/actions/commerce-actions"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Product, Customer } from "@/types"

interface CreateOrderDialogProps {
    products: Product[]
    customers: Customer[]
}

export function CreateOrderDialog({ products, customers }: CreateOrderDialogProps) {
    const [open, setOpen] = useState(false)
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [orderItems, setOrderItems] = useState<{ productId: string, quantity: number }[]>([])
    const [notes, setNotes] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("CASH")

    // Add item to order
    const addItem = () => {
        setOrderItems([...orderItems, { productId: "", quantity: 1 }])
    }

    // Update item
    const updateItem = (index: number, field: "productId" | "quantity", value: string | number) => {
        const newItems = [...orderItems]
        // @ts-ignore
        newItems[index][field] = value
        setOrderItems(newItems)
    }

    // Remove item
    const removeItem = (index: number) => {
        const newItems = [...orderItems]
        newItems.splice(index, 1)
        setOrderItems(newItems)
    }

    // Calculate Total
    const calculateTotal = () => {
        return orderItems.reduce((acc, item) => {
            const product = products.find(p => p.id === item.productId)
            return acc + (product ? product.price * item.quantity : 0)
        }, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        // Prepare data
        const customer = customers.find(c => c.id === selectedCustomer)
        if (!customer) {
            toast.error("Veuillez sélectionner un client")
            setLoading(false)
            return
        }

        const validItems = orderItems
            .filter(item => item.productId && item.quantity > 0)
            .map(item => {
                const product = products.find(p => p.id === item.productId)
                return {
                    productId: item.productId,
                    productName: product?.name || "Inconnu",
                    quantity: item.quantity,
                    unitPrice: product?.price || 0,
                    total: (product?.price || 0) * item.quantity
                }
            })

        if (validItems.length === 0) {
            toast.error("La commande est vide")
            setLoading(false)
            return
        }

        const result = await createOrder({
            userId: user.uid,
            customerId: customer.id,
            customerName: customer.name,
            items: validItems,
            paymentMethod,
            notes
        })

        if (result.success) {
            toast.success("Commande créée avec succès")
            setOpen(false)
            // Reset form
            setSelectedCustomer("")
            setOrderItems([])
            setNotes("")
        } else {
            toast.error(result.message)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Nouvelle Commande
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Créer une commande</DialogTitle>
                    <DialogDescription>
                        Enregistrez une nouvelle vente pour un client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Client</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 border-t border-b py-4">
                        <div className="flex justify-between items-center mb-2">
                            <Label>Panier</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-1" /> Ajouter Article
                            </Button>
                        </div>

                        {orderItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <Select
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(index, "productId", val)}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} - {p.price}F/{p.unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                                    className="w-20"
                                    min="1"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                    <Minus className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        {orderItems.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center">Aucun article.</p>
                        )}
                    </div>

                    <div className="flex justify-end text-lg font-bold">
                        Total: {calculateTotal().toLocaleString()} FCFA
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Paiement</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Méthode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Espèces</SelectItem>
                                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Notes</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="col-span-3"
                            placeholder="Instructions de livraison..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Enregistrer la commande"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
