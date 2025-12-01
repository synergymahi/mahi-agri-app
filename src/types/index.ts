export type LivestockType = "LAYER" | "BROILER" | "PIG"
export type BatchStatus = "ACTIVE" | "SOLD" | "CLOSED"

export interface Batch {
    id: string
    type: LivestockType
    name: string
    startDate: string | Date // Firestore timestamps might need conversion
    initialCount: number
    currentCount: number
    status: BatchStatus
    createdAt?: Date
    updatedAt?: Date
}

export interface DailyLog {
    id: string
    batchId: string
    date: string | Date
    mortality: number
    feedConsumed: number
    waterConsumed: number
    temperature?: number
    weight?: number
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface HealthEvent {
    id: string
    batchId: string
    date: string | Date
    type: "VACCINE" | "TREATMENT" | "DISEASE"
    description: string
    cost: number
    createdAt?: Date
    updatedAt?: Date
}

export interface InventoryItem {
    id: string
    name: string
    type: "FEED" | "MEDICATION" | "EQUIPMENT" | "OTHER"
    quantity: number
    unit: string
    minThreshold: number
    currentMarketPrice?: number
    createdAt?: Date
    updatedAt?: Date
}

export interface InventoryTransaction {
    id: string
    itemId: string
    type: "IN" | "OUT"
    quantity: number
    date: Date
    batchId?: string | null
    cost?: number
    notes?: string | null
    createdAt?: Date
}

export interface ReproductionRecord {
    id: string
    batchId: string
    date: Date
    quantityCollected: number
    damagedQuantity: number
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface Sale {
    id: string
    batchId?: string
    date: Date
    item: string
    quantity: number
    unitPrice: number
    totalAmount: number
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface Expense {
    id: string
    batchId?: string
    date: Date
    category: string
    amount: number
    notes?: string
    invoiceUrl?: string
    createdAt?: Date
    updatedAt?: Date
}


