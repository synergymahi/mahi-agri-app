import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Parcel } from "@/types"
import { MapPin, Ruler } from "lucide-react"

interface ParcelCardProps {
    parcel: Parcel
}

export function ParcelCard({ parcel }: ParcelCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {parcel.name}
                </CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {parcel.area} <span className="text-sm font-normal text-muted-foreground">{parcel.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {parcel.location && (
                        <>
                            <MapPin className="h-3 w-3" /> {parcel.location}
                        </>
                    )}
                    {parcel.soilType && (
                        <span className="ml-2"> • Sol: {parcel.soilType}</span>
                    )}
                </div>
                {parcel.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {parcel.notes}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
