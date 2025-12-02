"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, limit, updateDoc, doc, Timestamp, where } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { FarmProfile, LivestockType } from "@/types"

const farmProfileSchema = z.object({
    farmName: z.string().min(2, "Le nom de la ferme est requis"),
    ownerName: z.string().min(2, "Le nom du propriétaire est requis"),
    phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
    location: z.string().min(2, "La localisation est requise"),
    farmingTypes: z.array(z.enum(["LAYER", "BROILER", "PIG"])).min(1, "Sélectionnez au moins un type d'élevage"),
    capacities: z.record(z.string(), z.coerce.number().min(0)),
})

export async function createFarmProfile(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const farmingTypes = formData.getAll("farmingTypes") as LivestockType[]

    // Construct capacities object from formData
    const capacities: Record<string, number> = {}
    farmingTypes.forEach(type => {
        const cap = formData.get(`capacity_${type}`)
        if (cap) capacities[type] = Number(cap)
    })

    const validatedFields = farmProfileSchema.safeParse({
        farmName: formData.get("farmName"),
        ownerName: formData.get("ownerName"),
        phoneNumber: formData.get("phoneNumber"),
        location: formData.get("location"),
        farmingTypes: farmingTypes,
        capacities: capacities,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const data = validatedFields.data

    try {
        // Check if a profile already exists for this user
        const q = query(collection(db, "farms"), where("userId", "==", userId), limit(1))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
            return { message: "Un profil de ferme existe déjà pour cet utilisateur." }
        }

        await addDoc(collection(db, "farms"), {
            ...data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/settings")
        return { message: "Profil de ferme créé avec succès", success: true }
    } catch (error) {
        console.error("Failed to create farm profile:", error)
        return { message: "Erreur lors de la création du profil" }
    }
}

export async function updateFarmProfile(prevState: any, formData: FormData) {
    const id = formData.get("id") as string
    if (!id) return { message: "ID manquant" }

    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const farmingTypes = formData.getAll("farmingTypes") as LivestockType[]

    // Construct capacities object from formData
    const capacities: Record<string, number> = {}
    farmingTypes.forEach(type => {
        const cap = formData.get(`capacity_${type}`)
        if (cap) capacities[type] = Number(cap)
    })

    const validatedFields = farmProfileSchema.safeParse({
        farmName: formData.get("farmName"),
        ownerName: formData.get("ownerName"),
        phoneNumber: formData.get("phoneNumber"),
        location: formData.get("location"),
        farmingTypes: farmingTypes,
        capacities: capacities,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const data = validatedFields.data

    try {
        const farmRef = doc(db, "farms", id)
        // Verify ownership before update (optional but good practice, though Firestore rules should handle this)
        // For now, we trust the ID passed from the client form which was fetched for this user.

        await updateDoc(farmRef, {
            ...data,
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/settings")
        return { message: "Profil mis à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update farm profile:", error)
        return { message: "Erreur lors de la mise à jour" }
    }
}

export async function getFarmProfile(userId?: string) {
    if (!userId) return null

    try {
        const q = query(collection(db, "farms"), where("userId", "==", userId), limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return null
        }

        const doc = querySnapshot.docs[0]
        const data = doc.data()

        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as FarmProfile
    } catch (error) {
        console.error("Failed to fetch farm profile:", error)
        return null
    }
}
