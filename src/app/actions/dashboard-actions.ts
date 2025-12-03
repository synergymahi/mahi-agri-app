"use server"

import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore"
import { Batch, InventoryItem, Sale } from "@/types"

export async function getDashboardStats(userId: string) {
    if (!userId) return {
        totalAnimals: 0,
        activeBatches: 0,
        lowStockItems: 0,
        monthlyRevenue: 0,
        capacityUtilization: null
    }

    try {
        // 1. Fetch Active Batches & Total Animals
        const batchesQuery = query(
            collection(db, "batches"),
            where("userId", "==", userId),
            where("status", "==", "ACTIVE")
        )
        const batchesSnapshot = await getDocs(batchesQuery)
        const activeBatches = batchesSnapshot.size
        let totalAnimals = 0
        batchesSnapshot.forEach(doc => {
            const batch = doc.data() as Batch
            totalAnimals += batch.currentCount || 0
        })

        // 2. Fetch Low Stock Items
        const inventoryQuery = query(
            collection(db, "inventory"),
            where("userId", "==", userId)
        )
        const inventorySnapshot = await getDocs(inventoryQuery)
        let lowStockItems = 0
        inventorySnapshot.forEach(doc => {
            const item = doc.data() as InventoryItem
            if (item.quantity <= item.minThreshold) {
                lowStockItems++
            }
        })

        // 3. Fetch Monthly Revenue
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const salesQuery = query(
            collection(db, "sales"),
            where("userId", "==", userId),
            where("date", ">=", Timestamp.fromDate(firstDayOfMonth))
        )
        const salesSnapshot = await getDocs(salesQuery)
        let monthlyRevenue = 0
        salesSnapshot.forEach(doc => {
            const sale = doc.data() as Sale
            monthlyRevenue += sale.totalAmount || 0
        })

        // 4. Fetch Farm Profile & Calculate Utilization
        const farmQuery = query(collection(db, "farms"), where("userId", "==", userId), limit(1))
        const farmSnapshot = await getDocs(farmQuery)

        let capacityUtilization: any = {
            LAYER: { current: 0, capacity: 0, percentage: 0 },
            BROILER: { current: 0, capacity: 0, percentage: 0 },
            PIG: { current: 0, capacity: 0, percentage: 0 },
        }

        // Calculate current counts per type
        const counts: Record<string, number> = { LAYER: 0, BROILER: 0, PIG: 0 }
        batchesSnapshot.forEach(doc => {
            const batch = doc.data() as Batch
            if (batch.type && counts[batch.type] !== undefined) {
                counts[batch.type] += batch.currentCount || 0
            }
        })

        let capacities: Record<string, number> = {}
        if (!farmSnapshot.empty) {
            const farmData = farmSnapshot.docs[0].data() as any
            capacities = farmData.capacities || {}
        }

        // Calculate percentages
        Object.keys(capacityUtilization).forEach(type => {
            const current = counts[type] || 0
            const capacity = capacities[type] || 0
            capacityUtilization[type] = {
                current,
                capacity,
                percentage: capacity > 0 ? Math.round((current / capacity) * 100) : 0
            }
        })

        return {
            totalAnimals,
            activeBatches,
            lowStockItems,
            monthlyRevenue,
            capacityUtilization
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return {
            totalAnimals: 0,
            activeBatches: 0,
            lowStockItems: 0,
            monthlyRevenue: 0,
            capacityUtilization: null
        }
    }
}

export async function getRecentActivity(userId: string) {
    if (!userId) return []

    try {
        // Fetch recent logs, sales, expenses, etc. mixed? 
        // For now, let's just fetch recent batches created or sales?
        // Let's fetch recent Sales and Expenses for simplicity as "Activity"

        const salesQuery = query(
            collection(db, "sales"),
            where("userId", "==", userId),
            orderBy("date", "desc"),
            limit(5)
        )
        const salesSnapshot = await getDocs(salesQuery)

        const activities = salesSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                type: "SALE",
                description: `Vente: ${data.item}`,
                date: data.date.toDate(),
                amount: data.totalAmount
            }
        })

        return activities
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return []
    }
}
