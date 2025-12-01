"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ReproductionRecord } from "@/types"

const reproductionSchema = z.object({
    batchId: z.string().min(1, "Le lot est requis"),
    date: z.string().transform((str) => new Date(str)),
    quantityCollected: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    damagedQuantity: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    notes: z.string().min(1, "Les notes sont requises"),
})

export async function createReproductionRecord(prevState: any, formData: FormData) {
    const validatedFields = reproductionSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        quantityCollected: formData.get("quantityCollected"),
        damagedQuantity: formData.get("damagedQuantity"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, quantityCollected, damagedQuantity, notes } = validatedFields.data

    try {
        await addDoc(collection(db, "reproductionRecords"), {
            batchId,
            date: Timestamp.fromDate(date),
            quantityCollected,
            damagedQuantity,
            notes: notes || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath(`/batches/${batchId}`)
        return { message: "Production enregistrée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create reproduction record:", error)
        return { message: "Erreur lors de l'enregistrement" }
    }
}

export async function getReproductionRecords(batchId: string) {
    try {
        const q = query(
            collection(db, "reproductionRecords"),
            where("batchId", "==", batchId),
            orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        const records: ReproductionRecord[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            records.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as ReproductionRecord)
        })
        return records
    } catch (error) {
        console.error("Failed to fetch reproduction records:", error)
        return []
    }
}

export async function updateReproductionRecord(prevState: any, formData: FormData) {
    const id = formData.get("id") as string
    const batchId = formData.get("batchId") as string

    const validatedFields = reproductionSchema.safeParse({
        batchId: formData.get("batchId"),
        date: formData.get("date"),
        quantityCollected: formData.get("quantityCollected"),
        damagedQuantity: formData.get("damagedQuantity"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { date, quantityCollected, damagedQuantity, notes } = validatedFields.data

    try {
        const recordRef = doc(db, "reproductionRecords", id)
        await updateDoc(recordRef, {
            date: Timestamp.fromDate(date),
            quantityCollected,
            damagedQuantity,
            notes: notes || null,
            updatedAt: Timestamp.now(),
        })

        revalidatePath(`/batches/${batchId}`)
        return { message: "Mise à jour effectuée", success: true }
    } catch (error) {
        console.error("Failed to update reproduction record:", error)
        return { message: "Erreur lors de la mise à jour" }
    }
}
