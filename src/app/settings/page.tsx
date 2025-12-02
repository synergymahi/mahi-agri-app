"use client"

import { FarmProfileForm } from "@/components/settings/farm-profile-form"
import { Separator } from "@/components/ui/separator"
import { getFarmProfile } from "@/app/actions/farm-actions"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { FarmProfile } from "@/types"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const [profile, setProfile] = useState<FarmProfile | null>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        async function fetchProfile() {
            if (user?.uid) {
                const data = await getFarmProfile(user.uid)
                setProfile(data)
            }
            setFetching(false)
        }

        if (!loading) {
            if (user) {
                fetchProfile()
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
            <div>
                <h3 className="text-lg font-medium">Paramètres</h3>
                <p className="text-sm text-muted-foreground">
                    Gérez les informations de votre ferme et vos préférences.
                </p>
            </div>
            <Separator />
            <FarmProfileForm initialData={profile} />
        </div>
    )
}
