import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { HealthEvent } from "@/types"
import { Badge } from "@/components/ui/badge"

import { EditHealthEventDialog } from "./edit-health-event-dialog"

interface HealthEventListProps {
    events: HealthEvent[]
}

export function HealthEventList({ events }: HealthEventListProps) {
    if (events.length === 0) {
        return (
            <div className="text-center p-4 border rounded-lg text-muted-foreground">
                Aucun événement de santé enregistré.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Coût</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => (
                        <TableRow key={event.id}>
                            <TableCell>
                                {format(new Date(event.date), "d MMMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {event.type === "VACCINE" && "Vaccin"}
                                    {event.type === "TREATMENT" && "Traitement"}
                                    {event.type === "DISEASE" && "Maladie"}
                                </Badge>
                            </TableCell>
                            <TableCell>{event.description}</TableCell>
                            <TableCell className="text-right">
                                {event.cost.toLocaleString("fr-FR")} FCFA
                            </TableCell>
                            <TableCell>
                                <EditHealthEventDialog event={event} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
