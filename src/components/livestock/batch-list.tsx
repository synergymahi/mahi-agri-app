import { Batch } from "@/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

interface BatchListProps {
    initialBatches: Batch[]
}

export function BatchList({ initialBatches }: BatchListProps) {
    if (initialBatches.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">Aucune bande enregistrée.</p>
            </div>
        )
    }

    const typeLabels: Record<string, string> = {
        LAYER: "Poule Pondeuse",
        BROILER: "Poulet de Chair",
        PIG: "Porc",
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date de début</TableHead>
                        <TableHead>Effectif Actuel</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialBatches.map((batch: Batch) => (
                        <TableRow key={batch.id}>
                            <TableCell className="font-medium">
                                <Link href={`/batches/${batch.id}`} className="hover:underline">
                                    {batch.name}
                                </Link>
                            </TableCell>
                            <TableCell>{typeLabels[batch.type] || batch.type}</TableCell>
                            <TableCell>
                                {format(new Date(batch.startDate), "d MMMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell>{batch.currentCount}</TableCell>
                            <TableCell>
                                <Badge variant={batch.status === "ACTIVE" ? "default" : "secondary"}>
                                    {batch.status === "ACTIVE" ? "Actif" : batch.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
