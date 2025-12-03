"use client"

import { getInventoryItems } from "@/app/actions/inventory-actions"
import { InventoryList } from "@/components/inventory/inventory-list"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { InventoryItem } from "@/types"
import { Loader2 } from "lucide-react"

export default function InventoryPage() {
    const { user, loading } = useAuth()
    const [items, setItems] = useState<InventoryItem[]>([])
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        async function fetchItems() {
            if (user?.uid) {
                const data = await getInventoryItems(user.uid)
                setItems(data)
            }
            setFetching(false)
        }

        if (!loading) {
            if (user) {
                fetchItems()
            } else {
                setFetching(false)
            }
        }
    }, [user, loading])

    if (loading || fetching) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

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
