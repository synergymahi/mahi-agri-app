"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, getDoc, where, deleteDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Parcel, Crop, CropOperation, CropStatus, OperationType } from "@/types"

// --- Validation Schemas ---

const parcelSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    area: z.coerce.number().positive("La surface doit être positive"),
    unit: z.enum(["HA", "M2"]),
    soilType: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
})

const cropSchema = z.object({
    parcelId: z.string().min(1, "La parcelle est requise"),
    name: z.string().min(1, "Le nom est requis"),
    variety: z.string().min(1, "La variété est requise"),
    startDate: z.string().transform((str) => new Date(str)),
    expectedYield: z.coerce.number().optional(),
    notes: z.string().optional(),
})

const operationSchema = z.object({
    cropId: z.string().min(1, "La culture est requise"),
    date: z.string().transform((str) => new Date(str)),
    type: z.enum(["PLOUGHING", "SOWING", "FERTILIZATION", "IRRIGATION", "TREATMENT", "HARVEST", "OTHER"]),
    description: z.string().min(1, "La description est requise"),
    cost: z.coerce.number().optional(),
    notes: z.string().optional(),
    status: z.enum(["PENDING", "COMPLETED"]).default("PENDING"),
})


// --- Parcel Actions ---

export async function createParcel(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = parcelSchema.safeParse({
        name: formData.get("name"),
        area: formData.get("area"),
        unit: formData.get("unit"),
        soilType: formData.get("soilType"),
        location: formData.get("location"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        await addDoc(collection(db, "parcels"), {
            ...validatedFields.data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/crops")
        return { message: "Parcelle créée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create parcel:", error)
        return { message: "Erreur lors de la création de la parcelle" }
    }
}

export async function getParcels(userId: string) {
    if (!userId) return []

    try {
        const q = query(collection(db, "parcels"), where("userId", "==", userId), orderBy("name"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Parcel[]
    } catch (error) {
        console.error("Failed to fetch parcels:", error)
        return []
    }
}

// --- Crop Actions ---

export async function createCrop(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = cropSchema.safeParse({
        parcelId: formData.get("parcelId"),
        name: formData.get("name"),
        variety: formData.get("variety"),
        startDate: formData.get("startDate"),
        expectedYield: formData.get("expectedYield"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        await addDoc(collection(db, "crops"), {
            ...validatedFields.data,
            userId,
            status: "PLANNED",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/crops")
        return { message: "Culture planifiée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create crop:", error)
        return { message: "Erreur lors de la création de la culture" }
    }
}

export async function getCrops(userId: string) {
    if (!userId) return []
    try {
        const q = query(collection(db, "crops"), where("userId", "==", userId), orderBy("startDate", "desc"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate?.toDate(),
            endDate: doc.data().endDate?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Crop[]
    } catch (error) {
        console.error("Failed to fetch crops:", error)
        return []
    }
}

export async function getCropById(cropId: string) {
    try {
        const docRef = doc(db, "crops", cropId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                startDate: docSnap.data().startDate?.toDate(),
                endDate: docSnap.data().endDate?.toDate(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate(),
            } as Crop
        }
        return null
    } catch (error) {
        console.error("Failed to fetch crop:", error)
        return null
    }
}

// --- Operation Actions ---

export async function createOperation(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = operationSchema.safeParse({
        cropId: formData.get("cropId"),
        date: formData.get("date"),
        type: formData.get("type"),
        description: formData.get("description"),
        cost: formData.get("cost"),
        notes: formData.get("notes"),
        status: formData.get("status"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        await addDoc(collection(db, "crop_operations"), {
            ...validatedFields.data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath(`/crops/${validatedFields.data.cropId}`)
        return { message: "Opération ajoutée avec succès", success: true }
    } catch (error) {
        console.error("Failed to create operation:", error)
        return { message: "Erreur lors de l'ajout de l'opération" }
    }
}

export async function getOperations(cropId: string) {
    try {
        const q = query(collection(db, "crop_operations"), where("cropId", "==", cropId), orderBy("date", "asc"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as CropOperation[]
    } catch (error) {
        console.error("Failed to fetch operations:", error)
        return []
    }
}
