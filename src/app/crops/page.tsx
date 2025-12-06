"use client"

import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { getParcels, getCrops } from "@/app/actions/crop-actions"
import { Parcel, Crop } from "@/types"
import { AddParcelDialog } from "@/components/crops/add-parcel-dialog"
import { AddCropDialog } from "@/components/crops/add-crop-dialog"
import { ParcelCard } from "@/components/crops/parcel-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { ArrowRight, Sprout } from "lucide-react"

export default function CropsPage() {
    const { user } = useAuth()
    const [parcels, setParcels] = useState<Parcel[]>([])
    const [crops, setCrops] = useState<Crop[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (user) {
                const [userParcels, userCrops] = await Promise.all([
                    getParcels(user.uid),
                    getCrops(user.uid),
                ])
                setParcels(userParcels)
                setCrops(userCrops)
            }
            setLoading(false)
        }
        loadData()
    }, [user])

    if (loading) {
        return (
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Cultures</h2>
                    <p className="text-muted-foreground">
                        Gérez vos parcelles, planifiez vos saisons et suivez vos rendements.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddParcelDialog />
                    <AddCropDialog parcels={parcels} />
                </div>
            </div>

            {/* Active Crops Overview */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Cultures en cours</h3>
                {crops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10 border-dashed">
                        <Sprout className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Aucune culture active.</p>
                        <AddCropDialog parcels={parcels} />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {crops.map((crop) => (
                            <Link key={crop.id} href={`/crops/${crop.id}`}>
                                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {crop.name}
                                        </CardTitle>
                                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${crop.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                crop.status === 'PLANNED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {crop.status === 'ACTIVE' ? 'En cours' :
                                                crop.status === 'PLANNED' ? 'Planifié' : crop.status}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{crop.variety}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Début : {crop.startDate ? format(crop.startDate, "d MMMM yyyy", { locale: fr }) : "N/A"}
                                        </p>
                                        <div className="mt-4 flex items-center text-sm text-primary font-medium">
                                            Voir détails <ArrowRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Parcels Grid */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mes Parcelles</h3>
                {parcels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10 border-dashed">
                        <p className="text-muted-foreground mb-4">Aucune parcelle enregistrée.</p>
                        <AddParcelDialog />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {parcels.map((parcel) => (
                            <ParcelCard key={parcel.id} parcel={parcel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
