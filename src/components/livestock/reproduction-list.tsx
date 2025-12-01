"use client"

import { ReproductionRecord } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ReproductionListProps {
    records: ReproductionRecord[]
}

export function ReproductionList({ records }: ReproductionListProps) {
    if (records.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Aucune donnée de reproduction enregistrée.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Collectés</TableHead>
                        <TableHead className="text-right">Cassés</TableHead>
                        <TableHead className="text-right">Taux de ponte (Est.)</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                {format(new Date(record.date), "dd MMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {record.quantityCollected}
                            </TableCell>
                            <TableCell className="text-right text-red-500">
                                {record.damagedQuantity > 0 ? record.damagedQuantity : "-"}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                - {/* TODO: Calculate Laying Rate based on current bird count */}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                                {record.notes || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
