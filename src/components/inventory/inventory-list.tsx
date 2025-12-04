"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InventoryItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { StockTransactionDialog } from "./stock-transaction-dialog"
import { TransactionHistoryDialog } from "./transaction-history-dialog"
import { EditInventoryDialog } from "./edit-inventory-dialog"

interface InventoryListProps {
    items: InventoryItem[]
}

export function InventoryList({ items }: InventoryListProps) {
    if (items.length === 0) {
        return (
            <div className="text-center p-4 border rounded-lg text-muted-foreground">
                Aucun article en stock. Commencez par en ajouter un.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Prix Marché</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-[140px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const isLowStock = item.quantity <= item.minThreshold
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{item.type}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {item.currentMarketPrice ? `${item.currentMarketPrice.toLocaleString()} FCFA` : "-"}
                                </TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    {isLowStock ? (
                                        <Badge variant="destructive">Stock Bas</Badge>
                                    ) : (
                                        <Badge variant="secondary">OK</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <StockTransactionDialog item={item} />
                                        <TransactionHistoryDialog item={item} />
                                        <EditInventoryDialog item={item} />
                                        <DeleteInventoryDialog item={item} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteInventoryItem } from "@/app/actions/inventory-actions"
import { toast } from "sonner"

function DeleteInventoryDialog({ item }: { item: InventoryItem }) {
    async function handleDelete() {
        const result = await deleteInventoryItem(item.id)
        if (result.success) {
            toast.success("Article supprimé")
        } else {
            toast.error(result.message)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera l'article "{item.name}" de votre inventaire.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
