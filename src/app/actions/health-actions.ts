"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, where, doc, updateDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { HealthEvent } from "@/types"

const healthEventSchema = z.object({
    batchId: z.string().min(1, "La bande est requise"),
    date: z.string().transform((str) => new Date(str)),
    type: z.enum(["VACCINE", "TREATMENT", "DISEASE"]),
    description: z.string().min(1, "La description est requise"),
    cost: z.coerce.number().min(0, "Le coût ne peut pas être négatif"),
})

export async function createHealthEvent(prevState: any, formData: FormData) {
    const validatedFields = healthEventSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        type: formData.get("type"),
        description: formData.get("description"),
        cost: formData.get("cost"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, type, description, cost } = validatedFields.data

    try {
        await addDoc(collection(db, "healthEvents"), {
            batchId,
            date: Timestamp.fromDate(date),
            type,
            description,
            cost,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath(`/batches/${batchId}`)
        return { message: "Événement santé enregistré avec succès", success: true }
    } catch (error) {
        console.error("Failed to create health event:", error)
    }
}

export async function updateHealthEvent(id: string, prevState: any, formData: FormData) {
    const validatedFields = healthEventSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        type: formData.get("type"),
        description: formData.get("description"),
        cost: formData.get("cost"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, type, description, cost } = validatedFields.data

    try {
        const eventRef = doc(db, "healthEvents", id)
        await updateDoc(eventRef, {
            date: Timestamp.fromDate(date),
            type,
            description,
            cost,
            updatedAt: Timestamp.now(),
        })

        revalidatePath(`/batches/${batchId}`)
        return { message: "Événement santé mis à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update health event:", error)
        return { message: "Erreur lors de la mise à jour de l'événement" }
    }
}

export async function getHealthEvents(batchId: string) {
    try {
        const q = query(
            collection(db, "healthEvents"),
            where("batchId", "==", batchId),
            orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        const events: HealthEvent[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            events.push({
                id: doc.id,
                ...data,
                date: data.date.toDate().toISOString(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as HealthEvent)
        })
        return events
    } catch (error) {
        console.error("Failed to fetch health events:", error)
        return []
    }
}
