"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, getDoc, where, runTransaction, deleteDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { InventoryItem, InventoryTransaction } from "@/types"

const inventoryItemSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    type: z.enum(["FEED", "MEDICATION", "EQUIPMENT", "OTHER"]),
    quantity: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
    unit: z.string().min(1, "L'unité est requise"),
    minThreshold: z.coerce.number().min(0, "Le seuil ne peut pas être négatif"),
    currentMarketPrice: z.coerce.number().optional(),
})

const transactionSchema = z.object({
    itemId: z.string().min(1, "L'article est requis"),
    type: z.enum(["IN", "OUT"]),
    quantity: z.coerce.number().positive("La quantité doit être positive"),
    date: z.string().transform((str) => new Date(str)),
    batchId: z.string().optional().nullable(),
    cost: z.coerce.number().optional(),
    notes: z.string().optional(),
    proofUrl: z.string().optional().nullable(),
})

export async function createInventoryItem(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = inventoryItemSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        minThreshold: formData.get("minThreshold"),
        currentMarketPrice: formData.get("currentMarketPrice"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const data = validatedFields.data

    try {
        await addDoc(collection(db, "inventory"), {
            ...data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/inventory")
        return { message: "Article ajouté avec succès", success: true }
    } catch (error) {
        console.error("Failed to create inventory item:", error)
        return { message: "Erreur lors de l'ajout de l'article" }
    }
}

export async function updateInventoryItem(prevState: any, formData: FormData) {
    const id = formData.get("id") as string
    const userId = formData.get("userId") as string

    if (!id || !userId) return { message: "Information manquante" }

    const validatedFields = inventoryItemSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        quantity: formData.get("quantity"),
        unit: formData.get("unit"),
        minThreshold: formData.get("minThreshold"),
        currentMarketPrice: formData.get("currentMarketPrice"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        const itemRef = doc(db, "inventory", id)
        await updateDoc(itemRef, {
            ...validatedFields.data,
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/inventory")
        return { message: "Article mis à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update inventory item:", error)
        return { message: "Erreur lors de la mise à jour de l'article" }
    }
}

export async function deleteInventoryItem(itemId: string) {
    if (!itemId) return { message: "ID manquant" }

    try {
        // Check for dependencies? For now, we allow deletion but maybe warn user?
        // Ideally we should check if there are transactions linked to this item.
        // But for MVP/Polish, direct delete is acceptable if user confirms.

        await deleteDoc(doc(db, "inventory", itemId))
        revalidatePath("/inventory")
        return { message: "Article supprimé avec succès", success: true }
    } catch (error) {
        console.error("Failed to delete inventory item:", error)
        return { message: "Erreur lors de la suppression de l'article" }
    }
}

export async function getInventoryItems(userId?: string) {
    if (!userId) return []

    try {
        const q = query(collection(db, "inventory"), where("userId", "==", userId), orderBy("name"))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as InventoryItem
        })
    } catch (error) {
        console.error("Failed to fetch inventory items:", error)
        return []
    }
}

// Note: Transactions are linked to items, which are linked to users. 
// But for safety and easier querying, we should also add userId to transactions.
export async function createTransaction(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = transactionSchema.safeParse({
        itemId: formData.get("itemId"),
        type: formData.get("type"),
        quantity: formData.get("quantity"),
        date: formData.get("date"),
        batchId: formData.get("batchId"), // Keep batchId as it's in the schema
        notes: formData.get("notes"),
        cost: formData.get("cost"),
        proofUrl: formData.get("proofUrl"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const data = validatedFields.data

    try {
        await runTransaction(db, async (transaction) => {
            const itemRef = doc(db, "inventory", data.itemId)
            const itemDoc = await transaction.get(itemRef)

            if (!itemDoc.exists()) {
                throw "Item does not exist!"
            }

            const currentQty = itemDoc.data().quantity || 0
            const newQty = data.type === "IN"
                ? currentQty + data.quantity
                : currentQty - data.quantity

            if (newQty < 0) {
                throw "Stock insuffisant !"
            }

            // Create Transaction Record
            const newTransactionRef = doc(collection(db, "inventory_transactions"))
            transaction.set(newTransactionRef, {
                ...data,
                date: Timestamp.fromDate(data.date),
                userId,
                createdAt: Timestamp.now(),
            })

            // Update Inventory Item Quantity
            transaction.update(itemRef, {
                quantity: newQty,
                updatedAt: Timestamp.now()
            })
        })

        revalidatePath("/inventory")
        return { message: "Transaction enregistrée", success: true }
    } catch (error) {
        console.error("Failed to create transaction:", error)
        return { message: typeof error === 'string' ? error : "Erreur lors de la transaction" }
    }
}


export async function getInventoryTransactions(itemId: string) {
    try {
        const q = query(
            collection(db, "inventory_transactions"),
            where("itemId", "==", itemId),
            orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        const transactions: InventoryTransaction[] = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            transactions.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate(),
                createdAt: data.createdAt?.toDate(),
            } as InventoryTransaction)
        })
        return transactions
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return []
    }
}

export async function updateInventoryTransaction(prevState: any, formData: FormData) {
    const transactionId = formData.get("transactionId") as string

    const validatedFields = transactionSchema.safeParse({
        itemId: formData.get("itemId"),
        type: formData.get("type"),
        quantity: formData.get("quantity"),
        date: formData.get("date"),
        batchId: formData.get("batchId"),
        cost: formData.get("cost"),
        notes: formData.get("notes"),
        proofUrl: formData.get("proofUrl"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    const { itemId, type, quantity, date, batchId, cost, notes, proofUrl } = validatedFields.data

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get the existing transaction
            const transactionRef = doc(db, "inventory_transactions", transactionId)
            const transactionDoc = await transaction.get(transactionRef)

            if (!transactionDoc.exists()) {
                throw "Transaction does not exist!"
            }

            const oldData = transactionDoc.data()
            const oldQuantity = oldData.quantity
            const oldType = oldData.type

            // 2. Get the inventory item
            const itemRef = doc(db, "inventory", itemId)
            const itemDoc = await transaction.get(itemRef)

            if (!itemDoc.exists()) {
                throw "Item does not exist!"
            }

            let currentStock = itemDoc.data().quantity || 0

            // 3. Revert the old transaction effect
            // If old was IN, we subtract. If old was OUT, we add.
            if (oldType === "IN") {
                currentStock -= oldQuantity
            } else {
                currentStock += oldQuantity
            }

            // 4. Apply the new transaction effect
            // If new is IN, we add. If new is OUT, we subtract.
            if (type === "IN") {
                currentStock += quantity
            } else {
                currentStock -= quantity
            }

            if (currentStock < 0) {
                throw "Impossible de modifier : le stock deviendrait négatif !"
            }

            // 5. Update the transaction record
            transaction.update(transactionRef, {
                type,
                quantity,
                date: Timestamp.fromDate(date),
                batchId: batchId || null,
                cost: cost || 0,
                notes: notes || null,
                proofUrl: proofUrl || null,
            })

            // 6. Update the inventory item stock
            transaction.update(itemRef, {
                quantity: currentStock,
                updatedAt: Timestamp.now(),
            })
        })

        revalidatePath("/inventory")
        return { message: "Transaction mise à jour avec succès", success: true }
    } catch (error) {
        console.error("Failed to update transaction:", error)
        return { message: typeof error === 'string' ? error : "Erreur lors de la mise à jour" }
    }
}
