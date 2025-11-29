import { BatchList } from "@/components/livestock/batch-list"
import { CreateBatchDialog } from "@/components/livestock/create-batch-dialog"
import { Separator } from "@/components/ui/separator"

export default function BatchesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion d'Élevage</h2>
                    <p className="text-muted-foreground">
                        Gérez vos bandes de poules, poulets et porcs.
                    </p>
                </div>
                <CreateBatchDialog />
            </div>
            <Separator />
            <BatchList />
        </div>
    )
}
