"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getCropById, getOperations } from "@/app/actions/crop-actions"
import { Crop, CropOperation } from "@/types"
import { AddOperationDialog } from "@/components/crops/add-operation-dialog"
import { OperationTimeline } from "@/components/crops/operation-timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useParams } from "next/navigation"
import { CalendarDays, Tractor, TrendingUp } from "lucide-react"

export default function CropDetailPage() {
    const { user } = useAuth()
    const params = useParams()
    const id = params.id as string

    const [crop, setCrop] = useState<Crop | null>(null)
    const [operations, setOperations] = useState<CropOperation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (user && id) {
                const [cropData, opsData] = await Promise.all([
                    getCropById(id),
                    getOperations(id),
                ])
                setCrop(cropData)
                setOperations(opsData)
            }
            setLoading(false)
        }
        loadData()
    }, [user, id])

    if (loading) {
        return <div className="p-8"><Skeleton className="h-64 w-full" /></div>
    }

    if (!crop) {
        return <div className="p-8">Culture introuvable.</div>
    }

    const totalCost = operations.reduce((acc, op) => acc + (op.cost || 0), 0)

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{crop.name}</h2>
                    <p className="text-muted-foreground">
                        {crop.variety} • {crop.status}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddOperationDialog crop={crop} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Durée
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {crop.startDate ? format(crop.startDate, "d MMM yyyy", { locale: fr }) : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            à {crop.endDate ? format(crop.endDate, "d MMM yyyy", { locale: fr }) : "..."}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Coût Total
                        </CardTitle>
                        <Tractor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCost.toLocaleString()} FCFA</div>
                        <p className="text-xs text-muted-foreground">
                            {operations.length} opérations enregistrées
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rendement Attendu
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{crop.expectedYield || "-"} T</div>
                        <p className="text-xs text-muted-foreground">
                            Objectif initial
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Journal des Opérations</CardTitle>
                        <CardDescription>
                            Suivi des activités agricoles sur cette parcelle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OperationTimeline operations={operations} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
