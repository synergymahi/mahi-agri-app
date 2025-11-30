"use client"

import { useState } from "react"
import { History } from "lucide-react"
import { getInventoryTransactions } from "@/app/actions/inventory-actions"
import { InventoryItem, InventoryTransaction } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface TransactionHistoryDialogProps {
    item: InventoryItem
}

export function TransactionHistoryDialog({ item }: TransactionHistoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
    const [loading, setLoading] = useState(false)

    const fetchTransactions = async () => {
        setLoading(true)
        const data = await getInventoryTransactions(item.id)
        setTransactions(data)
        setLoading(false)
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            fetchTransactions()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <History className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Historique - {item.name}</DialogTitle>
                    <DialogDescription>
                        Historique des mouvements de stock.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">Chargement...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                            Aucun mouvement enregistré.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantité</TableHead>
                                    <TableHead className="text-right">Coût</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === "IN" ? "default" : "secondary"}>
                                                {transaction.type === "IN" ? "Entrée" : "Sortie"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {transaction.type === "IN" ? "+" : "-"}{transaction.quantity} {item.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.cost ? `${transaction.cost.toLocaleString()} FCFA` : "-"}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={transaction.notes || ""}>
                                            {transaction.notes || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <EditTransactionDialog
                                                transaction={transaction}
                                                onSuccess={fetchTransactions}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
