"use server"

import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Batch } from "@/types"

export async function getBatch(id: string) {
    try {
        const docRef = doc(db, "batches", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                startDate: data.startDate.toDate().toISOString(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as Batch
        } else {
            return null
        }
    } catch (error) {
        console.error("Failed to fetch batch:", error)
        return null
    }
}
