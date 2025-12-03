"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CapacityData {
    current: number
    capacity: number
    percentage: number
}

interface CapacityIndicatorProps {
    data: {
        LAYER?: CapacityData
        BROILER?: CapacityData
        PIG?: CapacityData
    } | null
}

export function CapacityIndicator({ data }: CapacityIndicatorProps) {
    if (!data) return null

    // Only show types that have a capacity defined > 0 or current > 0
    const activeTypes = Object.entries(data).filter(([_, val]) => val && (val.capacity > 0 || val.current > 0))

    if (activeTypes.length === 0) return null

    const getLabel = (type: string) => {
        switch (type) {
            case "LAYER": return "Poules Pondeuses"
            case "BROILER": return "Poulets de Chair"
            case "PIG": return "Porcs"
            default: return type
        }
    }

    const getColor = (percentage: number) => {
        if (percentage > 100) return "bg-red-500"
        if (percentage >= 90) return "bg-amber-500"
        return "bg-primary"
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Capacité de la Ferme</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Taux d'occupation par rapport à la capacité déclarée.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {activeTypes.map(([type, val]) => (
                    <div key={type} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{getLabel(type)}</span>
                            <span className="text-muted-foreground">
                                {val.current} / {val.capacity} ({val.percentage}%)
                            </span>
                        </div>
                        <Progress
                            value={Math.min(val.percentage, 100)}
                            className="h-2"
                            indicatorClassName={getColor(val.percentage)}
                        />
                        {val.percentage > 100 && (
                            <p className="text-[10px] text-red-500 font-medium">
                                Surexploitation détectée !
                            </p>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
