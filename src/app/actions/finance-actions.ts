"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Sale, Expense } from "@/types"

const saleSchema = z.object({
    batchId: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    item: z.string().min(1, "L'article est requis"),
    quantity: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    unitPrice: z.coerce.number().min(0, "Le prix unitaire ne peut pas être négatif"),
    notes: z.string().optional(),
})

const expenseSchema = z.object({
    batchId: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    category: z.string().min(1, "La catégorie est requise"),
    amount: z.coerce.number().min(0, "Le montant ne peut pas être négatif"),
    notes: z.string().optional(),
    invoiceUrl: z.string().optional(),
})

export async function createSale(prevState: any, formData: FormData) {
    const validatedFields = saleSchema.safeParse({
        batchId: formData.get("batchId") || undefined,
        date: formData.get("date"),
        item: formData.get("item"),
        quantity: formData.get("quantity"),
        unitPrice: formData.get("unitPrice"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { batchId, date, item, quantity, unitPrice, notes } = validatedFields.data
    const totalAmount = quantity * unitPrice

    try {
        await addDoc(collection(db, "sales"), {
            batchId: batchId || null,
            date: Timestamp.fromDate(date),
            item,
            quantity,
            unitPrice,
            totalAmount,
            notes: notes || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/finance")
        if (batchId) revalidatePath(`/batches/${batchId}`)
        return { message: "Vente enregistrée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create sale:", error)
        return { message: "Erreur lors de l'enregistrement de la vente" }
    }
}

export async function createExpense(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = expenseSchema.safeParse({
        date: formData.get("date"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const data = validatedFields.data

    try {
        await addDoc(collection(db, "expenses"), {
            ...data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/finance")
        return { message: "Dépense enregistrée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create expense:", error)
        return { message: "Erreur lors de l'enregistrement de la dépense" }
    }
}

export async function getSales(userId?: string) {
    if (!userId) return []

    try {
        const q = query(collection(db, "sales"), where("userId", "==", userId), orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate(), // Convert Firestore Timestamp to Date
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Sale
        })
    } catch (error) {
        console.error("Failed to fetch sales:", error)
        return []
    }
}

export async function getExpenses(userId?: string) {
    if (!userId) return []

    try {
        const q = query(collection(db, "expenses"), where("userId", "==", userId), orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Expense
        })
    } catch (error) {
        console.error("Failed to fetch expenses:", error)
        return []
    }
}

export async function getSalesByBatch(batchId: string) {
    try {
        const q = query(
            collection(db, "sales"),
            where("batchId", "==", batchId),
            orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        const sales: Sale[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            sales.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Sale)
        })
        return sales
    } catch (error) {
        console.error("Failed to fetch batch sales:", error)
        return []
    }
}
