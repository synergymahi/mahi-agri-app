"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, Timestamp } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Batch } from "@/types"

const batchSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    type: z.enum(["LAYER", "BROILER", "PIG"]),
    startDate: z.string().transform((str) => new Date(str)),
    initialCount: z.coerce.number().min(1, "L'effectif doit être positif"),
})

export async function createBatch(prevState: any, formData: FormData) {
    const validatedFields = batchSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        startDate: formData.get("startDate"),
        initialCount: formData.get("initialCount"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { name, type, startDate, initialCount } = validatedFields.data

    try {
        await addDoc(collection(db, "batches"), {
            name,
            type,
            startDate: Timestamp.fromDate(startDate),
            initialCount,
            currentCount: initialCount,
            status: "ACTIVE",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })
        revalidatePath("/batches")
        return { message: "Bande créée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create batch:", error)
        return { message: "Erreur lors de la création de la bande" }
    }
}

export async function updateBatch(id: string, prevState: any, formData: FormData) {
    const validatedFields = batchSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        startDate: formData.get("startDate"),
        initialCount: formData.get("initialCount"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { name, type, startDate, initialCount } = validatedFields.data

    try {
        const batchRef = doc(db, "batches", id)
        await updateDoc(batchRef, {
            name,
            type,
            startDate: Timestamp.fromDate(startDate),
            initialCount,
            updatedAt: Timestamp.now(),
        })
        revalidatePath("/batches")
        revalidatePath(`/batches/${id}`)
        return { message: "Bande mise à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update batch:", error)
        return { message: "Erreur lors de la mise à jour de la bande" }
    }
}

export async function getBatches() {
    try {
        const q = query(collection(db, "batches"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const batches: Batch[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            batches.push({
                id: doc.id,
                ...data,
                startDate: data.startDate.toDate().toISOString(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Batch)
        })
        return batches
    } catch (error) {
        console.error("Failed to fetch batches:", error)
        return []
    }
}
