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
