export type LivestockType = "LAYER" | "BROILER" | "PIG"
export type BatchStatus = "ACTIVE" | "SOLD" | "CLOSED"

export interface Batch {
    id: string
    userId: string
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
    userId: string
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
    userId: string
    itemId: string
    type: "IN" | "OUT"
    quantity: number
    date: Date
    batchId?: string | null
    cost?: number
    notes?: string | null
    proofUrl?: string | null
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
    userId: string
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
    userId: string
    batchId?: string
    date: Date
    category: string
    amount: number
    notes?: string
    invoiceUrl?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface FarmProfile {
    id: string
    userId: string
    farmName: string
    ownerName: string
    phoneNumber: string
    location: string
    coordinates?: {
        lat: number
        lng: number
    }
    farmingTypes: LivestockType[]
    capacities: Partial<Record<LivestockType, number>>
    createdAt?: Date
    updatedAt?: Date
}



// Crop Module Types

export interface Parcel {
    id: string
    userId: string
    name: string
    area: number // in hectares or m2, maybe let user specify unit or standardize
    unit: "HA" | "M2"
    soilType?: string
    location?: string
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export type CropStatus = "PLANNED" | "ACTIVE" | "HARVESTED" | "FAILED"

export interface Crop {
    id: string
    userId: string
    parcelId: string
    name: string // e.g., "Maïs Zone A"
    variety: string
    startDate: Date // Planting date or planned start
    endDate?: Date // Harvest date
    status: CropStatus
    expectedYield?: number
    actualYield?: number
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}

export type OperationType =
    | "PLOUGHING" // Labour
    | "SOWING" // Semis
    | "FERTILIZATION" // Fertilisation
    | "IRRIGATION" // Irrigation
    | "TREATMENT" // Traitement/Entretien
    | "HARVEST" // Récolte
    | "OTHER"

export interface CropOperation {
    id: string
    userId: string
    cropId: string
    date: Date
    type: OperationType
    description: string
    cost?: number
    notes?: string
    status: "PENDING" | "COMPLETED"
    createdAt?: Date
    updatedAt?: Date
}

// Commerce Module Types

export interface Product {
    id: string
    userId: string
    name: string
    category: "CROP" | "LIVESTOCK" | "PROCESSED" | "OTHER"
    description?: string
    unit: string // kg, sac, tête, etc.
    price: number
    region?: string // Prix recommandé par région ?
    stock?: number
    imageUrl?: string // Deprecated, use images
    images?: string[]
    createdAt?: Date
    updatedAt?: Date
}

export interface Customer {
    id: string
    userId: string
    name: string
    type: "WHOLESALER" | "RETAILER" | "RESTAURANT" | "INDIVIDUAL"
    phone: string
    address?: string
    createdAt?: Date
    updatedAt?: Date
}

export type OrderStatus = "PENDING" | "PAID" | "DELIVERED" | "CANCELLED"

export interface OrderItem {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    total: number
}

export interface Order {
    id: string
    userId: string
    customerId: string
    customerName: string
    items: OrderItem[]
    totalAmount: number
    status: OrderStatus
    paymentMethod?: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER"
    paymentReference?: string // ID Transaction Mobile Money
    date: Date
    notes?: string
    createdAt?: Date
    updatedAt?: Date
}
