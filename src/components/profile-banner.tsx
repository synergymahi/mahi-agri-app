"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getFarmProfile } from "@/app/actions/farm-actions"

export function ProfileBanner() {
    const { user, loading } = useAuth()
    const [hasProfile, setHasProfile] = useState<boolean | null>(null)

    useEffect(() => {
        async function checkProfile() {
            if (user?.uid) {
                const profile = await getFarmProfile(user.uid)
                setHasProfile(!!profile)
            }
        }

        if (!loading && user) {
            checkProfile()
        }
    }, [user, loading])

    // Don't show if loading, not logged in, or profile already exists (or status unknown)
    if (loading || !user || hasProfile === true || hasProfile === null) {
        return null
    }

    return (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="flex items-center justify-between container mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        Votre profil de ferme est incomplet. Veuillez le compléter pour accéder à toutes les fonctionnalités.
                    </p>
                </div>
                <Button asChild variant="outline" size="sm" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                    <Link href="/settings">
                        Compléter mon profil
                    </Link>
                </Button>
            </div>
        </div>
    )
}
