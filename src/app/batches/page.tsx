"use client"

import { BatchList } from "@/components/livestock/batch-list"
import { CreateBatchDialog } from "@/components/livestock/create-batch-dialog"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getBatches } from "@/app/actions/batch-actions"
import { Batch } from "@/types"
import { Loader2 } from "lucide-react"

export default function BatchesPage() {
    const { user, loading } = useAuth()
    const [batches, setBatches] = useState<Batch[]>([])
    const [fetching, setFetching] = useState(true)

    async function fetchBatches() {
        if (user?.uid) {
            const data = await getBatches(user.uid)
            setBatches(data)
        }
        setFetching(false)
    }

    useEffect(() => {
        if (!loading) {
            if (user) {
                fetchBatches()
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
                    <h2 className="text-3xl font-bold tracking-tight">Gestion d'Élevage</h2>
                    <p className="text-muted-foreground">
                        Gérez vos bandes de poules, poulets et porcs.
                    </p>
                </div>
                <CreateBatchDialog onSuccess={fetchBatches} />
            </div>
            <Separator />
            <BatchList initialBatches={batches} />
        </div>
    )
}
