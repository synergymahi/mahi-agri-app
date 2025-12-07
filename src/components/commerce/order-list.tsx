"use client"

import { Order, OrderStatus } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye } from "lucide-react"
import Link from "next/link"

interface OrderListProps {
    orders: Order[]
}

const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case "PAID": return <Badge className="bg-green-500">Payé</Badge>;
        case "PENDING": return <Badge variant="secondary">En attente</Badge>;
        case "DELIVERED": return <Badge className="bg-blue-500">Livré</Badge>;
        case "CANCELLED": return <Badge variant="destructive">Annulé</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

export function OrderList({ orders }: OrderListProps) {
    if (orders.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">Aucune commande.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{format(order.date, "d MMM yyyy", { locale: fr })}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.totalAmount.toLocaleString()} FCFA</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/commerce/orders/${order.id}`}>
                                <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
