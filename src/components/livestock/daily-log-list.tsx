"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DailyLog } from "@/types"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DailyLogListProps {
    logs: DailyLog[]
}

export function DailyLogList({ logs }: DailyLogListProps) {
    if (logs.length === 0) {
        return <div className="text-center py-4 text-muted-foreground">Aucun suivi enregistré pour cette bande.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Mortalité</TableHead>
                        <TableHead>Aliment (kg)</TableHead>
                        <TableHead>Eau (L)</TableHead>
                        <TableHead>Poids (kg)</TableHead>
                        <TableHead>Temp (°C)</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                            <TableCell className="font-medium text-red-600">{log.mortality > 0 ? log.mortality : "-"}</TableCell>
                            <TableCell>{log.feedConsumed}</TableCell>
                            <TableCell>{log.waterConsumed}</TableCell>
                            <TableCell>{log.weight || "-"}</TableCell>
                            <TableCell>{log.temperature || "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={log.notes || ""}>
                                {log.notes || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
