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
