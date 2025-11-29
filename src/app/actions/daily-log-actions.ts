"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, Timestamp, runTransaction, where } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { DailyLog } from "@/types"

const dailyLogSchema = z.object({
    batchId: z.string().min(1, "La bande est requise"),
    date: z.string().transform((str) => new Date(str)),
    mortality: z.coerce.number().min(0, "La mortalité ne peut pas être négative"),
    feedConsumed: z.coerce.number().min(0, "L'aliment ne peut pas être négatif"),
    waterConsumed: z.coerce.number().min(0, "L'eau ne peut pas être négative"),
    temperature: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    notes: z.string().optional(),
})

export async function createDailyLog(prevState: any, formData: FormData) {
    const validatedFields = dailyLogSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        mortality: formData.get("mortality"),
        feedConsumed: formData.get("feedConsumed"),
        waterConsumed: formData.get("waterConsumed"),
        temperature: formData.get("temperature") || undefined,
        weight: formData.get("weight") || undefined,
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, mortality, feedConsumed, waterConsumed, temperature, weight, notes } = validatedFields.data

    try {
        await runTransaction(db, async (transaction) => {
            // Read batch data first if needed
            let currentCount = 0
            const batchRef = doc(db, "batches", batchId)

            if (mortality > 0) {
                const batchDoc = await transaction.get(batchRef)
                if (!batchDoc.exists()) {
                    throw "Batch does not exist!"
                }
                currentCount = batchDoc.data().currentCount || 0
            }

            // Create the daily log
            const newLogRef = doc(collection(db, "dailyLogs"))
            transaction.set(newLogRef, {
                batchId,
                date: Timestamp.fromDate(date),
                mortality,
                feedConsumed,
                waterConsumed,
                temperature: temperature ?? null,
                weight: weight ?? null,
                notes: notes ?? null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            })

            // Update batch current count if mortality > 0
            if (mortality > 0) {
                transaction.update(batchRef, {
                    currentCount: currentCount - mortality
                })
            }
        })

        revalidatePath(`/batches/${batchId}`)
        revalidatePath("/batches")
        return { message: "Suivi enregistré avec succès", success: true }
    } catch (error) {
        console.error("Failed to create daily log:", error)
        return { message: "Erreur lors de l'enregistrement du suivi" }
    }
}

export async function updateDailyLog(id: string, prevState: any, formData: FormData) {
    const validatedFields = dailyLogSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        mortality: formData.get("mortality"),
        feedConsumed: formData.get("feedConsumed"),
        waterConsumed: formData.get("waterConsumed"),
        temperature: formData.get("temperature") || undefined,
        weight: formData.get("weight") || undefined,
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, mortality, feedConsumed, waterConsumed, temperature, weight, notes } = validatedFields.data

    try {
        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, "dailyLogs", id)
            const logDoc = await transaction.get(logRef)
            if (!logDoc.exists()) {
                throw "Log does not exist!"
            }

            const oldMortality = logDoc.data().mortality || 0
            const mortalityDiff = mortality - oldMortality

            let currentCount = 0
            const batchRef = doc(db, "batches", batchId)

            if (mortalityDiff !== 0) {
                const batchDoc = await transaction.get(batchRef)
                if (!batchDoc.exists()) {
                    throw "Batch does not exist!"
                }
                currentCount = batchDoc.data().currentCount || 0
            }

            transaction.update(logRef, {
                date: Timestamp.fromDate(date),
                mortality,
                feedConsumed,
                waterConsumed,
                temperature: temperature ?? null,
                weight: weight ?? null,
                notes: notes ?? null,
                updatedAt: Timestamp.now(),
            })

            if (mortalityDiff !== 0) {
                transaction.update(batchRef, {
                    currentCount: currentCount - mortalityDiff
                })
            }
        })

        revalidatePath(`/batches/${batchId}`)
        return { message: "Suivi mis à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update daily log:", error)
        return { message: "Erreur lors de la mise à jour du suivi" }
    }
}

export async function getDailyLogs(batchId: string) {
    try {
        const q = query(
            collection(db, "dailyLogs"),
            where("batchId", "==", batchId),
            orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        const logs: DailyLog[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            logs.push({
                id: doc.id,
                ...data,
                date: data.date.toDate().toISOString(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as DailyLog)
        })
        return logs
    } catch (error) {
        console.error("Failed to fetch daily logs:", error)
        return []
    }
}
