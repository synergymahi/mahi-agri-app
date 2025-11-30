import { getInventoryItems } from "@/app/actions/inventory-actions"
import { InventoryList } from "@/components/inventory/inventory-list"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"

export default async function InventoryPage() {
    const items = await getInventoryItems()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventaire</h2>
                    <p className="text-muted-foreground">
                        Gérez vos stocks d'aliments, médicaments et matériel.
                    </p>
                </div>
                <AddItemDialog />
            </div>

            <InventoryList items={items} />
        </div>
    )
}
