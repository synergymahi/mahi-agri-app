"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, updateDoc, getDoc, where, deleteDoc } from "firebase/firestore"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Product, Customer, Order, OrderStatus } from "@/types"

// --- Validation Schemas ---

const productSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    category: z.enum(["CROP", "LIVESTOCK", "PROCESSED", "OTHER"]),
    description: z.string().optional(),
    unit: z.string().min(1, "L'unité est requise"),
    price: z.coerce.number().min(0, "Le prix ne peut pas être négatif"),
    region: z.string().optional(),
    stock: z.coerce.number().min(0).optional(),
    images: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
})

const customerSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    type: z.enum(["WHOLESALER", "RETAILER", "RESTAURANT", "INDIVIDUAL"]),
    phone: z.string().min(1, "Le numéro de téléphone est requis"),
    address: z.string().optional(),
})

const orderItemSchema = z.object({
    productId: z.string().min(1),
    productName: z.string().min(1),
    quantity: z.coerce.number().positive(),
    unitPrice: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
})

const orderSchema = z.object({
    customerId: z.string().min(1, "Le client est requis"),
    paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]).optional(),
    paymentReference: z.string().optional(),
    items: z.array(orderItemSchema).min(1, "La commande doit contenir au moins un article"),
    notes: z.string().optional(),
})


// --- Product Actions ---

export async function createProduct(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    // Parse images array from JSON string if present, or handle individual fields if needed
    // In this case, we expect the frontend to send a JSON string for the array
    let images: string[] = []
    try {
        const imagesStr = formData.get("images") as string
        if (imagesStr) {
            images = JSON.parse(imagesStr)
        }
    } catch (e) {
        console.error("Failed to parse images", e)
    }

    // Logic for default image: Use provided imageUrl or first image from array
    let mainImageUrl = formData.get("imageUrl") as string | null
    if (!mainImageUrl && images.length > 0) {
        mainImageUrl = images[0]
    }

    const fields = {
        name: formData.get("name"),
        category: formData.get("category"),
        description: formData.get("description"),
        unit: formData.get("unit"),
        price: formData.get("price"),
        region: formData.get("region"),
        stock: formData.get("stock"),
        imageUrl: mainImageUrl || undefined,
        images: images.length > 0 ? images : undefined,
    }
    console.log("Creating product with fields:", fields)

    const validatedFields = productSchema.safeParse(fields)

    if (!validatedFields.success) {
        console.error("Validation error:", validatedFields.error.flatten().fieldErrors)
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
        }
    }

    try {
        // Prepare data and remove undefined values for Firestore
        const productData: any = {
            ...validatedFields.data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        // Clean undefined values explicitly
        Object.keys(productData).forEach(key =>
            productData[key] === undefined && delete productData[key]
        )

        await addDoc(collection(db, "products"), productData)

        revalidatePath("/commerce")
        return { message: "Produit ajouté au catalogue", success: true }
    } catch (error) {
        console.error("Failed to create product:", error)
        return { message: "Erreur lors de la création du produit" }
    }
}

export async function updateProduct(prevState: any, formData: FormData) {
    const productId = formData.get("id") as string
    const userId = formData.get("userId") as string

    if (!productId || !userId) return { message: "Information manquante" }

    // Parse images array
    let images: string[] = []
    try {
        const imagesStr = formData.get("images") as string
        if (imagesStr) {
            images = JSON.parse(imagesStr)
        }
    } catch (e) {
        console.error("Failed to parse images", e)
    }

    // Default image logic
    let mainImageUrl = formData.get("imageUrl") as string | null
    if (!mainImageUrl && images.length > 0) {
        mainImageUrl = images[0]
    }

    const fields = {
        name: formData.get("name"),
        category: formData.get("category"),
        description: formData.get("description"),
        unit: formData.get("unit"),
        price: formData.get("price"),
        region: formData.get("region"),
        stock: formData.get("stock"),
        imageUrl: mainImageUrl || undefined,
        images: images.length > 0 ? images : undefined,
    }

    const validatedFields = productSchema.safeParse(fields)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        // Prepare data
        const productData: any = {
            ...validatedFields.data,
            updatedAt: Timestamp.now(),
        }

        // Clean undefined
        Object.keys(productData).forEach(key =>
            productData[key] === undefined && delete productData[key]
        )

        const productRef = doc(db, "products", productId)
        await updateDoc(productRef, productData)

        revalidatePath("/commerce")
        return { message: "Produit mis à jour", success: true }
    } catch (error) {
        console.error("Failed to update product:", error)
        return { message: "Erreur lors de la mise à jour" }
    }
}

export async function deleteProduct(productId: string) {
    try {
        await deleteDoc(doc(db, "products", productId))
        revalidatePath("/commerce")
        return { message: "Produit supprimé", success: true }
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { message: "Erreur lors de la suppression" }
    }
}

export async function getProducts(userId: string) {
    if (!userId) return []
    try {
        const q = query(collection(db, "products"), where("userId", "==", userId), orderBy("name"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[]
    } catch (error) {
        console.error("Failed to fetch products:", error)
        return []
    }
}

// --- Customer Actions ---

export async function createCustomer(prevState: any, formData: FormData) {
    const userId = formData.get("userId") as string
    if (!userId) return { message: "Utilisateur non identifié" }

    const validatedFields = customerSchema.safeParse({
        name: formData.get("name"),
        type: formData.get("type"),
        phone: formData.get("phone"),
        address: formData.get("address"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Erreur de validation",
        }
    }

    try {
        await addDoc(collection(db, "customers"), {
            ...validatedFields.data,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })

        revalidatePath("/commerce")
        // Also revalidate orders page if it uses customer list
        revalidatePath("/commerce/orders")
        return { message: "Client ajouté", success: true }
    } catch (error) {
        console.error("Failed to create customer:", error)
        return { message: "Erreur lors de la création du client" }
    }
}

export async function getCustomers(userId: string) {
    if (!userId) return []
    try {
        const q = query(collection(db, "customers"), where("userId", "==", userId), orderBy("name"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Customer[]
    } catch (error) {
        console.error("Failed to fetch customers:", error)
        return []
    }
}


// --- Public Marketplace Actions ---

export async function getAllProducts(filters?: { category?: string, search?: string, maxPrice?: number }) {
    try {
        let q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc")
        )

        // Note: Firestore basic filtering limitations apply. 
        // For advanced search (text + multiple filters), we'd ideally use Algolia or Typesense.
        // For MVP, we'll fetch then filter in memory if complex, or strictly use exact matches.

        // Simple category filter
        if (filters?.category && filters.category !== "ALL") {
            q = query(collection(db, "products"), where("category", "==", filters.category), orderBy("createdAt", "desc"))
        }

        const querySnapshot = await getDocs(q)
        let products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[]

        // In-memory text search (MVP solution)
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase()
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower)
            )
        }

        return products
    } catch (error) {
        console.error("Failed to fetch all products:", error)
        return []
    }
}

export async function getProductById(productId: string) {
    try {
        const docRef = doc(db, "products", productId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            // Also fetch seller info? For now just product.
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate(),
            } as Product
        } else {
            return null
        }
    } catch (error) {
        console.error("Failed to fetch product:", error)
        return null
    }
}
// --- Order Actions ---

export async function createOrder(data: {
    userId: string,
    customerId: string,
    customerName: string,
    items: any[],
    paymentMethod?: string,
    paymentReference?: string,
    notes?: string
}) {
    // Note: Accepting object instead of FormData for complex nested structures (items)
    // In a real app we might parse JSON from formData or use a specific server action signature.

    if (!data.userId) return { message: "Utilisateur non identifié" }

    try {
        // Calculate total
        const totalAmount = data.items.reduce((acc: number, item: any) => acc + item.total, 0)

        const orderData = {
            userId: data.userId,
            customerId: data.customerId,
            customerName: data.customerName,
            items: data.items,
            totalAmount,
            status: "PENDING",
            paymentMethod: data.paymentMethod || null,
            paymentReference: data.paymentReference || null,
            date: Timestamp.now(),
            notes: data.notes || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        await addDoc(collection(db, "orders"), orderData)

        revalidatePath("/commerce/orders")
        return { message: "Commande enregistrée", success: true }
    } catch (error) {
        console.error("Failed to create order:", error)
        return { message: "Erreur lors de l'enregistrement de la commande" }
    }
}

export async function getOrders(userId: string) {
    if (!userId) return []
    try {
        const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Order[]
    } catch (error) {
        console.error("Failed to fetch orders:", error)
        return []
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        const orderRef = doc(db, "orders", orderId)
        await updateDoc(orderRef, {
            status,
            updatedAt: Timestamp.now()
        })
        revalidatePath("/commerce/orders")
        return { message: "Statut mis à jour", success: true }
    } catch (error) {
        console.error("Failed to update order status:", error)
        return { message: "Erreur mise à jour statut" }
    }
}
